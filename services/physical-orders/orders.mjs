import { mapItems } from './catalog.mjs';

const identifier = (value, prefix) => {
  const id = typeof value === 'string' ? value : value?.id;
  return typeof id === 'string' && new RegExp(`^${prefix}_[a-zA-Z0-9]+$`).test(id) ? id : null;
};
const states = new Set('AL AK AZ AR CA CO CT DE FL GA HI ID IL IN IA KS KY LA ME MD MA MI MN MS MO MT NE NV NH NJ NM NY NC ND OH OK OR PA RI SC SD TN TX UT VT VA WA WV WI WY DC'.split(' '));
export function validUSShipping(shipping) {
  const a = shipping?.address;
  return !!(shipping?.name?.trim() && a?.country === 'US' && states.has(a.state) && /^\d{5}(-\d{4})?$/.test(a.postal_code || '') && a.line1?.trim() && a.city?.trim());
}

export function ingest(event, ledger, catalog, live) {
  if (!identifier(event.id, 'evt') || event.livemode !== live || (event.account && event.account !== catalog.accountId)) throw Error('Event scope rejected');
  return ledger.transact(state => {
    if (Object.hasOwn(state.events, event.id)) return 'replay';
    const object = event.data?.object;
    let result = 'ignored';
    if (event.type === 'payment_intent.succeeded') {
      const pi = identifier(object?.id, 'pi');
      if (!pi) throw Error('Invalid payment intent');
      if (object.status === 'succeeded' && Number.isSafeInteger(object.amount_received) && object.amount_received > 0) {
        // PI carries no authoritative Checkout basket. Keep a provisional review record.
        state.orders[pi] ??= { paymentIntentId: pi, paid: true, status: 'needs_review', reason: 'awaiting_checkout', items: [] };
        result = 'recorded';
      }
    } else if (['checkout.session.completed', 'checkout.session.async_payment_succeeded'].includes(event.type)) {
      const sessionId = identifier(object?.id, 'cs');
      const pi = identifier(object?.payment_intent, 'pi');
      if (!sessionId) throw Error('Invalid checkout');
      if (object.mode === 'payment' && object.payment_status === 'paid' && Number.isSafeInteger(object.amount_total) && object.amount_total > 0) {
        const key = pi || sessionId;
        if (pi && state.orders[sessionId]?.sessionId === sessionId) delete state.orders[sessionId];
        const previous = state.orders[key];
        const items = mapItems(object, catalog);
        const shipping = object.collected_information?.shipping_details || object.shipping_details;
        const reason = !pi ? 'missing_payment_intent' : !items ? 'unknown_mapping' : !validUSShipping(shipping) ? 'invalid_us_shipping' : object.currency !== 'usd' ? 'unsupported_currency' : null;
        if (previous?.sessionId && previous.sessionId !== sessionId) {
          previous.status = 'needs_review'; previous.reason = 'conflicting_checkout';
        } else {
          state.orders[key] = { paymentIntentId: pi, sessionId, paid: true, amountTotal: object.amount_total, currency: object.currency === 'usd' ? 'usd' : 'unsupported', items: items || [], status: reason ? 'needs_review' : 'manual_fulfillment', reason };
        }
        result = 'recorded';
      }
    }
    state.events[event.id] = { result };
    return result;
  });
}
