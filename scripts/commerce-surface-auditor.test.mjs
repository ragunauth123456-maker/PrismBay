import test from 'node:test';
import assert from 'node:assert/strict';
import {auditProductsPayload,auditMerchantXml,auditSitemapXml,auditRobots} from './commerce-surface-auditor.mjs';

test('valid product feed requires identity title and positive price',()=>{
 const audit=auditProductsPayload({products:[{id:'p1',title:'Brush',price:12.99,link:'https://example.com/p1',availability:'in_stock'}]});
 assert.equal(audit.productCount,1);
 assert.equal(audit.invalidProductCount,0);
});

test('invalid product feed records missing commercial fields',()=>{
 const audit=auditProductsPayload([{id:'p1',title:'Brush',price:0,link:'http://example.com/p1'}]);
 assert.equal(audit.invalidProductCount,1);
 assert.ok(audit.products[0].issues.includes('missing_or_invalid_price'));
 assert.ok(audit.products[0].issues.includes('non_https_link'));
});

test('merchant feed requires items with title price and link',()=>{
 const good=auditMerchantXml('<rss><channel><item><g:title>Brush</g:title><g:price>12.99 USD</g:price><g:link>https://x</g:link></item></channel></rss>');
 assert.equal(good.valid,true);
 const bad=auditMerchantXml('<rss><channel><item><g:title>Brush</g:title></item></channel></rss>');
 assert.equal(bad.valid,false);
 assert.ok(bad.issues.includes('merchant_feed_missing_prices'));
});

test('sitemap and robots fail closed on discoverability defects',()=>{
 const sitemap=auditSitemapXml('<urlset><url><loc>https://example.com/</loc></url></urlset>');
 assert.equal(sitemap.valid,true);
 const robots=auditRobots('User-agent: *\nDisallow: /\n');
 assert.equal(robots.valid,false);
 assert.ok(robots.issues.includes('robots_blocks_entire_site'));
});
