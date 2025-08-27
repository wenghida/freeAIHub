import { NextRequest, NextResponse } from "next/server";
import { verifyTurnstileToken } from "@/lib/security/turnstile-validator";

/**
 * Test endpoint for Turnstile verification
 * This endpoint is used to test the Turnstile verification functionality
 */
export async function POST(request: NextRequest) {
  try {
    const { turnstileToken } = await request.json();

    if (!turnstileToken) {
      return NextResponse.json(
        {
          success: false,
          error: "No Turnstile token provided",
          message: "Please complete the verification challenge",
        },
        { status: 400 }
      );
    }

    // Get client IP
    const clientIP =
      request.headers.get("x-forwarded-for") ||
      request.headers.get("x-real-ip") ||
      request.headers.get("cf-connecting-ip") ||
      "127.0.0.1";

    // Verify the Turnstile token
    const verificationResult = await verifyTurnstileToken(
      turnstileToken,
      clientIP
    );

    return NextResponse.json({
      success: verificationResult.success,
      verification: verificationResult,
      message: verificationResult.success
        ? "Turnstile verification successful"
        : "Turnstile verification failed",
      clientIP,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Turnstile test endpoint error:", error);

    return NextResponse.json(
      {
        success: false,
        error: "Verification test failed",
        message:
          error instanceof Error ? error.message : "Unknown error occurred",
      },
      { status: 500 }
    );
  }
}

