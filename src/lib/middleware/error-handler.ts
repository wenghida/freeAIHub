import { NextRequest, NextResponse } from "next/server";

export interface ApiError {
  status: number;
  message: string;
  code?: string;
  details?: any;
  timestamp: string;
  path: string;
}

export class AppError extends Error {
  status: number;
  code?: string;
  details?: any;

  constructor(
    message: string,
    status: number = 500,
    code?: string,
    details?: any
  ) {
    super(message);
    this.name = "AppError";
    this.status = status;
    this.code = code;
    this.details = details;
  }
}

export function createErrorResponse(
  error: Error | AppError,
  request: NextRequest,
  status?: number
): NextResponse {
  const isDev = process.env.NODE_ENV === "development";

  const apiError: ApiError = {
    status: status || (error instanceof AppError ? error.status : 500),
    message: error.message || "Internal server error",
    code: error instanceof AppError ? error.code : "INTERNAL_SERVER_ERROR",
    details: isDev
      ? error instanceof AppError
        ? error.details
        : error.stack
      : undefined,
    timestamp: new Date().toISOString(),
    path: request.url,
  };

  return NextResponse.json(apiError, {
    status: apiError.status,
    headers: {
      "Content-Type": "application/json",
      "Cache-Control": "no-cache",
    },
  });
}

// 错误代码定义
export const ErrorCodes = {
  // 客户端错误 (4xx)
  BAD_REQUEST: "BAD_REQUEST",
  UNAUTHORIZED: "UNAUTHORIZED",
  FORBIDDEN: "FORBIDDEN",
  NOT_FOUND: "NOT_FOUND",
  METHOD_NOT_ALLOWED: "METHOD_NOT_ALLOWED",
  TOO_MANY_REQUESTS: "TOO_MANY_REQUESTS",
  VALIDATION_ERROR: "VALIDATION_ERROR",

  // 服务器错误 (5xx)
  INTERNAL_SERVER_ERROR: "INTERNAL_SERVER_ERROR",
  SERVICE_UNAVAILABLE: "SERVICE_UNAVAILABLE",
  GATEWAY_TIMEOUT: "GATEWAY_TIMEOUT",

  // 特定业务错误
  INVALID_PROMPT: "INVALID_PROMPT",
  PROMPT_TOO_LONG: "PROMPT_TOO_LONG",
  INVALID_IMAGE_SIZE: "INVALID_IMAGE_SIZE",
  INVALID_AUDIO_FORMAT: "INVALID_AUDIO_FORMAT",
  AUDIO_TOO_LARGE: "AUDIO_TOO_LARGE",
  TEXT_TOO_LONG: "TEXT_TOO_LONG",
  API_LIMIT_EXCEEDED: "API_LIMIT_EXCEEDED",
} as const;

// 预定义错误类型
export const Errors = {
  // 400 Bad Request
  badRequest: (message: string = "Bad request parameters", details?: any) =>
    new AppError(message, 400, ErrorCodes.BAD_REQUEST, details),

  validation: (message: string = "Parameter validation failed", details?: any) =>
    new AppError(message, 400, ErrorCodes.VALIDATION_ERROR, details),

  // 401 Unauthorized
  unauthorized: (message: string = "Unauthorized access") =>
    new AppError(message, 401, ErrorCodes.UNAUTHORIZED),

  // 403 Forbidden
  forbidden: (message: string = "Access denied") =>
    new AppError(message, 403, ErrorCodes.FORBIDDEN),

  // 404 Not Found
  notFound: (message: string = "Resource not found") =>
    new AppError(message, 404, ErrorCodes.NOT_FOUND),

  // 429 Too Many Requests
  tooManyRequests: (message: string = "Too many requests") =>
    new AppError(message, 429, ErrorCodes.TOO_MANY_REQUESTS),

  // 500 Internal Server Error
  internal: (message: string = "Internal server error", details?: any) =>
    new AppError(message, 500, ErrorCodes.INTERNAL_SERVER_ERROR, details),

  // 503 Service Unavailable
  serviceUnavailable: (message: string = "Service temporarily unavailable") =>
    new AppError(message, 503, ErrorCodes.SERVICE_UNAVAILABLE),

  // 504 Gateway Timeout
  timeout: (message: string = "Request timeout") =>
    new AppError(message, 504, ErrorCodes.GATEWAY_TIMEOUT),

  // 业务特定错误
  invalidPrompt: (message: string = "Invalid prompt") =>
    new AppError(message, 400, ErrorCodes.INVALID_PROMPT),

  promptTooLong: (maxLength: number) =>
    new AppError(
      `Prompt length cannot exceed ${maxLength} characters`,
      400,
      ErrorCodes.PROMPT_TOO_LONG
    ),

  invalidAudioFormat: (validFormats: string[]) =>
    new AppError(
      `Audio format must be one of: ${validFormats.join(", ")}`,
      400,
      ErrorCodes.INVALID_AUDIO_FORMAT
    ),

  audioTooLarge: (maxSize: string) =>
    new AppError(
      `Audio file size cannot exceed ${maxSize}`,
      400,
      ErrorCodes.AUDIO_TOO_LARGE
    ),

  textTooLong: (maxLength: number) =>
    new AppError(
      `Text length cannot exceed ${maxLength} characters`,
      400,
      ErrorCodes.TEXT_TOO_LONG
    ),

  apiLimitExceeded: (limit: string) =>
    new AppError(
      `API call frequency exceeds limit: ${limit}`,
      429,
      ErrorCodes.API_LIMIT_EXCEEDED
    ),
};

// 全局错误处理器
export function withErrorHandler(handler: Function) {
  return async (request: NextRequest, ...args: any[]) => {
    try {
      return await handler(request, ...args);
    } catch (error) {
      console.error("API Error:", error);

      if (error instanceof AppError) {
        return createErrorResponse(error, request);
      }

      if (error instanceof Error) {
        return createErrorResponse(error, request);
      }

      return createErrorResponse(new Error("Unknown error"), request, 500);
    }
  };
}
