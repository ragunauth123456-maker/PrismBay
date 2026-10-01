import test from 'node:test';
import assert from 'node:assert/strict';
const ROOT='https://ragunauthramsaroop.github.io/PrismBay/';
const KEY='927a4d6b8c21e5f73a90bc14d2ef6a31';
test('IndexNow project-site key remains inside the same URL path as all submitted buyer pages',()=>{
  const keyLocation=ROOT+KEY+'.txt';
  const urls=[
    ROOT,
    ROOT+'toolkits.html',
    ROOT+'stakeholder-engagement-plan-template.html',
    ROOT+'esg-monthly-reporting-template.html',
    ROOT+'board-briefing-white-paper-template.html',
    ROOT+'learn/',
    ROOT+'learn/stakeholder-mapping-toolkit.html',
    ROOT+'learn/esg-reporting-toolkit.html',
    ROOT+'learn/board-briefing-white-paper-system.html'
  ];
  assert.match(KEY,/^[A-Za-z0-9-]{8,128}$/);
  assert.equal(urls.length,9);
  for(const url of urls) assert.ok(url.startsWith(ROOT));
  assert.ok(keyLocation.startsWith(ROOT));
});
