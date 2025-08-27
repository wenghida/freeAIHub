import { logger } from "@/lib/utils/logger";

export interface TurnstileVerificationResult {
  success: boolean;
  errorCodes?: string[];
  hostname?: string;
  challengeTimestamp?: string;
  action?: string;
}

/**
 * Verify Turnstile token with Cloudflare API
 */
export async function verifyTurnstileToken(
  token: string,
  remoteip?: string
): Promise<TurnstileVerificationResult> {
  const secretKey = process.env.TURNSTILE_SECRET_KEY;

  if (!secretKey) {
    logger.logError("Turnstile secret key not configured");
    return {
      success: false,
      errorCodes: ["missing-secret-key"],
    };
  }

  if (!token) {
    return {
      success: false,
      errorCodes: ["missing-input-response"],
    };
  }

  try {
    const formData = new FormData();
    formData.append("secret", secretKey);
    formData.append("response", token);
    if (remoteip) {
      formData.append("remoteip", remoteip);
    }

    const response = await fetch(
      "https://challenges.cloudflare.com/turnstile/v0/siteverify",
      {
        method: "POST",
        body: formData,
      }
    );

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result = await response.json();

    return {
      success: result.success,
      errorCodes: result["error-codes"],
      hostname: result.hostname,
      challengeTimestamp: result.challenge_ts,
      action: result.action,
    };
  } catch (error) {
    logger.logError("Turnstile verification failed", error);
    return {
      success: false,
      errorCodes: ["internal-error"],
    };
  }
}

/**
 * Get user-friendly error message for Turnstile error codes
 */
export function getTurnstileErrorMessage(errorCodes?: string[]): string {
  if (!errorCodes || errorCodes.length === 0) {
    return "Verification failed, please try again";
  }

  const errorMessages: Record<string, string> = {
    "missing-secret-key": "Verification service not configured",
    "missing-input-secret": "Service configuration error",
    "invalid-input-secret": "Service configuration error",
    "missing-input-response": "Please complete the verification challenge",
    "invalid-input-response": "Verification has expired, please try again",
    "bad-request": "Invalid request format",
    "timeout-or-duplicate": "Verification timeout or duplicate submission",
    "internal-error": "Verification service temporarily unavailable",
  };

  const primaryError = errorCodes[0];
  return errorMessages[primaryError] || "Verification failed, please try again";
}

/**
 * Check if error code indicates a retryable error
 */
export function isRetryableError(errorCodes?: string[]): boolean {
  if (!errorCodes) return true;

  const retryableErrors = [
    "timeout-or-duplicate",
    "internal-error",
    "invalid-input-response",
  ];

  return errorCodes.some((code) => retryableErrors.includes(code));
}
