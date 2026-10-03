function finite(value) {
  if (value === null || value === undefined || typeof value === 'boolean' || String(value).trim() === '') return null;
  const n = Number(value);
  return Number.isFinite(n) ? n : null;
}

function positive(value) {
  const n = finite(value);
  return n !== null && n > 0 ? n : null;
}

function nonNegative(value) {
  const n = finite(value);
  return n !== null && n >= 0 ? n : null;
}

function ceilCent(value) {
  return Math.ceil((Number(value) - Number.EPSILON) * 100) / 100;
}

export function minimumCustomerCharge({
  itemPriceUsd,
  productCostUsd,
  supplierFreightUsd,
  feeRatePct,
  returnsReservePct = 5,
  minimumContributionUsd = 3,
  minimumContributionPct = 25,
  maximumLandedPct = 55,
} = {}) {
  const itemPrice = positive(itemPriceUsd);
  const productCost = nonNegative(productCostUsd);
  const supplierFreight = nonNegative(supplierFreightUsd);
  const feeRate = nonNegative(feeRatePct);
  const returnsReserve = nonNegative(returnsReservePct);
  const minimumContribution = nonNegative(minimumContributionUsd);
  const minimumMargin = nonNegative(minimumContributionPct);
  const maxLanded = positive(maximumLandedPct);
  const numbers = [itemPrice, productCost, supplierFreight, feeRate, returnsReserve, minimumContribution, minimumMargin, maxLanded];
  if (numbers.some(value => value === null)) return { verified: false, viable: false, reason: 'complete_pricing_inputs_required' };
  if (feeRate + returnsReserve + minimumMargin >= 100 || maxLanded > 100) return { verified: false, viable: false, reason: 'invalid_thresholds' };

  const landed = productCost + supplierFreight;
  const feeReserveRate = (feeRate + returnsReserve) / 100;
  const requiredByLanded = landed / (maxLanded / 100);
  const requiredByMargin = landed / (1 - feeReserveRate - minimumMargin / 100);
  const requiredByContribution = (landed + minimumContribution) / (1 - feeReserveRate);
  const requiredGross = Math.max(itemPrice, requiredByLanded, requiredByMargin, requiredByContribution);
  const minimumShippingCharge = Math.max(0, requiredGross - itemPrice);
  const fullFreightCustomerCharge = itemPrice + supplierFreight;
  const fullFreightPasses = fullFreightCustomerCharge + 1e-9 >= requiredGross;

  return {
    verified: true,
    viable: fullFreightPasses,
    itemPriceUsd: +itemPrice.toFixed(2),
    productCostUsd: +productCost.toFixed(2),
    supplierFreightUsd: +supplierFreight.toFixed(2),
    landedCostUsd: +landed.toFixed(2),
    feeRatePct: +feeRate.toFixed(2),
    returnsReservePct: +returnsReserve.toFixed(2),
    thresholds: {
      minimumContributionUsd: +minimumContribution.toFixed(2),
      minimumContributionPct: +minimumMargin.toFixed(2),
      maximumLandedPct: +maxLanded.toFixed(2),
    },
    requiredGrossCustomerChargeUsd: +ceilCent(requiredGross).toFixed(2),
    minimumShippingChargeUsd: +ceilCent(minimumShippingCharge).toFixed(2),
    maximumSupplierFreightPassThroughUsd: +supplierFreight.toFixed(2),
    maximumShippingSubsidyUsd: fullFreightPasses ? +Math.max(0, supplierFreight - minimumShippingCharge).toFixed(2) : 0,
    fullFreightCustomerChargeUsd: +fullFreightCustomerCharge.toFixed(2),
    fullFreightPasses,
    reason: fullFreightPasses ? 'shipping_can_be_partially_or_fully_passed_through' : 'item_price_increase_or_lower_supplier_cost_required',
  };
}

export function evaluateCustomerShippingCharge(policy, customerShippingChargeUsd) {
  if (!policy?.verified || !policy?.viable) return { pass: false, reason: policy?.reason || 'verified_viable_policy_required' };
  const charge = nonNegative(customerShippingChargeUsd);
  if (charge === null) return { pass: false, reason: 'valid_customer_shipping_charge_required' };
  if (charge > policy.supplierFreightUsd + 1e-9) return { pass: false, reason: 'shipping_charge_exceeds_verified_supplier_freight' };
  const gross = policy.itemPriceUsd + charge;
  const landed = policy.landedCostUsd;
  const fees = gross * policy.feeRatePct / 100;
  const reserve = gross * policy.returnsReservePct / 100;
  const contribution = gross - landed - fees - reserve;
  const contributionPct = gross > 0 ? contribution / gross * 100 : 0;
  const landedPct = gross > 0 ? landed / gross * 100 : Infinity;
  const pass = contribution >= policy.thresholds.minimumContributionUsd - 1e-9 && contributionPct >= policy.thresholds.minimumContributionPct - 1e-9 && landedPct <= policy.thresholds.maximumLandedPct + 1e-9;
  return {
    pass,
    reason: pass ? 'commercial_thresholds_pass' : 'commercial_thresholds_fail',
    customerShippingChargeUsd: +charge.toFixed(2),
    grossCustomerChargeUsd: +gross.toFixed(2),
    contributionUsd: +contribution.toFixed(2),
    contributionPct: +contributionPct.toFixed(1),
    landedPct: +landedPct.toFixed(1),
    feesUsd: +fees.toFixed(2),
    returnsReserveUsd: +reserve.toFixed(2),
  };
}
