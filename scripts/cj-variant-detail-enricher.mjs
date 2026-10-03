import fs from 'node:fs/promises';
import { pathToFileURL } from 'node:url';
import { createCJReadOnlyClient } from './cj-api-limiter.mjs';

const SAFE_FIELDS = [
  'vid','variantSku','variantName','variantNameEn','variantKey','variantSellPrice','variantWeight',
  'variantLength','variantWidth','variantHeight','variantVolume','variantProperty','variantStandard','variantImage'
];

export function sanitizeVariant(row={}) {
  const out={};
  for(const key of SAFE_FIELDS){
    const value=row?.[key];
    if(value === undefined || value === null || value === '') continue;
    if(typeof value === 'string') out[key]=value.slice(0,1000);
    else if(typeof value === 'number' || typeof value === 'boolean') out[key]=value;
    else if(Array.isArray(value)) out[key]=value.slice(0,20);
    else if(typeof value === 'object') out[key]=value;
  }
  return out;
}

export function matchSelectedVariant(rows, vid) {
  return (Array.isArray(rows)?rows:[]).find(row=>String(row?.vid||'')===String(vid||''))||null;
}

function headers(token){return {'CJ-Access-Token':token,'Content-Type':'application/json','User-Agent':'PrismBay-CJ-Variant-Evidence/1.0'};}

export async function main(){
  const apiKey=String(process.env.CJ_API_KEY||'').trim();
  if(!apiKey) throw new Error('CJ_API_KEY is required');
  const sourcing=JSON.parse(await fs.readFile('growth-reports/paperclip-cj-sourcing.json','utf8'));
  const client=createCJReadOnlyClient();
  const base='https://developers.cjdropshipping.com/api2.0/v1';
  const auth=await client(base+'/authentication/getAccessToken',{method:'POST',headers:{'Content-Type':'application/json','User-Agent':'PrismBay-CJ-Variant-Evidence/1.0'},body:JSON.stringify({apiKey})});
  const token=String(auth?.data?.accessToken||'');
  if(!token) throw new Error('CJ authentication returned no access token');
  console.log('::add-mask::'+token);

  const products=[];
  for(const result of (sourcing.results||[])){
    const pid=result?.product?.id;
    const vid=result?.product?.variantId;
    if(!pid||!vid) continue;
    let variant=null;
    try{
      const url=new URL(base+'/product/variant/query');
      url.searchParams.set('pid',String(pid));
      const response=await client(url,{headers:headers(token)});
      variant=matchSelectedVariant(response?.data,vid);
    }catch{}
    products.push({
      slug:result.slug,
      productId:String(pid),
      productName:result.product?.name||null,
      selectedVariantId:String(vid),
      selectedVariantSku:result.product?.variantSku||null,
      exactVariantFound:Boolean(variant),
      attributes:variant?sanitizeVariant(variant):{},
      source:'CJ product variant query',
      commercialUse:'evidence_for_identity_and_comparable_market_retail_validation_only',
    });
  }

  const report={
    schemaVersion:1,
    checkedAt:new Date().toISOString(),
    productCount:products.length,
    exactVariantCount:products.filter(x=>x.exactVariantFound).length,
    products,
    rule:'Variant attributes are supplier evidence. They do not prove market demand, market retail price, final destination freight, checkout readiness or profitability.'
  };
  await fs.writeFile('growth-reports/cj-variant-details.json',JSON.stringify(report,null,2)+'\n');
  console.log(JSON.stringify({productCount:report.productCount,exactVariantCount:report.exactVariantCount,products:products.map(x=>({slug:x.slug,exactVariantFound:x.exactVariantFound,attributes:x.attributes}))},null,2));
  return report;
}

if(process.argv[1]&&import.meta.url===pathToFileURL(process.argv[1]).href) await main();
