import { NextRequest, NextResponse } from 'next/server';

interface RateLimitData {
  count: number;
  resetTime: number;
}

export class RateLimiter {
  private requests = new Map<string, RateLimitData>();
  private readonly maxRequests: number;
  private readonly windowMs: number;

  constructor(maxRequests: number = 20, windowMs: number = 60 * 1000) {
    this.maxRequests = maxRequests;
    this.windowMs = windowMs;
  }

  checkLimit(key: string): { allowed: boolean; resetTime: number; remaining: number } {
    const now = Date.now();
    const data = this.requests.get(key);

    if (!data || now > data.resetTime) {
      // 新窗口期或已过期的窗口期
      this.requests.set(key, {
        count: 1,
        resetTime: now + this.windowMs,
      });
      return {
        allowed: true,
        resetTime: now + this.windowMs,
        remaining: this.maxRequests - 1,
      };
    }

    if (data.count >= this.maxRequests) {
      // 超过限制
      return {
        allowed: false,
        resetTime: data.resetTime,
        remaining: 0,
      };
    }

    // 增加计数
    data.count++;
    return {
      allowed: true,
      resetTime: data.resetTime,
      remaining: this.maxRequests - data.count,
    };
  }

  cleanup() {
    const now = Date.now();
    for (const [key, data] of this.requests.entries()) {
      if (now > data.resetTime) {
        this.requests.delete(key);
      }
    }
  }

  getKey(request: NextRequest): string {
    const forwarded = request.headers.get('x-forwarded-for');
    const realIp = request.headers.get('x-real-ip');
    
    if (forwarded) {
      return forwarded.split(',')[0].trim();
    }
    
    if (realIp) {
      return realIp;
    }
    
    return '127.0.0.1';
  }
}

export function rateLimit(
  maxRequests?: number,
  windowMs?: number
) {
  const limiter = new RateLimiter(maxRequests, windowMs);
  
  return async function middleware(request: NextRequest) {
    const ip = limiter.getKey(request);
    const result = limiter.checkLimit(ip);

    const headers = {
      'X-RateLimit-Limit': (maxRequests || 20).toString(),
      'X-RateLimit-Remaining': result.remaining.toString(),
      'X-RateLimit-Reset': new Date(result.resetTime).toISOString(),
    };

    if (!result.allowed) {
      return NextResponse.json(
        {
          error: 'Too many requests',
          message: `Each IP can make up to ${maxRequests || 20} requests per minute`,
          retryAfter: Math.ceil((result.resetTime - Date.now()) / 1000),
        },
        {
          status: 429,
          headers,
        }
      );
    }

    // For app route handlers, we return null when the request is allowed
    // to indicate that the request should continue to the route handler
    return null;
  };
}