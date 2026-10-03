import test from 'node:test';
import assert from 'node:assert/strict';
import { minimumCustomerCharge, evaluateCustomerShippingCharge } from './shipping-charge-policy.mjs';

test('Crevice country screen reveals minimum shipping contribution at current item price', () => {
  const policy = minimumCustomerCharge({
    itemPriceUsd: 12.95,
    productCostUsd: 1.89,
    supplierFreightUsd: 6.31,
    feeRatePct: 3,
  });
  assert.equal(policy.verified, true);
  assert.equal(policy.viable, true);
  assert.equal(policy.landedCostUsd, 8.2);
  assert.equal(policy.requiredGrossCustomerChargeUsd, 14.91);
  assert.equal(policy.minimumShippingChargeUsd, 1.96);
  assert.equal(policy.maximumShippingSubsidyUsd, 4.35);
});

test('charging less than the commercial floor fails while the floor passes', () => {
  const policy = minimumCustomerCharge({ itemPriceUsd: 12.95, productCostUsd: 1.89, supplierFreightUsd: 6.31, feeRatePct: 3 });
  assert.equal(evaluateCustomerShippingCharge(policy, 1.95).pass, false);
  assert.equal(evaluateCustomerShippingCharge(policy, 1.96).pass, true);
});

test('shipping charge cannot exceed verified supplier freight', () => {
  const policy = minimumCustomerCharge({ itemPriceUsd: 12.95, productCostUsd: 1.89, supplierFreightUsd: 6.31, feeRatePct: 3 });
  const result = evaluateCustomerShippingCharge(policy, 6.32);
  assert.equal(result.pass, false);
  assert.equal(result.reason, 'shipping_charge_exceeds_verified_supplier_freight');
});

test('a route that cannot pass even with full freight charged requires price or cost change', () => {
  const policy = minimumCustomerCharge({ itemPriceUsd: 5, productCostUsd: 8, supplierFreightUsd: 7, feeRatePct: 3 });
  assert.equal(policy.viable, false);
  assert.equal(policy.reason, 'item_price_increase_or_lower_supplier_cost_required');
});
