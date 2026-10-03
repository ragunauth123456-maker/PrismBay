import fs from 'node:fs/promises';
import { pathToFileURL } from 'node:url';

export function auditProductsPayload(payload) {
  const products=Array.isArray(payload)?payload:Array.isArray(payload?.products)?payload.products:[];
  const issues=[];
  if(!products.length) issues.push('products_feed_empty_or_unrecognized');
  const normalized=products.map((p,index)=>{
    const id=String(p?.id??p?.slug??p?.sku??'').trim();
    const title=String(p?.title??p?.name??'').trim();
    const link=String(p?.link??p?.url??p?.productUrl??'').trim();
    const rawPrice=p?.price?.value??p?.price??p?.amount;
    const price=typeof rawPrice==='string'?Number(String(rawPrice).replace(/[^0-9.]/g,'')):Number(rawPrice);
    const availability=String(p?.availability??p?.stockStatus??'').trim();
    const rowIssues=[];
    if(!id) rowIssues.push('missing_id');
    if(!title) rowIssues.push('missing_title');
    if(link && !/^https:\/\//i.test(link)) rowIssues.push('non_https_link');
    if(!Number.isFinite(price)||price<=0) rowIssues.push('missing_or_invalid_price');
    return {index,id:id||null,title:title||null,link:link||null,price:Number.isFinite(price)?price:null,availability:availability||null,issues:rowIssues};
  });
  const duplicateIds=normalized.filter((row,i,arr)=>row.id&&arr.findIndex(x=>x.id===row.id)!==i).map(x=>x.id);
  if(duplicateIds.length) issues.push('duplicate_product_ids');
  const invalid=normalized.filter(x=>x.issues.length);
  return {recognized:true,productCount:normalized.length,validProductCount:normalized.length-invalid.length,invalidProductCount:invalid.length,duplicateIds:[...new Set(duplicateIds)],issues,products:normalized};
}

export function auditMerchantXml(text='') {
  const value=String(text);
  const rss=/<rss\b/i.test(value)||/<feed\b/i.test(value);
  const itemCount=(value.match(/<(item|entry)\b/gi)||[]).length;
  const titleCount=(value.match(/<g:title\b|<title\b/gi)||[]).length;
  const priceCount=(value.match(/<g:price\b|<price\b/gi)||[]).length;
  const linkCount=(value.match(/<g:link\b|<link\b/gi)||[]).length;
  const issues=[];
  if(!rss) issues.push('merchant_feed_not_rss_or_atom');
  if(itemCount<1) issues.push('merchant_feed_has_no_items');
  if(itemCount>0&&titleCount<itemCount) issues.push('merchant_feed_missing_titles');
  if(itemCount>0&&priceCount<itemCount) issues.push('merchant_feed_missing_prices');
  if(itemCount>0&&linkCount<itemCount) issues.push('merchant_feed_missing_links');
  return {itemCount,titleCount,priceCount,linkCount,issues,valid:issues.length===0};
}

export function auditSitemapXml(text='') {
  const value=String(text);
  const locs=[...value.matchAll(/<loc>([^<]+)<\/loc>/gi)].map(m=>m[1].trim());
  const issues=[];
  if(!/<urlset\b|<sitemapindex\b/i.test(value)) issues.push('sitemap_missing_root');
  if(!locs.length) issues.push('sitemap_has_no_urls');
  if(locs.some(x=>!/^https:\/\//i.test(x))) issues.push('sitemap_contains_non_https_url');
  return {urlCount:locs.length,issues,valid:issues.length===0,urls:locs.slice(0,50)};
}

export function auditRobots(text='') {
  const value=String(text);
  const issues=[];
  if(!/user-agent\s*:/i.test(value)) issues.push('robots_missing_user_agent');
  if(/disallow\s*:\s*\/\s*(?:\r?\n|$)/i.test(value)) issues.push('robots_blocks_entire_site');
  const sitemap=[...value.matchAll(/sitemap\s*:\s*(https:\/\/\S+)/gi)].map(m=>m[1]);
  if(!sitemap.length) issues.push('robots_missing_sitemap_reference');
  return {sitemapReferences:sitemap,issues,valid:issues.length===0};
}

async function fetchText(origin,path){
  const response=await fetch(origin+path,{redirect:'follow',signal:AbortSignal.timeout(15000),headers:{'user-agent':'PrismBay-Commerce-Surface-Auditor/1.0'}});
  const text=await response.text();
  return {path,status:response.status,ok:response.ok,contentType:response.headers.get('content-type'),text};
}

export async function auditCommerceSurfaces(origin){
  const [productsRes,merchantRes,sitemapRes,robotsRes]=await Promise.all(['/products.json','/merchant-feed.xml','/sitemap.xml','/robots.txt'].map(path=>fetchText(origin,path)));
  let productsPayload=null; try{productsPayload=JSON.parse(productsRes.text);}catch{}
  const products=productsRes.ok&&productsPayload!==null?auditProductsPayload(productsPayload):{recognized:false,productCount:0,validProductCount:0,invalidProductCount:0,issues:[productsRes.ok?'products_json_parse_failed':`products_http_${productsRes.status}`],products:[]};
  const merchant=merchantRes.ok?auditMerchantXml(merchantRes.text):{itemCount:0,issues:[`merchant_http_${merchantRes.status}`],valid:false};
  const sitemap=sitemapRes.ok?auditSitemapXml(sitemapRes.text):{urlCount:0,issues:[`sitemap_http_${sitemapRes.status}`],valid:false,urls:[]};
  const robots=robotsRes.ok?auditRobots(robotsRes.text):{issues:[`robots_http_${robotsRes.status}`],valid:false,sitemapReferences:[]};
  const issues=[...products.issues,...products.products.flatMap(x=>x.issues.map(issue=>`product:${x.id||x.index}:${issue}`)),...merchant.issues,...sitemap.issues,...robots.issues];
  return {
    schemaVersion:1,
    checkedAt:new Date().toISOString(),
    origin,
    products,
    merchant,
    sitemap,
    robots,
    issueCount:issues.length,
    issues,
    technicalSurfaceReady:products.productCount>0&&products.invalidProductCount===0&&merchant.valid&&sitemap.valid&&robots.valid,
    freeDistributionAccountApprovalKnown:false,
    freeDistributionReady:false,
    rule:'Technical feed readiness does not prove Google, Pinterest, TikTok, eBay or any other platform account approval. External activation remains separately gated.',
  };
}

export async function main(){
  const manifest=JSON.parse(await fs.readFile('config/store-backend-swarm.json','utf8'));
  const report=await auditCommerceSurfaces(manifest.storeOrigin);
  await fs.mkdir('growth-reports',{recursive:true});
  await fs.writeFile('growth-reports/commerce-surface-audit.json',JSON.stringify(report,null,2)+'\n');
  console.log(JSON.stringify({technicalSurfaceReady:report.technicalSurfaceReady,productCount:report.products.productCount,merchantItems:report.merchant.itemCount,sitemapUrls:report.sitemap.urlCount,issueCount:report.issueCount},null,2));
  return report;
}

if(process.argv[1]&&import.meta.url===pathToFileURL(process.argv[1]).href) await main();
