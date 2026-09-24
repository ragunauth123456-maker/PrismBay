export const channelId = 'UCw2hs85TzIpdKwJtG-BSxzQ';
export const productUrl = 'https://www.prismbayai.com/products/spendshield-ai';
export const priceUSD = 249;
export const videos = [
  { id: 'vendor-risk', title: 'Before choosing an AI vendor: build this risk matrix',
    scenes: [
      { seconds: 3, label: 'THE PROCUREMENT PROBLEM', title: 'Cheap AI.\nExpensive unknowns.', rows: ['Before choosing a vendor,', 'make the unknowns visible.'], caption: 'A low quote is only one input.' },
      { seconds: 7, label: 'MY WORKED EXAMPLE / FICTIONAL VENDORS', title: 'I compare evidence\nbefore price.', rows: ['CHECK                 A       B', 'Data retention       ?      30d', 'Export tested        No     Yes', 'Named owner          No     Yes'], caption: 'These are illustrative inputs, not real vendor ratings.' },
      { seconds: 7, label: 'TURN UNKNOWNS INTO QUESTIONS', title: 'Unknown does not\nmean safe.', rows: ['Retention ?  > Request policy', 'Export No    > Test an export', 'Owner No     > Name a reviewer'], caption: 'I hold approval until critical gaps are resolved.' },
      { seconds: 7, label: 'TAKE THIS INTO YOUR NEXT REVIEW', title: 'Give every gap\nan owner.', rows: ['Gap: retention policy missing', 'Owner: procurement lead', 'Evidence: dated vendor policy', 'Decision: hold / review again'], caption: 'Record evidence and a review date before deciding.' },
      { seconds: 6, label: 'PRISMBAY AI / DOCUMENT BLUEPRINT', title: 'SpendShield AI', rows: ['$249 USD / displayed price', 'Procurement workflow designs', 'Your team builds the system', 'Explore the product page'], caption: 'prismbayai.com/products/spendshield-ai' },
    ] },
  { id: 'automation-gates', title: 'AI invoice review: three gates before you automate',
    scenes: [
      { seconds: 3, label: 'THE AUTOMATION PROBLEM', title: 'Same invoice twice?\nFlag it. Check it.', rows: ['A matching number is a clue.', 'It is not proof of an error.'], caption: 'Build a review workflow before payment automation.' },
      { seconds: 7, label: 'GATE 01 / MATCH THE RECORDS', title: 'Start with\nthree fields.', rows: ['Supplier: Example Co.', 'Invoice: INV-1042', 'Amount: $480 / USD', 'Two records match > FLAG'], caption: 'Fictional example. Keep both source records.' },
      { seconds: 7, label: 'GATE 02 / CHECK THE CONTEXT', title: 'Duplicate or\nvalid revision?', rows: ['Same service period?', 'Credit or revised invoice?', 'Already paid?', 'Unclear > HUMAN REVIEW'], caption: 'A flag should trigger investigation, not rejection.' },
      { seconds: 7, label: 'GATE 03 / KEEP THE DECISION', title: 'Evidence first.\nApproval next.', rows: ['Confirmed duplicate > HOLD', 'Valid revision > APPROVER', 'Log: reason + source + owner', 'No evidence > KEEP ON HOLD'], caption: 'Separate AI suggestions from payment authority.' },
      { seconds: 6, label: 'PRISMBAY AI / DOCUMENT BLUEPRINT', title: 'SpendShield AI', rows: ['$249 USD / displayed price', 'Contract and spend workflows', 'No working software included', 'Explore the product page'], caption: 'prismbayai.com/products/spendshield-ai' },
    ] },
];
export function metadata(video) {
  const url = new URL(productUrl);
  for (const [key, value] of Object.entries({utm_source:'youtube',utm_medium:'organic_short',utm_campaign:'spendshield_education',utm_content:video.id})) url.searchParams.set(key,value);
  return { id:video.id, channelId, status:'DRAFT_BLOCKED_DELIVERY', title:video.title,
    url:url.href,
    description:`PrismBay AI educational promotion. ${video.title}. Original illustrative framework; fictional inputs, not a customer result or a working software demonstration. SpendShield AI is a DOCUMENT BLUEPRINT for procurement workflows, vendor-risk assessment and contract review. No working software, implementation service, AI models or business data included. Your engineering team builds the system. Listed at $249 USD on 2026-09-24; confirm checkout price before purchase. No savings guarantee. Explore: ${url.href}\nDesigned for procurement teams; the catalog targets organizations with $10M+ annual procurement spend. Silent, fully captioned visual lesson. #Procurement #VendorRisk #PrismBayAI`,
    caption:`Ad | ${video.title}. Illustrative lesson. SpendShield AI: document blueprint, $249 USD displayed price. Your team builds it. ${url.href}` };
}
