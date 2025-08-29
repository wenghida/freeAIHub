export const runtime = 'edge';

import { NextRequest, NextResponse } from "next/server";
import NodeCache from "node-cache";
import { logger } from "@/lib/utils/logger";
import {
  createErrorResponse,
  withErrorHandler,
  Errors,
} from "@/lib/middleware/error-handler";
import { rateLimit } from "@/lib/middleware/rate-limiter";
import { validateTurnstile } from "@/lib/middleware/turnstile-middleware";

interface TextToImageRequest {
  prompt: string;
  width?: string;
  height?: string;
  model?: string;
  seed?: string;
}

export const POST = withErrorHandler(async (request: NextRequest) => {
  // 在请求处理函数内部创建缓存实例，避免在全局作用域中创建
  // 创建缓存实例，TTL为5分钟
  const errorCache = new NodeCache({
    stdTTL: 60, // 1分钟
    checkperiod: 30, // 每30秒检查过期
    useClones: false,
    maxKeys: 100, // 限制最大错误缓存数量
  });

  // 在请求处理函数内部创建限流器实例
  const rateLimiter = rateLimit(20, 60 * 1000); // 20 requests per minute

  // 应用速率限制
  const rateLimitResponse = await rateLimiter(request);

  if (rateLimitResponse) {
    return rateLimitResponse;
  }

  // 应用Turnstile验证
  const turnstileResponse = await validateTurnstile(request);
  if (turnstileResponse) {
    return turnstileResponse;
  }
  const startTime = Date.now();
  const logId = logger.logRequest(request);

  // 解析请求体，使用try-catch处理可能的错误
  let requestBody: any;
  try {
    requestBody = await request.json();
  } catch (error) {
    const parseError = Errors.validation("Invalid request body format", {
      field: "body",
    });
    logger.logResponse(
      logId,
      parseError.status,
      Date.now() - startTime,
      parseError.message
    );
    return createErrorResponse(parseError, request);
  }

  // 从请求体中提取参数，排除Turnstile令牌字段
  const {
    prompt,
    width = "1024",
    height = "1024",
    model = "flux",
    seed,
    turnstileToken,
    "cf-turnstile-response": cfTurnstileResponse,
    ...rest
  } = requestBody;

  // 验证是否有额外的未知字段
  const unknownFields = Object.keys(rest);
  if (unknownFields.length > 0) {
    const error = Errors.validation(
      `Unknown fields: ${unknownFields.join(", ")}`,
      { field: "body" }
    );
    logger.logResponse(
      logId,
      error.status,
      Date.now() - startTime,
      error.message
    );
    return createErrorResponse(error, request);
  }

  // 参数验证
  if (!prompt || prompt.trim().length === 0) {
    const error = Errors.validation("prompt parameter cannot be empty", {
      field: "prompt",
    });
    logger.logResponse(
      logId,
      error.status,
      Date.now() - startTime,
      error.message
    );
    return createErrorResponse(error, request);
  }

  // 清理和验证prompt输入，防止注入攻击
  const sanitizedPrompt = prompt.trim().replace(/[<>]/g, "");
  if (sanitizedPrompt.length > 1000) {
    const error = Errors.promptTooLong(1000);
    logger.logResponse(
      logId,
      error.status,
      Date.now() - startTime,
      error.message
    );
    return createErrorResponse(error, request);
  }

  // 创建安全的缓存key，防止缓存键注入
  // 注意：我们不希望缓存图像结果，因为即使相同的prompt也应该生成不同的图像
  // 所以我们将在生成随机seed后创建一个唯一的缓存键
  const cacheKey = `${encodeURIComponent(sanitizedPrompt)}_${width}_${height}_${model}_${seed || "random"}`;

  // 移除缓存检查逻辑，确保相同prompt生成不同图片
  // 检查错误缓存（避免重复失败）
  const cachedError = errorCache.get(cacheKey);
  if (cachedError) {
    const error = Errors.internal(
      "This request failed recently, please try again later"
    );
    logger.logResponse(
      logId,
      error.status,
      Date.now() - startTime,
      "Cached error"
    );
    return createErrorResponse(error, request);
  }

  // 构建Pollinations API URL，使用清理后的prompt
  const apiUrl = new URL(
    `https://image.pollinations.ai/prompt/${encodeURIComponent(sanitizedPrompt)}`
  );
  apiUrl.searchParams.set("width", width);
  apiUrl.searchParams.set("height", height);
  apiUrl.searchParams.set("model", "flux");
  apiUrl.searchParams.set("nologo", "true");
  apiUrl.searchParams.set("safe", "true");
  apiUrl.searchParams.set("private", "true");

  // 如果用户提供了seed，使用用户提供的seed，否则生成一个随机seed
  let seedValue: number;
  if (seed) {
    // 验证seed参数
    seedValue = parseInt(seed, 10);
    if (!isNaN(seedValue) && seedValue >= 0 && seedValue <= 999999999) {
      apiUrl.searchParams.set("seed", seedValue.toString());
    } else {
      // 如果用户提供的seed无效，生成一个随机seed
      // 使用 crypto.randomUUID() 生成随机数，避免在全局作用域中调用 Math.random()
      const uuid = crypto.randomUUID();
      seedValue = Math.abs(hashCode(uuid)) % 1000000000;
      apiUrl.searchParams.set("seed", seedValue.toString());
    }
  } else {
    // 用户未提供seed，生成一个随机seed
    // 使用 crypto.randomUUID() 生成随机数，避免在全局作用域中调用 Math.random()
    const uuid = crypto.randomUUID();
    seedValue = Math.abs(hashCode(uuid)) % 1000000000;
    apiUrl.searchParams.set("seed", seedValue.toString());
  }

  try {
    // 发起请求到Pollinations API
    const response = await fetch(apiUrl.toString(), {
      method: "GET",
      headers: {
        Accept: "image/jpeg",
      },
    });

    if (!response.ok) {
      const errorMessage = `Pollinations API error: ${response.status}`;
      errorCache.set(cacheKey, { error: errorMessage, timestamp: Date.now() });
      throw Errors.internal(
        `Image generation service is temporarily unavailable (${response.status})`
      );
    }

    // 获取图像数据
    const imageBuffer = await response.arrayBuffer();

    // 将图像数据转换为Base64编码
    const base64Image = Buffer.from(imageBuffer).toString("base64");

    // 构建响应
    const result = {
      success: true,
      imageData: `data:image/jpeg;base64,${base64Image}`,
      prompt: sanitizedPrompt,
      width: parseInt(width),
      height: parseInt(height),
      model,
    };

    // 不再缓存图像结果，确保相同prompt生成不同图片
    logger.logResponse(logId, 200, Date.now() - startTime);

    return NextResponse.json(result, {
      headers: {
        "Cache-Control": "public, max-age=300", // 5分钟缓存
        "X-Cache": "MISS",
        "X-Cache-Key": cacheKey,
        "X-Response-Time": `${Date.now() - startTime}ms`,
      },
    });
  } catch (error) {
    // 缓存错误结果
    if (error instanceof Error) {
      errorCache.set(cacheKey, { error: error.message, timestamp: Date.now() });
    }

    const responseTime = Date.now() - startTime;

    if (error instanceof Error && "status" in error) {
      logger.logResponse(
        logId,
        (error as any).status,
        responseTime,
        error.message
      );
      throw error;
    }

    const apiError = Errors.internal("Failed to generate image");
    logger.logResponse(logId, apiError.status, responseTime, apiError.message);
    throw apiError;
  }
});

// 添加一个简单的哈希函数，用于将 UUID 转换为数字
function hashCode(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash = hash & hash; // 转换为 32 位整数
  }
  return hash;
}
