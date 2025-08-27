export const runtime = 'edge';

import { NextRequest, NextResponse } from "next/server";
import { logger } from "@/lib/utils/logger";
import {
  createErrorResponse,
  withErrorHandler,
  Errors,
} from "@/lib/middleware/error-handler";

interface OptimizePromptRequest {
  prompt: string;
}

// 优化prompt的端点
export const POST = withErrorHandler(async (request: NextRequest) => {
  const startTime = Date.now();
  const logId = logger.logRequest(request);

  try {
    const body: OptimizePromptRequest = await request.json();
    
    // 输入验证
    if (!body.prompt || body.prompt.trim().length === 0) {
      const error = Errors.validation("prompt parameter cannot be empty", { field: "prompt" });
      logger.logResponse(
        logId,
        error.status,
        Date.now() - startTime,
        error.message
      );
      return createErrorResponse(error, request);
    }

    // 清理和验证prompt输入
    const sanitizedPrompt = body.prompt.trim().replace(/[<>]/g, "");
    if (sanitizedPrompt.length > 500) {
      const error = Errors.promptTooLong(500);
      logger.logResponse(
        logId,
        error.status,
        Date.now() - startTime,
        error.message
      );
      return createErrorResponse(error, request);
    }

    // 构建优化后的prompt指令
    const systemInstruction = "Please create a detailed and creative image generation prompt that is suitable for artificial intelligence image generation, with no more than 500 characters, based on the following user input:";
    const fullPrompt = `${systemInstruction}\n\n${sanitizedPrompt}`;

    // 调用Pollinations API优化prompt
    try {
      const apiUrl = new URL(
        "https://text.pollinations.ai/" + encodeURIComponent(fullPrompt)
      );
      apiUrl.searchParams.set("model", "openai");
      apiUrl.searchParams.set("max_tokens", "100");

      // 发起请求到Pollinations文本API
      const response = await fetch(apiUrl.toString(), {
        method: "GET",
        headers: {
          Accept: "text/plain",
        },
      });

      let optimizedPrompt = sanitizedPrompt;
      if (response.ok) {
        const textResponse = await response.text();
        if (textResponse && textResponse.trim().length > 0) {
          optimizedPrompt = textResponse.trim();
        }
      }

      const result = {
        success: true,
        optimizedPrompt: optimizedPrompt,
      };

      logger.logResponse(logId, 200, Date.now() - startTime);
      return NextResponse.json(result);
    } catch (apiError) {
      // 如果Pollinations API调用失败，返回原始prompt
      const result = {
        success: true,
        optimizedPrompt: sanitizedPrompt,
      };

      logger.logResponse(logId, 200, Date.now() - startTime);
      return NextResponse.json(result);
    }
  } catch (error) {
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

    const apiError = Errors.internal("Failed to optimize prompt");
    logger.logResponse(logId, apiError.status, responseTime, apiError.message);
    throw apiError;
  }
});