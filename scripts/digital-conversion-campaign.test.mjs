import test from 'node:test';
import assert from 'node:assert/strict';
import { ACTIVE_DIGITAL_OFFERS, campaignForSlot, currentSixHourSlot } from './digital-conversion-campaign.mjs';
test('rotate three already verified paid document products across six-hour cloud runs', () => {
  assert.equal(ACTIVE_DIGITAL_OFFERS.length, 3);
  const first = [0,1,2,3,4,5].map(x => campaignForSlot(x).offer.slug);
  assert.deepEqual(first, ['stakeholder','esg','whitepaper','stakeholder','esg','whitepaper']);
  assert.equal(currentSixHourSlot(0),0);
  assert.equal(currentSixHourSlot(6 * 60 * 60 * 1000),1);
});
test('each campaign has its matching live free guide, Stripe link, disclosed price and tracked identifiers', () => {
  for (const [i,offer] of ACTIVE_DIGITAL_OFFERS.entries()) {
    const c = campaignForSlot(i);
    assert.equal(c.offer.title,offer.name);
    assert.equal(c.offer.priceUsd,offer.priceUsd);
    assert.ok(c.guideUrl.startsWith(offer.guide + '?utm_source=github_cloud'));
    assert.ok(c.checkoutUrl.startsWith(offer.checkout + '?client_reference_id=owned_content_'));
    assert.match(c.editorialDraft, new RegExp('\\$'+offer.priceUsd+' USD'));
    assert.equal(c.videoBrief.durationSeconds,30);
    assert.equal(c.videoBrief.scenes.reduce((n,s)=>n+s.seconds,0),30);
    assert.equal(c.guardrails.publishedAutomatically,false);
    assert.equal(c.guardrails.physicalProductsPromoted,false);
    assert.equal(c.guardrails.marketingEmailsSent,false);
  }
});
test('marketing drafts do not claim customers, inventory, certainty or hidden software', () => {
  for (let i=0;i<3;i++){
    const c=campaignForSlot(i);
    assert.match(c.editorialDraft,/not hosted AI software/);
    assert.match(c.editorialDraft,/Free step-by-step example/);
    assert.match(c.editorialDraft,/one time/);
    assert.ok(c.guardrails.noInventedTestimonials && c.guardrails.noClaimsOfNewSales);
    assert.ok(!/best.?seller|guaranteed income|only [0-9]+ left|customer testimonial/i.test(c.editorialDraft));
  }
  assert.throws(()=>campaignForSlot(-1));
  assert.throws(()=>campaignForSlot(1.5));
  assert.throws(()=>currentSixHourSlot(Number.NaN));
});
