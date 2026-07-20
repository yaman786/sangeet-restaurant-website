interface RateLimitStore {
  count: number;
  resetTime: number;
}

const store = new Map<string, RateLimitStore>();

let lastCleanup = Date.now();
const CLEANUP_INTERVAL = 60000; // 1 minute

/**
 * Basic in-memory rate limiter.
 * Note: In a serverless environment (like Vercel), this state may be lost between cold starts
 * and is not shared across edge nodes. For robust production rate limiting, integrate 
 * @upstash/ratelimit with Redis.
 * 
 * @param ip The IP address or unique identifier to limit
 * @param limit Max number of requests allowed in the window
 * @param windowMs Time window in milliseconds
 * @returns { success: boolean, limit: number, remaining: number, reset: number }
 */
export function rateLimit(ip: string, limit = 5, windowMs = 60000) {
  const now = Date.now();

  // Passive cleanup to prevent memory leaks in long-running processes
  if (now - lastCleanup > CLEANUP_INTERVAL) {
    for (const [key, value] of Array.from(store.entries())) {
      if (now > value.resetTime) {
        store.delete(key);
      }
    }
    lastCleanup = now;
  }

  const record = store.get(ip);

  if (!record || now > record.resetTime) {
    store.set(ip, {
      count: 1,
      resetTime: now + windowMs,
    });
    return { success: true, limit, remaining: limit - 1, reset: now + windowMs };
  }

  if (record.count >= limit) {
    return { success: false, limit, remaining: 0, reset: record.resetTime };
  }

  record.count += 1;
  store.set(ip, record);

  return { success: true, limit, remaining: limit - record.count, reset: record.resetTime };
}
