/**
 * In-memory rate limiter using a sliding window.
 *
 * Limits:
 *   login:        5 per minute per IP
 *   register:     3 per hour per IP
 *   forgot-pw:    3 per 15 minutes per IP
 *   downloads:    10 per minute per token
 *   subscribe:    3 per hour per IP
 */

interface WindowEntry {
  count: number;
  resetAt: number; // epoch ms
}

const stores: Record<string, Map<string, WindowEntry>> = {
  login: new Map(),
  register: new Map(),
  "forgot-password": new Map(),
  download: new Map(),
  subscribe: new Map(),
};

const WINDOWS: Record<string, number> = {
  login: 60_000, // 1 minute
  register: 3_600_000, // 1 hour
  "forgot-password": 900_000, // 15 minutes
  download: 60_000, // 1 minute
  subscribe: 3_600_000, // 1 hour
};

const MAX_REQUESTS: Record<string, number> = {
  login: 5,
  register: 3,
  "forgot-password": 3,
  download: 10,
  subscribe: 3,
};

/**
 * Check if a key (IP or token) is within the rate limit for the given action.
 * Returns `true` if the request is allowed, `false` if rate-limited.
 */
export function checkRateLimit(
  action: "login" | "register" | "forgot-password" | "download" | "subscribe",
  key: string,
): boolean {
  const store = stores[action];
  if (!store) return true;

  const now = Date.now();
  const entry = store.get(key);

  if (!entry || now > entry.resetAt) {
    // First request or window expired — reset
    store.set(key, { count: 1, resetAt: now + WINDOWS[action] });
    return true;
  }

  if (entry.count < MAX_REQUESTS[action]) {
    entry.count++;
    return true;
  }

  return false; // rate limited
}

/**
 * Clean up expired entries. Call periodically or on each request.
 */
export function cleanupRateLimits(): void {
  const now = Date.now();
  for (const store of Object.values(stores)) {
    for (const [key, entry] of store) {
      if (now > entry.resetAt) {
        store.delete(key);
      }
    }
  }
}
