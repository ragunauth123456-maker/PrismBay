import fs from 'node:fs/promises';
import { ownedSalesUrls } from './owned-sales-page-worker.mjs';

export function mergeSitemap(xml, date = new Date().toISOString().slice(0,10)) {
  const text = String(xml || '').trim();
  if (!text.includes('<urlset') || !text.includes('</urlset>')) throw new Error('invalid_sitemap');
  let body = text.replace(/\s*<\/urlset>\s*$/, '');
  for (const url of ownedSalesUrls()) {
    if (body.includes('<loc>' + url + '</loc>')) continue;
    body += '\n  <url><loc>' + url + '</loc><lastmod>' + date + '</lastmod><changefreq>weekly</changefreq></url>';
  }
  return body + '\n</urlset>\n';
}

export async function main(target = process.argv[2]) {
  if (!target) throw new Error('sitemap_path_required');
  const current = await fs.readFile(target, 'utf8');
  const merged = mergeSitemap(current);
  await fs.writeFile(target, merged);
  console.log(JSON.stringify({status:'PASS',target,urls:ownedSalesUrls().length}));
}

if (process.argv[1] && import.meta.url === new URL('file://' + process.argv[1]).href) {
  await main();
}
