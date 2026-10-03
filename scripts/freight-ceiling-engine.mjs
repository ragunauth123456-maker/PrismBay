export function commercialFreightCeiling({ retailUsd, supplierCostUsd, quantity = 1, feeRatePct = 3.2, returnReservePct = 5, minContributionUsd = 3, minContributionPct = 25, maxLandedPct = 55 } = {}) {
  const retail = Number(retailUsd);
  const cost = Number(supplierCostUsd);
  const qty = Number(quantity);
  const feeRate = Number(feeRatePct) / 100;
  const returnRate = Number(returnReservePct) / 100;
  const minContributionRate = Number(minContributionPct) / 100;
  const maxLandedRate = Number(maxLandedPct) / 100;
  if (![retail, cost, qty, feeRate, returnRate, minContributionRate, maxLandedRate].every(Number.isFinite) || retail <= 0 || cost <= 0 || !Number.isInteger(qty) || qty < 1 || qty > 25) {
    return { viable: false, reason: 'invalid_inputs', maxFreightUsd: null };
  }
  const revenue = retail * qty;
  const merchandise = cost * qty;
  const fees = revenue * feeRate;
  const reserve = revenue * returnRate;
  const minimumContribution = Math.max(Number(minContributionUsd) || 0, revenue * minContributionRate);
  const ceilingByContribution = revenue - merchandise - fees - reserve - minimumContribution;
  const ceilingByLandedShare = revenue * maxLandedRate - merchandise;
  const maxFreight = Math.min(ceilingByContribution, ceilingByLandedShare);
  const viable = Number.isFinite(maxFreight) && maxFreight > 0;
  return {
    viable,
    reason: viable ? 'positive_freight_budget' : 'no_positive_freight_budget',
    revenueUsd: +revenue.toFixed(2),
    merchandiseUsd: +merchandise.toFixed(2),
    minimumContributionUsd: +minimumContribution.toFixed(2),
    ceilingByContributionUsd: +ceilingByContribution.toFixed(2),
    ceilingByLandedShareUsd: +ceilingByLandedShare.toFixed(2),
    maxFreightUsd: viable ? +maxFreight.toFixed(2) : 0,
    maxFreightPerUnitUsd: viable ? +(maxFreight / qty).toFixed(2) : 0,
    governingConstraint: ceilingByContribution <= ceilingByLandedShare ? 'contribution' : 'landed_share',
    policy: {
      minContributionUsd: Number(minContributionUsd),
      minContributionPct: Number(minContributionPct),
      maxLandedPct: Number(maxLandedPct),
      feeRatePct: Number(feeRatePct),
      returnReservePct: Number(returnReservePct),
    },
  };
}

export function compareFreightToCeiling({ quotedFreightUsd, ...inputs } = {}) {
  const ceiling = commercialFreightCeiling(inputs);
  const quoted = Number(quotedFreightUsd);
  if (!ceiling.viable || !Number.isFinite(quoted) || quoted <= 0) return { ...ceiling, quotedFreightUsd: Number.isFinite(quoted) ? quoted : null, passes: false, headroomUsd: null };
  const headroom = ceiling.maxFreightUsd - quoted;
  return {
    ...ceiling,
    quotedFreightUsd: +quoted.toFixed(2),
    passes: headroom >= 0,
    headroomUsd: +headroom.toFixed(2),
    utilizationPct: ceiling.maxFreightUsd > 0 ? +((quoted / ceiling.maxFreightUsd) * 100).toFixed(2) : null,
  };
}
