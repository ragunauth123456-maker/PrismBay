// No HTTP transport or supplier-order implementation is intentionally present.
export function createCJConnector(env = {}) {
  return Object.freeze({
    assess(order, checks = {}) {
      const authenticated = env.CJ_INTEGRATION_AUTHORIZED === 'true' && !!env.CJ_ACCESS_TOKEN && !!env.CJ_SESSION_ID;
      const ready = authenticated && order.status === 'manual_fulfillment' && order.paid === true && checks.country === 'US' && checks.inventoryVerified === true && checks.freightVerified === true && checks.priceVerified === true;
      return { readyForManualReview: !!ready, automaticOrdering: false };
    },
    async createOrder() { throw Error('CJ supplier ordering disabled; manual fulfillment only'); },
  });
}
