export function createLedgerQuoteConsumer(ledger, now = () => Date.now()) {
  if (!ledger?.transact) throw new Error('persistent ledger required for quote consumption');
  return async ({ jti, exp }) => {
    if (!/^[A-Za-z0-9_-]{16,80}$/.test(String(jti || '')) || !Number.isInteger(exp)) return false;
    const epoch = Math.floor(now() / 1000);
    if (exp <= epoch) return false;
    return ledger.transact(state => {
      state.quoteUses ||= {};
      for (const [key, expiresAt] of Object.entries(state.quoteUses)) {
        if (!Number.isInteger(expiresAt) || expiresAt <= epoch) delete state.quoteUses[key];
      }
      if (state.quoteUses[jti]) return false;
      state.quoteUses[jti] = exp;
      return true;
    });
  };
}
