import { NextRequest, NextResponse } from 'next/server';
import { Redis } from '@upstash/redis';
import { Ratelimit } from '@upstash/ratelimit';
import logger from './logger';

const url = process.env.UPSTASH_REDIS_REST_URL;
const token = process.env.UPSTASH_REDIS_REST_TOKEN;

const isConfigured = Boolean(url && token);

let redis: Redis | null = null;
let reservationLimiter: Ratelimit | null = null;
let loginLimiter: Ratelimit | null = null;

if (isConfigured) {
  redis = new Redis({
    url: url!,
    token: token!,
  });

  // 5 requests per 10 minutes for reservations
  reservationLimiter = new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(5, '10 m'),
    analytics: true,
    prefix: 'ratelimit:reservation',
  });

  // 5 requests per 15 minutes for login attempts
  loginLimiter = new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(5, '15 m'),
    analytics: true,
    prefix: 'ratelimit:login',
  });
} else {
  logger.warn('⚠️ Upstash Redis environment variables are missing. Rate limiting operating in BYPASS mode.');
}

/**
 * Helper to extract client IP address from NextRequest
 */
export function getClientIp(req: NextRequest): string {
  const forwardedFor = req.headers.get('x-forwarded-for');
  if (forwardedFor) {
    return forwardedFor.split(',')[0].trim();
  }
  const realIp = req.headers.get('x-real-ip');
  if (realIp) {
    return realIp.trim();
  }
  return req.ip || '127.0.0.1';
}

export type RateLimitType = 'reservation' | 'login';

/**
 * Checks rate limit for a request.
 * If credentials are missing, allows request and logs warning.
 */
export async function checkRateLimit(req: NextRequest, type: RateLimitType): Promise<{ success: boolean; response?: NextResponse }> {
  if (!isConfigured) {
    return { success: true };
  }

  const limiter = type === 'reservation' ? reservationLimiter : loginLimiter;
  if (!limiter) {
    return { success: true };
  }

  const ip = getClientIp(req);
  const { success, limit, remaining, reset } = await limiter.limit(ip);

  if (!success) {
    const retryAfter = Math.ceil((reset - Date.now()) / 1000);
    logger.warn(`🛑 Rate limit exceeded for IP ${ip} on [${type}]. Remaining: ${remaining}`);
    
    return {
      success: false,
      response: NextResponse.json(
        {
          error: 'Too Many Requests',
          message: 'You have exceeded the rate limit. Please try again later.',
          retryAfterSeconds: retryAfter > 0 ? retryAfter : 60,
        },
        {
          status: 429,
          headers: {
            'Retry-After': String(retryAfter > 0 ? retryAfter : 60),
            'X-RateLimit-Limit': String(limit),
            'X-RateLimit-Remaining': String(remaining),
            'X-RateLimit-Reset': String(reset),
          },
        }
      ),
    };
  }

  return { success: true };
}
