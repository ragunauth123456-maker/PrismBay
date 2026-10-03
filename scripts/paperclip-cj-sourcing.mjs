import fs from 'node:fs/promises';
import { pathToFileURL } from 'node:url';
import { createCJReadOnlyClient } from './cj-api-limiter.mjs';
import { matchesIntendedProduct } from './cj-match-policy.mjs';
import { freightRequest, parseCJFreight } from './cj-freight-policy.mjs';

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

export function chooseStock(rows, vid) {
  const valid=(Array.isArray(rows)?rows:[]).filter(r => String(r?.vid||'')===String(vid) && /^[A-Z]{2}$/.test(String(r?.countryCode||'').toUpperCase()) && Number(r?.totalInventoryNum||0)>=10 && Number(r?.cjInventoryNum||0)>=1);
  const rank=c=>c==='US'?0:c==='CN'?1:2;
  valid.sort((a,b)=>rank(String(a.countryCode).toUpperCase())-rank(String(b.countryCode).toUpperCase()) || Number(b.cjInventoryNum||0)-Number(a.cjInventoryNum||0));
  return valid[0]||null;
}

function flatten(payload) {
  const groups=payload?.data?.content;
  return Array.isArray(groups)?groups.flatMap(g=>Array.isArray(g?.productList)?g.productList:[]):[];
}

function headers(token){ return {'CJ-Access-Token':token,'Content-Type':'application/json','User-Agent':'PrismBay-Paperclip-Sourcing/1.0'}; }

export async function sourceCandidate({client,base,token,candidate}) {
  let product=null;
  let searchScope=null;
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
  const baseResult={slug:candidate.slug,candidate:candidate.name,researchScore:candidate.researchScore,searchScope,supplierVerified:Boolean(product),variantInventoryVerified:false,freightVerified:false,commercialState:'research_only'};
  if(!product) return {...baseResult,status:'supplier_match_not_found'};

  let variant=null,stock=null;
  try {
    const vurl=new URL(base+'/product/variant/query'); vurl.searchParams.set('pid',String(product.id));
    const vr=await client(vurl,{headers:headers(token)});
    for(const choice of (Array.isArray(vr?.data)?vr.data:[]).slice(0,8)){
      if(!choice?.vid || positiveNumber(choice?.variantSellPrice)===null) continue;
      const surl=new URL(base+'/product/stock/queryByVid'); surl.searchParams.set('vid',String(choice.vid));
      let sr; try{sr=await client(surl,{headers:headers(token)});}catch{continue;}
      const picked=chooseStock(sr?.data,choice.vid); if(!picked) continue;
      variant=choice; stock=picked; break;
    }
  } catch {}
  const productCostUsd=positiveNumber(variant?.variantSellPrice) ?? positiveNumber(product?.nowPrice ?? product?.discountPrice ?? product?.sellPrice);
  const result={...baseResult,status:variant&&stock?'variant_stock_verified':'variant_stock_required',variantInventoryVerified:Boolean(variant&&stock),product:{id:String(product.id),name:product.nameEn,sku:product.sku||product.spu||null,variantId:variant?.vid||null,variantSku:variant?.variantSku||null,originCountryCode:stock?String(stock.countryCode).toUpperCase():null,productCostUsd,inventory:stock?Number(stock.cjInventoryNum||0):null}};
  if(!variant||!stock) return result;

  let freight={offers:[],diagnostic:'quote_unavailable'};
  try {
    const payload=await client(base+'/logistic/freightCalculate',{method:'POST',headers:headers(token),body:JSON.stringify(freightRequest(String(variant.vid),null,String(stock.countryCode).toUpperCase()))});
    freight=parseCJFreight(payload,'country_estimate');
  } catch {}
  return {...result,status:freight.offers.length?'supplier_cost_and_freight_estimate_ready':'freight_estimate_required',freightVerified:freight.offers.length>0,freight,lowestFreightUsd:freight.offers[0]?.usd??null,note:'Country freight is screening evidence only. Exact buyer destination freight and full unit economics are still required before launch.'};
}

export async function main(){
  const apiKey=String(process.env.CJ_API_KEY||'').trim(); if(!apiKey) throw new Error('CJ_API_KEY is required');
  const client=createCJReadOnlyClient(); const base='https://developers.cjdropshipping.com/api2.0/v1';
  const auth=await client(base+'/authentication/getAccessToken',{method:'POST',headers:{'Content-Type':'application/json','User-Agent':'PrismBay-Paperclip-Sourcing/1.0'},body:JSON.stringify({apiKey})});
  const token=String(auth?.data?.accessToken||''); if(!token) throw new Error('CJ authentication returned no access token'); console.log('::add-mask::'+token);
  const catalog=JSON.parse(await fs.readFile('paperclip/prismbay-global-commerce/research/supplier-candidates.json','utf8'));
  const results=[]; for(const candidate of (catalog.candidates||[]).slice(0,5)) results.push(await sourceCandidate({client,base,token,candidate}));
  const report={schemaVersion:1,checkedAt:new Date().toISOString(),market:catalog.market||'US',mode:'paperclip_global_commerce_read_only',candidateCount:results.length,supplierMatches:results.filter(x=>x.supplierVerified).length,verifiedVariants:results.filter(x=>x.variantInventoryVerified).length,freightEstimates:results.filter(x=>x.freightVerified).length,ordersEnabled:false,listingsEnabled:false,profitReadyCount:0,results};
  await fs.mkdir('growth-reports',{recursive:true}); await fs.writeFile('growth-reports/paperclip-cj-sourcing.json',JSON.stringify(report,null,2)+'\n');
  console.log(JSON.stringify({candidateCount:report.candidateCount,supplierMatches:report.supplierMatches,verifiedVariants:report.verifiedVariants,freightEstimates:report.freightEstimates,results:results.map(r=>({slug:r.slug,status:r.status,productCostUsd:r.product?.productCostUsd??null,lowestFreightUsd:r.lowestFreightUsd??null}))},null,2));
  return report;
}
if(process.argv[1]&&import.meta.url===pathToFileURL(process.argv[1]).href) await main();
