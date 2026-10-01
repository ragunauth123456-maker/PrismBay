import fs from 'node:fs/promises';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import { ACTIVE_DIGITAL_OFFERS } from './digital-conversion-campaign.mjs';

const ROOT = 'https://ragunauthramsaroop.github.io/PrismBay/';
const LEARN = ROOT + 'learn/';
const pageSlugs = Object.freeze({
  stakeholder: 'stakeholder-mapping-toolkit.html',
  esg: 'esg-reporting-toolkit.html',
  whitepaper: 'board-briefing-white-paper-system.html'
});

const esc = value => String(value)
  .replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;')
  .replaceAll('"','&quot;').replaceAll("'",'&#39;');

function checkoutWithRef(offer) {
  const url = new URL(offer.checkout);
  url.searchParams.set('client_reference_id', 'owned_seo_' + offer.slug);
  return url.toString();
}

function guideWithUtm(offer) {
  const url = new URL(offer.guide);
  url.searchParams.set('utm_source','github_pages');
  url.searchParams.set('utm_medium','organic_search');
  url.searchParams.set('utm_campaign','owned_seo_' + offer.slug);
  return url.toString();
}

function titleFor(offer) {
  if (offer.slug === 'stakeholder') return 'Stakeholder Mapping Toolkit and Engagement Plan Templates | PrismBay';
  if (offer.slug === 'esg') return 'ESG Reporting Toolkit, KPI Workbook and Social Performance Templates | PrismBay';
  return 'Board Briefing and White Paper Template System | PrismBay';
}

function descriptionFor(offer) {
  if (offer.slug === 'stakeholder') return 'Free stakeholder engagement planning guide plus an optional $49 one-time editable toolkit with Excel tracking and Word briefing files.';
  if (offer.slug === 'esg') return 'Free monthly ESG reporting guide plus an optional $99 one-time editable pack with KPI, grievance, action and executive briefing files.';
  return 'Free board briefing and white paper guide plus an optional $79 one-time editable system with claims ledger and Word drafting templates.';
}

function keywordIntro(offer) {
  if (offer.slug === 'stakeholder') return 'Use a stakeholder mapping toolkit when you need more than a contact list. A practical system should connect stakeholder priority, engagement actions, accountable owners, commitments and evidence of closure.';
  if (offer.slug === 'esg') return 'Use an ESG reporting toolkit when monthly reporting needs a repeatable evidence trail. A practical system should connect KPI definitions, evidence, actions, grievances, ownership and executive review.';
  return 'Use a board briefing and white paper system when analysis needs to survive executive scrutiny. A practical system should separate verified facts, calculations, assumptions, source evidence and the decision being requested.';
}

export function buildOfferPage(offer) {
  const canonical = LEARN + pageSlugs[offer.slug];
  const checkout = checkoutWithRef(offer);
  const guide = guideWithUtm(offer);
  const deliverables = offer.deliverables.map(item => '<li>' + esc(item) + '</li>').join('');
  const productJson = JSON.stringify({
    '@context':'https://schema.org',
    '@type':'Product',
    name:offer.name,
    description:descriptionFor(offer),
    brand:{'@type':'Brand',name:'PrismBay'},
    offers:{
      '@type':'Offer',
      price:offer.priceUsd.toFixed(2),
      priceCurrency:'USD',
      availability:'https://schema.org/InStock',
      url:offer.checkout
    }
  }).replaceAll('<','\\u003c');

  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>${esc(titleFor(offer))}</title>
<meta name="description" content="${esc(descriptionFor(offer))}">
<meta name="robots" content="index,follow">
<link rel="canonical" href="${canonical}">
<meta property="og:type" content="website"><meta property="og:title" content="${esc(titleFor(offer))}">
<meta property="og:description" content="${esc(descriptionFor(offer))}">
<meta property="og:url" content="${canonical}">
<link rel="stylesheet" href="../buyer-guides.css">
<script type="application/ld+json">${productJson}</script>
</head>
<body>
<a href="#main" class="skip">Skip to main content</a>
<header class="nav"><div class="wrap"><a class="brand" href="../">PrismBay <em>AI</em></a><nav class="navlinks"><a href="./">Buyer guides</a><a href="../toolkits.html">All toolkits</a><a href="${guide}">Free guide</a></nav></div></header>
<section class="hero"><div class="wrap">
<p class="eyebrow">Professional document system</p>
<h1>${esc(offer.name)}</h1>
<p class="lead">${esc(descriptionFor(offer))}</p>
<div class="buttons"><a class="btn primary" href="${guide}">Read the free guide</a><a class="btn outline" href="${checkout}" rel="noopener noreferrer">Get the editable toolkit, $${offer.priceUsd} USD</a></div>
<p class="facts">One-time purchase. Professional document files. No subscription. This is not hosted AI software or bespoke consulting.</p>
</div></section>
<main id="main" class="main"><div class="wrap">
<p class="breadcrumbs"><a href="./">Buyer guides</a> / ${esc(offer.name)}</p>
<div class="layout">
<article class="article">
<h2>When this toolkit is useful</h2>
<p>${esc(keywordIntro(offer))}</p>
<div class="callout"><p><strong>Start free.</strong> ${esc(offer.actionableTip)} The public guide gives you a practical example before you decide whether the editable files suit your work.</p></div>
<h2>What the paid package includes</h2>
<ul>${deliverables}</ul>
<h2>Who it is designed for</h2>
<p>${esc(offer.audience)}.</p>
<h2>What problem it addresses</h2>
<p>${esc(offer.problem)}</p>
<p>${esc(offer.educationalHook)}</p>
<h2>A practical buying check</h2>
<ol>
<li>Read the free guide and compare the workflow with your current process.</li>
<li>Confirm you need editable Excel or Word files rather than a free example alone.</li>
<li>Review the listed deliverables and one-time price before checkout.</li>
<li>Use the published refund and support routes if a purchased file cannot be downloaded.</li>
</ol>
<section class="faq">
<h2>Questions buyers often ask</h2>
<h3>Is the free guide the same as the paid package?</h3>
<p>No. The guide is free educational material. The paid package adds the listed editable professional files.</p>
<h3>Is this software or consulting?</h3>
<p>No. This is a self-guided document package. No hosted AI application, managed service or bespoke consulting engagement is included.</p>
<h3>Is the price recurring?</h3>
<p>No. The listed price is a one-time USD purchase through the existing Stripe-hosted checkout.</p>
</section>
<div class="more"><h2>Compare all PrismBay toolkits</h2><p>Review stakeholder, ESG and executive research systems together, including the existing complete-bundle option.</p><a href="../toolkits.html">Open the toolkit catalog →</a></div>
</article>
<aside class="aside">
<p class="eyebrow">Optional editable package</p>
<h2>${esc(offer.name)}</h2>
<div class="price">$${offer.priceUsd}<small> USD, one time</small></div>
<ul>${deliverables}</ul>
<a class="btn dark" href="${checkout}" rel="noopener noreferrer">Continue to Stripe checkout</a>
<p class="disclosure">The free guide stays available without purchase. Payment is processed by the existing Stripe-hosted checkout. Review <a href="https://www.prismbayai.com/refunds">refunds</a> and <a href="https://www.prismbayai.com/contact">support</a>.</p>
</aside>
</div></div></main>
<footer><div class="wrap">PrismBay professional document systems. <a href="../toolkits.html">Toolkits</a> · <a href="https://www.prismbayai.com/refunds">Refunds</a> · <a href="https://www.prismbayai.com/contact">Support</a></div></footer>
</body></html>`;
}

export function buildHub() {
  const cards = ACTIVE_DIGITAL_OFFERS.map(offer => `
<article class="article" style="margin-bottom:22px">
<p class="eyebrow">${esc(offer.audience)}</p>
<h2>${esc(offer.name)}</h2>
<p>${esc(descriptionFor(offer))}</p>
<p><a class="btn dark" href="./${pageSlugs[offer.slug]}">Read the buyer guide</a></p>
</article>`).join('');
  return `<!doctype html>
<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>Professional Template Buyer Guides | PrismBay</title>
<meta name="description" content="Compare PrismBay stakeholder, ESG, board briefing and white paper document systems. Start with free practical guides, then review optional editable files.">
<meta name="robots" content="index,follow"><link rel="canonical" href="${LEARN}">
<link rel="stylesheet" href="../buyer-guides.css"></head>
<body><header class="nav"><div class="wrap"><a class="brand" href="../">PrismBay <em>AI</em></a><nav class="navlinks"><a href="../toolkits.html">Toolkit catalog</a><a href="../scorecard.html">Free assessment</a></nav></div></header>
<section class="hero"><div class="wrap"><p class="eyebrow">Buyer guides</p><h1>Choose the professional document system that fits the work.</h1><p class="lead">Start with free educational material. Review the optional editable Excel, Word and PDF packages only when you need a reusable operating system.</p></div></section>
<main class="main"><div class="wrap">${cards}
<div class="more"><h2>Want to compare the full catalog?</h2><p>The toolkit hub lists all individual systems and the existing complete-bundle option.</p><a href="../toolkits.html">Compare all toolkits →</a></div>
</div></main>
<footer><div class="wrap">PrismBay professional document systems. No hosted AI software or bespoke consulting is included in these document packages.</div></footer>
</body></html>`;
}

export function ownedSalesUrls() {
  return [
    LEARN,
    ...ACTIVE_DIGITAL_OFFERS.map(offer => LEARN + pageSlugs[offer.slug])
  ];
}

export async function main(outputDir = process.argv[2] || 'growth-reports/owned-sales-pages') {
  await fs.mkdir(outputDir, { recursive: true });
  await fs.writeFile(path.join(outputDir, 'index.html'), buildHub());
  for (const offer of ACTIVE_DIGITAL_OFFERS) {
    await fs.writeFile(path.join(outputDir, pageSlugs[offer.slug]), buildOfferPage(offer));
  }
  await fs.writeFile(path.join(outputDir, 'urls.json'), JSON.stringify({ urls: ownedSalesUrls() }, null, 2) + '\n');
  console.log(JSON.stringify({status:'PASS',outputDir,pageCount:ACTIVE_DIGITAL_OFFERS.length + 1,urls:ownedSalesUrls()}));
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  await main();
}
