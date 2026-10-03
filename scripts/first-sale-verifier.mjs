import fs from 'node:fs/promises';
import { pathToFileURL } from 'node:url';

export function verifyFirstSale(evidence = null) {
  const order = evidence?.order || null;
  const checks = {
    evidencePresent: Boolean(order),
    nonTest: order?.test === false,
    paid: order?.paid === true,
    paymentIdPresent: typeof order?.paymentId === 'string' && order.paymentId.length > 3,
    supplierOrderVerified: order?.supplierOrderVerified === true,
    shipmentVerified: order?.shipmentVerified === true,
    notRefunded: order?.refunded === false,
    revenueNumeric: Number.isFinite(Number(order?.grossRevenueUsd)),
    productCostNumeric: Number.isFinite(Number(order?.productCostUsd)),
    freightCostNumeric: Number.isFinite(Number(order?.freightCostUsd)),
  };
  const financialInputsReady = checks.revenueNumeric && checks.productCostNumeric && checks.freightCostNumeric;
  const netMarginUsd = financialInputsReady
    ? Number(order.grossRevenueUsd) - Number(order.productCostUsd) - Number(order.freightCostUsd) - Number(order.paymentFeesUsd || 0)
    : null;
  const verified = Object.values(checks).every(Boolean) && Number.isFinite(netMarginUsd) && netMarginUsd >= 0;
  return {
    schemaVersion: 1,
    verifiedFirstSale: verified,
    checks,
    netMarginUsd,
    orderReference: verified ? (order.orderReference || null) : null,
    rule: 'Only a real non-test paid order with supplier order proof, shipment proof, no refund and complete cost evidence is counted as a verified PrismBay Clean sale.',
  };
}

export async function main() {
  let evidence = null;
  try { evidence = JSON.parse(await fs.readFile('growth-reports/non-test-order-evidence.json', 'utf8')); } catch {}
  const report = verifyFirstSale(evidence);
  await fs.mkdir('growth-reports', { recursive: true });
  await fs.writeFile('growth-reports/first-sale-verification.json', JSON.stringify(report, null, 2) + '\n');
  console.log(JSON.stringify(report, null, 2));
  return report;
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) await main();
