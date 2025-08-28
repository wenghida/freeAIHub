import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { RateLimiter } from "@/lib/middleware/rate-limiter";
import {
  validateTurnstile,
  shouldSkipTurnstileValidation,
} from "@/lib/middleware/turnstile-middleware";

// 配置需要应用中间件的路径
export const config = {
  matcher: [
    "/api/text-to-image",
    "/api/text-to-text",
    "/api/text-to-speech",
    "/api/speech-to-text",
    "/api/generate-image-prompt",
  ],
};

// 创建一个全局的限流器实例供中间件使用
const globalRateLimiter = new RateLimiter(20, 60 * 1000); // 20 requests per minute

export async function middleware(request: NextRequest) {
  // Check if we should skip Turnstile validation for this request
  if (!shouldSkipTurnstileValidation(request)) {
    // Apply Turnstile verification first
    const turnstileResponse = await validateTurnstile(request);
    if (turnstileResponse) {
      return turnstileResponse;
    }
  }

  // Apply IP rate limiting
  const ip = globalRateLimiter.getKey(request);
  const rateLimitResult = globalRateLimiter.checkLimit(ip);

  if (!rateLimitResult.allowed) {
    return NextResponse.json(
      {
        error: "Too many requests",
        message: `Maximum 20 requests per minute per IP`,
        retryAfter: Math.ceil((rateLimitResult.resetTime - Date.now()) / 1000),
      },
      {
        status: 429,
        headers: {
          "X-RateLimit-Limit": "20",
          "X-RateLimit-Remaining": "0",
          "X-RateLimit-Reset": new Date(
            rateLimitResult.resetTime
          ).toISOString(),
          "Retry-After": Math.ceil(
            (rateLimitResult.resetTime - Date.now()) / 1000
          ).toString(),
        },
      }
    );
  }

  // Add response headers
  const response = NextResponse.next();
  response.headers.set("X-RateLimit-Limit", "20");
  response.headers.set(
    "X-RateLimit-Remaining",
    rateLimitResult.remaining.toString()
  );
  response.headers.set(
    "X-RateLimit-Reset",
    new Date(rateLimitResult.resetTime).toISOString()
  );

  return response;
}
