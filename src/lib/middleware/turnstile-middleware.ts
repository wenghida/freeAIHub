import { NextRequest, NextResponse } from "next/server";
import {
  verifyTurnstileToken,
  getTurnstileErrorMessage,
} from "@/lib/security/turnstile-validator";
import { logger } from "@/lib/utils/logger";

/**
 * Turnstile validation middleware
 */
export async function validateTurnstile(
  request: NextRequest
): Promise<NextResponse | null> {
  // Get client IP
  const clientIP = getClientIP(request);

  try {
    // Extract Turnstile token from request body
    const body = await request.clone().json();
    const turnstileToken = body.turnstileToken || body["cf-turnstile-response"];

    if (!turnstileToken) {
      return NextResponse.json(
        {
          error: "Verification required",
          message: "Please complete the verification challenge",
          code: "TURNSTILE_MISSING",
        },
        { status: 400 }
      );
    }

    // Verify Turnstile token
    const verificationResult = await verifyTurnstileToken(
      turnstileToken,
      clientIP
    );

    if (!verificationResult.success) {
      const errorMessage = getTurnstileErrorMessage(
        verificationResult.errorCodes
      );

      logger.logTurnstileEvent("verification_failed", {
        ip: clientIP,
        errorCodes: verificationResult.errorCodes,
        userAgent: request.headers.get("user-agent") || undefined,
        url: request.url,
      });

      return NextResponse.json(
        {
          error: "Verification failed",
          message: errorMessage,
          code: "TURNSTILE_FAILED",
          details: verificationResult.errorCodes,
        },
        { status: 403 }
      );
    }

    // Verification successful, log the event
    logger.logTurnstileEvent("verification_success", {
      ip: clientIP,
      hostname: verificationResult.hostname,
      action: verificationResult.action,
      userAgent: request.headers.get("user-agent") || undefined,
      url: request.url,
    });

    // Verification successful, continue processing the request
    return null;
  } catch (error) {
    logger.logError("Turnstile middleware error", error);

    return NextResponse.json(
      {
        error: "Verification service error",
        message: "Verification service temporarily unavailable",
        code: "TURNSTILE_SERVICE_ERROR",
      },
      { status: 500 }
    );
  }
}

/**
 * Get the real client IP address
 */
function getClientIP(request: NextRequest): string {
  const forwarded = request.headers.get("x-forwarded-for");
  const realIp = request.headers.get("x-real-ip");
  const cfConnectingIp = request.headers.get("cf-connecting-ip");

  if (cfConnectingIp) return cfConnectingIp;
  if (forwarded) return forwarded.split(",")[0].trim();
  if (realIp) return realIp;

  return "127.0.0.1";
}

/**
 * Check if request should skip Turnstile validation
 * (for testing purposes or specific conditions)
 */
export function shouldSkipTurnstileValidation(request: NextRequest): boolean {
  // Skip validation for health check endpoints
  const pathname = request.nextUrl.pathname;
  if (pathname === "/api/health") {
    return true;
  }

  // Skip validation only if explicitly specified (for testing purposes)
  if (process.env.SKIP_TURNSTILE === "true") {
    console.log("[Turnstile] Skipping validation - explicitly disabled");
    return true;
  }

  // Check if Turnstile is properly configured
  if (
    !process.env.TURNSTILE_SECRET_KEY ||
    !process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY
  ) {
    console.warn(
      "[Turnstile] Keys not configured - blocking all requests for security"
    );
    return false; // Don't skip - this will force validation and block requests
  }

  return false;
}
