import fs from 'node:fs/promises';
import { pathToFileURL } from 'node:url';
import { createCJReadOnlyClient } from './cj-api-limiter.mjs';
import { matchesIntendedProduct } from './cj-match-policy.mjs';
import { freightRequest, parseCJFreight } from './cj-freight-policy.mjs';
import { selectRotatingCandidates } from './candidate-rotation.mjs';

export function positiveNumber(value) {
  if (value === null || value === undefined || typeof value === 'boolean' || String(value).trim() === '') return null;
  const n = Number(value);
  return Number.isFinite(n) && n > 0 ? n : null;
}

export function chooseProduct(products, candidate) {
  return (Array.isArray(products) ? products : []).filter(item =>
    String(item?.saleStatus) === '3' &&
    positiveNumber(item?.nowPrice ?? item?.discountPrice ?? item?.sellPrice) !== null &&
    matchesIntendedProduct(candidate, item?.nameEn)
  ).sort((a,b) => Number(b?.totalVerifiedInventory || 0) - Number(a?.totalVerifiedInventory || 0))[0] || null;
}

function productName(item = {}) {
  return String(item?.nameEn ?? item?.productNameEn ?? item?.productName ?? item?.name ?? '').trim();
}

function productId(item = {}) {
  const value = item?.id ?? item?.pid ?? item?.productId;
  return value === null || value === undefined ? '' : String(value).trim();
}

function productSku(item = {}) {
  return String(item?.sku ?? item?.productSku ?? item?.spu ?? '').trim();
}

function unwrapKnownProduct(payload) {
  const data = payload?.data;
  if (Array.isArray(data)) return data.find(Boolean) || null;
  if (data && typeof data === 'object') {
    if (Array.isArray(data.productList)) return data.productList.find(Boolean) || null;
    if (Array.isArray(data.content)) {
      for (const group of data.content) {
        if (Array.isArray(group?.productList) && group.productList.length) return group.productList[0];
      }
    }
    return data;
  }
  return null;
}

export function normalizeKnownProduct(payload, candidate = {}) {
  const item = unwrapKnownProduct(payload);
  if (!item) return null;
  const id = productId(item);
  const nameEn = productName(item);
  const returnedSku = productSku(item);
  const expectedSku = String(candidate?.exactSupplierSku || '').trim();
  if (!id || !nameEn || !matchesIntendedProduct(candidate, nameEn)) return null;
  if (item?.saleStatus !== null && item?.saleStatus !== undefined && String(item.saleStatus) !== '3') return null;
  if (expectedSku && returnedSku && returnedSku !== expectedSku) return null;
  return {
    ...item,
    id,
    nameEn,
    sku: returnedSku || expectedSku || null,
    knownIdentitySource: candidate?.exactVariantSku ? 'variant_sku_query' : 'product_sku_query',
    knownSupplierSkuExpected: expectedSku || null,
    knownSupplierSkuEchoed: Boolean(expectedSku && returnedSku === expectedSku),
  };
}

export function candidateVariantChoices(rows, candidate = {}) {
  const variants = (Array.isArray(rows) ? rows : []).filter(choice => choice?.vid && positiveNumber(choice?.variantSellPrice) !== null);
  const exactVariantSku = String(candidate?.exactVariantSku || '').trim();
  if (!exactVariantSku) return variants.slice(0, 8);
  return variants.filter(choice => String(choice?.variantSku || '').trim() === exactVariantSku).slice(0, 1);
}

export function chooseStock(rows, vid) {
  const valid=(Array.isArray(rows)?rows:[]).filter(r => String(r?.vid||'')===String(vid) && /^[A-Z]{2}$/.test(String(r?.countryCode||'').toUpperCase()) && Number(r?.totalInventoryNum||0)>=10 && Number(r?.cjInventoryNum||0)>=1);
  const rank=c=>c==='US'?0:c==='CN'?1:2;
  valid.sort((a,b)=>rank(String(a.countryCode).toUpperCase())-rank(String(b.countryCode).toUpperCase()) || Number(b.cjInventoryNum||0)-Number(a.cjInventoryNum||0));
  return valid[0]||null;
}

export function buildPackScreening(productCostUsd, quantity, freight = {offers:[]}) {
  const unitCost=positiveNumber(productCostUsd);
  const qty=Number(quantity);
  if(!unitCost || !Number.isInteger(qty) || qty<1 || qty>25) return {quantity:qty,priced:false,reason:'invalid_pack_inputs'};
  const shipping=positiveNumber(freight?.offers?.[0]?.usd);
  if(!shipping) return {quantity:qty,priced:false,reason:'priced_freight_required'};
  const productCostTotal=unitCost*qty;
  const landed=productCostTotal+shipping;
  return {
    quantity:qty,
    priced:true,
    productCostTotalUsd:+productCostTotal.toFixed(2),
    lowestFreightUsd:+shipping.toFixed(2),
    freightPerUnitUsd:+(shipping/qty).toFixed(2),
    landedCostUsd:+landed.toFixed(2),
    landedCostPerUnitUsd:+(landed/qty).toFixed(2),
    freightMethod:freight.offers[0]?.name||null,
    aging:freight.offers[0]?.aging||null,
    finalDestinationVerified:false,
  };
}

function flatten(payload) {
  const groups=payload?.data?.content;
  return Array.isArray(groups)?groups.flatMap(g=>Array.isArray(g?.productList)?g.productList:[]):[];
}

function headers(token){ return {'CJ-Access-Token':token,'Content-Type':'application/json','User-Agent':'PrismBay-Paperclip-Sourcing/1.3'}; }

async function lookupKnownProduct({client,base,token,candidate}) {
  const exactVariantSku=String(candidate?.exactVariantSku||'').trim();
  const exactSupplierSku=String(candidate?.exactSupplierSku||'').trim();
  if(!exactVariantSku && !exactSupplierSku) return {attempted:false,product:null,scope:null};
  const url=new URL(base+'/product/query');
  if(exactVariantSku) url.searchParams.set('variantSku',exactVariantSku);
  else url.searchParams.set('productSku',exactSupplierSku);
  try {
    const payload=await client(url,{headers:headers(token)});
    const product=normalizeKnownProduct(payload,candidate);
    return {attempted:true,product,scope:product?(exactVariantSku?'known_variant_sku':'known_product_sku'):null};
  } catch {
    return {attempted:true,product:null,scope:null};
  }
}

export async function sourceCandidate({client,base,token,candidate}) {
  const known=await lookupKnownProduct({client,base,token,candidate});
  let product=known.product;
  let searchScope=known.scope;
  if(!product){
    for (const requireUs of [true,false]) {
      for (const query of (candidate.queries||[candidate.query]).slice(0,2)) {
        const url=new URL(base+'/product/listV2');
        url.searchParams.set('page','1'); url.searchParams.set('size','20'); url.searchParams.set('keyWord',query);
        url.searchParams.set('sort','desc'); url.searchParams.set('orderBy','1'); url.searchParams.append('features','enable_category');
        if(requireUs){ url.searchParams.set('countryCode','US'); url.searchParams.set('startWarehouseInventory','10'); url.searchParams.set('verifiedWarehouse','1'); }
        try { product=chooseProduct(flatten(await client(url,{headers:headers(token)})),candidate); } catch { product=null; }
        if(product){ searchScope=requireUs?'us_verified_warehouse':'global_fallback'; break; }
      }
      if(product) break;
    }
  }
  const baseResult={
    slug:candidate.slug,
    candidate:candidate.name,
    researchScore:candidate.researchScore,
    searchScope,
    knownIdentityAttempted:known.attempted,
    knownIdentityRevalidated:Boolean(known.product),
    supplierVerified:Boolean(product),
    variantInventoryVerified:false,
    freightVerified:false,
    commercialState:'research_only'
  };
  if(!product) return {...baseResult,status:known.attempted?'known_identity_unavailable_fallback_failed':'supplier_match_not_found'};

  let variant=null,stock=null,variantChoices=[];
  try {
    const vurl=new URL(base+'/product/variant/query'); vurl.searchParams.set('pid',String(product.id));
    const vr=await client(vurl,{headers:headers(token)});
    variantChoices=candidateVariantChoices(vr?.data,candidate);
    for(const choice of variantChoices){
      const surl=new URL(base+'/product/stock/queryByVid'); surl.searchParams.set('vid',String(choice.vid));
      let sr; try{sr=await client(surl,{headers:headers(token)});}catch{continue;}
      const picked=chooseStock(sr?.data,choice.vid); if(!picked) continue;
      variant=choice; stock=picked; break;
    }
  } catch {}
  const exactVariantRequired=Boolean(String(candidate?.exactVariantSku||'').trim());
  const productCostUsd=positiveNumber(variant?.variantSellPrice) ?? positiveNumber(variantChoices[0]?.variantSellPrice) ?? positiveNumber(product?.nowPrice ?? product?.discountPrice ?? product?.sellPrice);
  const inventory=stock?Number(stock.cjInventoryNum||0):null;
  const variantStatus=variant&&stock?'variant_stock_verified':exactVariantRequired?'known_variant_stock_required':'variant_stock_required';
  const result={...baseResult,status:variantStatus,variantInventoryVerified:Boolean(variant&&stock),product:{
    id:String(product.id),
    name:product.nameEn,
    sku:product.sku||product.productSku||product.spu||candidate.exactSupplierSku||null,
    variantId:variant?.vid||variantChoices[0]?.vid||null,
    variantSku:variant?.variantSku||variantChoices[0]?.variantSku||candidate.exactVariantSku||null,
    exactVariantRequired,
    originCountryCode:stock?String(stock.countryCode).toUpperCase():null,
    productCostUsd,
    inventory
  }};
  if(!variant||!stock) return result;

  const packFreightScreening=[];
  let singleFreight={offers:[],diagnostic:'quote_unavailable'};
  for(const quantity of [1,3,5]){
    if(Number.isFinite(inventory) && inventory<quantity){
      packFreightScreening.push({quantity,priced:false,reason:'verified_origin_inventory_below_pack_quantity'});
      continue;
    }
    let freight={offers:[],diagnostic:'quote_unavailable'};
    try {
      const payload=await client(base+'/logistic/freightCalculate',{method:'POST',headers:headers(token),body:JSON.stringify(freightRequest(String(variant.vid),null,String(stock.countryCode).toUpperCase(),quantity))});
      freight=parseCJFreight(payload,'country_estimate');
    } catch {}
    if(quantity===1) singleFreight=freight;
    packFreightScreening.push(buildPackScreening(productCostUsd,quantity,freight));
  }
  const pricedPacks=packFreightScreening.filter(x=>x.priced);
  return {...result,
    status:pricedPacks.length?'supplier_cost_and_pack_freight_ready':'freight_estimate_required',
    freightVerified:singleFreight.offers.length>0,
    freight:singleFreight,
    lowestFreightUsd:singleFreight.offers[0]?.usd??null,
    packFreightScreening,
    bestScreenedLandedPerUnitUsd:pricedPacks.length?Math.min(...pricedPacks.map(x=>x.landedCostPerUnitUsd)):null,
    note:'Country freight is screening evidence only. Exact buyer destination freight, current retail validation and full unit economics are still required before launch.'};
}

export async function main(){
  const apiKey=String(process.env.CJ_API_KEY||'').trim(); if(!apiKey) throw new Error('CJ_API_KEY is required');
  const client=createCJReadOnlyClient(); const base='https://developers.cjdropshipping.com/api2.0/v1';
  const auth=await client(base+'/authentication/getAccessToken',{method:'POST',headers:{'Content-Type':'application/json','User-Agent':'PrismBay-Paperclip-Sourcing/1.3'},body:JSON.stringify({apiKey})});
  const token=String(auth?.data?.accessToken||''); if(!token) throw new Error('CJ authentication returned no access token'); console.log('::add-mask::'+token);
  const catalog=JSON.parse(await fs.readFile('paperclip/prismbay-global-commerce/research/supplier-candidates.json','utf8'));
  const rotation=selectRotatingCandidates(catalog.candidates||[],{
    batchSize:Number(process.env.PAPERCLIP_CJ_BATCH_SIZE||5),
    anchorCount:Number(process.env.PAPERCLIP_CJ_ANCHOR_COUNT||2),
    slot:process.env.PAPERCLIP_CJ_ROTATION_SLOT,
  });
  const results=[]; for(const candidate of rotation.selected) results.push(await sourceCandidate({client,base,token,candidate}));
  const report={
    schemaVersion:4,
    checkedAt:new Date().toISOString(),
    market:catalog.market||'US',
    mode:'paperclip_global_commerce_read_only',
    catalogCandidateCount:Array.isArray(catalog.candidates)?catalog.candidates.length:0,
    candidateCount:results.length,
    rotation:{slot:rotation.slot,batchSize:rotation.batchSize,anchorCount:rotation.anchorCount,rotatingPoolSize:rotation.rotatingPoolSize,offset:rotation.offset,selectedSlugs:rotation.selected.map(x=>x.slug)},
    knownIdentityAttempts:results.filter(x=>x.knownIdentityAttempted).length,
    knownIdentityRevalidations:results.filter(x=>x.knownIdentityRevalidated).length,
    supplierMatches:results.filter(x=>x.supplierVerified).length,
    verifiedVariants:results.filter(x=>x.variantInventoryVerified).length,
    freightEstimates:results.filter(x=>x.freightVerified).length,
    ordersEnabled:false,
    listingsEnabled:false,
    profitReadyCount:0,
    results,
  };
  await fs.mkdir('growth-reports',{recursive:true}); await fs.writeFile('growth-reports/paperclip-cj-sourcing.json',JSON.stringify(report,null,2)+'\n');
  console.log(JSON.stringify({catalogCandidateCount:report.catalogCandidateCount,candidateCount:report.candidateCount,rotation:report.rotation,knownIdentityAttempts:report.knownIdentityAttempts,knownIdentityRevalidations:report.knownIdentityRevalidations,supplierMatches:report.supplierMatches,verifiedVariants:report.verifiedVariants,freightEstimates:report.freightEstimates,results:results.map(r=>({slug:r.slug,status:r.status,searchScope:r.searchScope,knownIdentityRevalidated:r.knownIdentityRevalidated,productCostUsd:r.product?.productCostUsd??null,variantSku:r.product?.variantSku??null,lowestFreightUsd:r.lowestFreightUsd??null,packFreightScreening:r.packFreightScreening??[]}))},null,2));
  return report;
}
if(process.argv[1]&&import.meta.url===pathToFileURL(process.argv[1]).href) await main();
