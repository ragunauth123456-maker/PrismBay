import fs from 'node:fs/promises';
import { pathToFileURL } from 'node:url';

async function readJson(path) {
  try { return JSON.parse(await fs.readFile(path, 'utf8')); } catch { return null; }
}

export function buildTikTokRetailReadiness({ publisher, supplierReview, publicPost = null }) {
  const checks = Array.isArray(publisher?.result?.checks) ? publisher.result.checks : [];
  const verification = checks.find(row => /tiktokio.*\.txt/i.test(String(row?.url || ''))) || null;
  const terms = checks.find(row => /\/terms(?:$|\?)/i.test(String(row?.url || ''))) || null;
  const privacy = checks.find(row => /\/privacy(?:$|\?)/i.test(String(row?.url || ''))) || null;
  const saleReady = Number(supplierReview?.saleReadyCount || 0);
  const publicPostVerified = publicPost?.publicPostVerified === true;
  const missing = [];
  if (!terms?.ok) missing.push('terms_url');
  if (!privacy?.ok) missing.push('privacy_url');
  if (!publisher?.result?.tiktokVerificationReady) missing.push('site_verification_file');
  if (saleReady < 1) missing.push('sale_ready_product');
  if (!publicPostVerified) missing.push('public_post_verification');

  return {
    schemaVersion: 1,
    checkedAt: new Date().toISOString(),
    termsReady: Boolean(terms?.ok),
    privacyReady: Boolean(privacy?.ok),
    siteVerificationReady: publisher?.result?.tiktokVerificationReady === true,
    verificationUrl: verification?.url || null,
    verificationHttpStatus: verification?.status ?? null,
    saleReadyProductCount: saleReady,
    publicPostVerified,
    readyForPublicRetailPublishing: missing.length === 0,
    missing,
    ownerOrProviderEvidenceRequired: missing.filter(x => ['site_verification_file','public_post_verification'].includes(x)),
    rule: 'Do not synthesize TikTok verification content. Use the exact signature file downloaded from TikTok Developer Portal. Public retail publishing also requires existing repository consent, rights, OAuth scope and owner authorization gates.',
  };
}

export async function main() {
  const publisher = await readJson('growth-reports/publisher.json');
  const supplierReview = await readJson('growth-reports/cj-worker-review.json');
  const publicPost = await readJson('growth-reports/tiktok-public-post-evidence.json');
  const report = buildTikTokRetailReadiness({ publisher, supplierReview, publicPost });
  await fs.mkdir('growth-reports', { recursive: true });
  await fs.writeFile('growth-reports/tiktok-retail-readiness.json', JSON.stringify(report, null, 2) + '\n');
  console.log(JSON.stringify(report, null, 2));
  return report;
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) await main();
