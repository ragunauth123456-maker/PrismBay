/**
 * Digital download access is released only for confirmed, positive USD payment-mode
 * Checkout sessions. A completed Checkout session may still be awaiting an
 * asynchronous payment. Do not grant access for unpaid or no-payment-required sessions.
 */
export type CheckoutPaymentSnapshot = {
  id?: unknown;
  mode?: unknown;
  payment_status?: unknown;
  amount_total?: unknown;
  currency?: unknown;
};
export function isPaidDigitalCheckout(session: CheckoutPaymentSnapshot | null | undefined): boolean {
  return Boolean(
    session &&
    typeof session.id === "string" &&
    session.id.startsWith("cs_") &&
    session.mode === "payment" &&
    session.payment_status === "paid" &&
    typeof session.amount_total === "number" &&
    Number.isSafeInteger(session.amount_total) &&
    session.amount_total > 0 &&
    session.currency === "usd"
  );
}
