export const runtime = 'edge';

import { NextRequest, NextResponse } from "next/server";
import { logger } from "@/lib/utils/logger";
import {
  createErrorResponse,
  withErrorHandler,
  Errors,
} from "@/lib/middleware/error-handler";
import { rateLimit } from "@/lib/middleware/rate-limiter";
import { validateTurnstile } from "@/lib/middleware/turnstile-middleware";

// 导入图像提示词维度常量
import {
  IMAGE_PROMPT_SUBJECTS,
  IMAGE_PROMPT_STYLES,
  IMAGE_PROMPT_QUALITIES,
  IMAGE_PROMPT_COMPOSITIONS,
  IMAGE_PROMPT_LIGHTING,
  IMAGE_PROMPT_COLORS,
  IMAGE_PROMPT_MOODS,
  IMAGE_PROMPT_ENVIRONMENTS,
  type ImagePromptSubject,
  type ImagePromptStyle,
  type ImagePromptQuality,
  type ImagePromptComposition,
  type ImagePromptLighting,
  type ImagePromptColor,
  type ImagePromptMood,
  type ImagePromptEnvironment,
} from "@/lib/constants/image-prompt-dimensions";

interface GenerateImagePromptRequest {
  subject: ImagePromptSubject | string;
  style: ImagePromptStyle | string;
  quality: ImagePromptQuality | string;
  composition: ImagePromptComposition | string;
  lighting: ImagePromptLighting | string;
  color: ImagePromptColor | string;
  mood: ImagePromptMood | string;
  environment: ImagePromptEnvironment | string;
  customSubject?: string;
  customStyle?: string;
  customQuality?: string;
  customComposition?: string;
  customLighting?: string;
  customColor?: string;
  customMood?: string;
  customEnvironment?: string;
}

// 验证参数是否有效
const isValidDimension = (
  value: string,
  dimensionArray: readonly string[]
): boolean => {
  return dimensionArray.includes(value) || value === "other" || value === "";
};

const rateLimiter = rateLimit(20, 60 * 1000); // 20 requests per minute

export const POST = withErrorHandler(async (request: NextRequest) => {
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

  try {
    const body: GenerateImagePromptRequest = await request.json();

    // 验证参数是否在有效范围内（允许空值）
    if (
      body.subject &&
      !isValidDimension(body.subject, IMAGE_PROMPT_SUBJECTS)
    ) {
      const error = Errors.validation("Invalid subject value");
      logger.logResponse(
        logId,
        error.status,
        Date.now() - startTime,
        error.message
      );
      return createErrorResponse(error, request);
    }

    if (body.style && !isValidDimension(body.style, IMAGE_PROMPT_STYLES)) {
      const error = Errors.validation("Invalid style value");
      logger.logResponse(
        logId,
        error.status,
        Date.now() - startTime,
        error.message
      );
      return createErrorResponse(error, request);
    }

    if (
      body.quality &&
      !isValidDimension(body.quality, IMAGE_PROMPT_QUALITIES)
    ) {
      const error = Errors.validation("Invalid quality value");
      logger.logResponse(
        logId,
        error.status,
        Date.now() - startTime,
        error.message
      );
      return createErrorResponse(error, request);
    }

    if (
      body.composition &&
      !isValidDimension(body.composition, IMAGE_PROMPT_COMPOSITIONS)
    ) {
      const error = Errors.validation("Invalid composition value");
      logger.logResponse(
        logId,
        error.status,
        Date.now() - startTime,
        error.message
      );
      return createErrorResponse(error, request);
    }

    if (
      body.lighting &&
      !isValidDimension(body.lighting, IMAGE_PROMPT_LIGHTING)
    ) {
      const error = Errors.validation("Invalid lighting value");
      logger.logResponse(
        logId,
        error.status,
        Date.now() - startTime,
        error.message
      );
      return createErrorResponse(error, request);
    }

    if (body.color && !isValidDimension(body.color, IMAGE_PROMPT_COLORS)) {
      const error = Errors.validation("Invalid color value");
      logger.logResponse(
        logId,
        error.status,
        Date.now() - startTime,
        error.message
      );
      return createErrorResponse(error, request);
    }

    if (body.mood && !isValidDimension(body.mood, IMAGE_PROMPT_MOODS)) {
      const error = Errors.validation("Invalid mood value");
      logger.logResponse(
        logId,
        error.status,
        Date.now() - startTime,
        error.message
      );
      return createErrorResponse(error, request);
    }

    if (
      body.environment &&
      !isValidDimension(body.environment, IMAGE_PROMPT_ENVIRONMENTS)
    ) {
      const error = Errors.validation("Invalid environment value");
      logger.logResponse(
        logId,
        error.status,
        Date.now() - startTime,
        error.message
      );
      return createErrorResponse(error, request);
    }

    // 验证至少选择了一个选项
    const hasAtLeastOneSelection =
      body.subject ||
      body.style ||
      body.quality ||
      body.composition ||
      body.lighting ||
      body.color ||
      body.mood ||
      body.environment;
    if (!hasAtLeastOneSelection) {
      const error = Errors.validation("Please select at least one dimension");
      logger.logResponse(
        logId,
        error.status,
        Date.now() - startTime,
        error.message
      );
      return createErrorResponse(error, request);
    }

    // 验证自定义输入字符限制（最多10个字符）
    if (body.customSubject && body.customSubject.length > 10) {
      const error = Errors.validation(
        "Custom subject cannot exceed 10 characters"
      );
      logger.logResponse(
        logId,
        error.status,
        Date.now() - startTime,
        error.message
      );
      return createErrorResponse(error, request);
    }

    if (body.customStyle && body.customStyle.length > 10) {
      const error = Errors.validation(
        "Custom style cannot exceed 10 characters"
      );
      logger.logResponse(
        logId,
        error.status,
        Date.now() - startTime,
        error.message
      );
      return createErrorResponse(error, request);
    }

    if (body.customQuality && body.customQuality.length > 10) {
      const error = Errors.validation(
        "Custom quality cannot exceed 10 characters"
      );
      logger.logResponse(
        logId,
        error.status,
        Date.now() - startTime,
        error.message
      );
      return createErrorResponse(error, request);
    }

    if (body.customComposition && body.customComposition.length > 10) {
      const error = Errors.validation(
        "Custom composition cannot exceed 10 characters"
      );
      logger.logResponse(
        logId,
        error.status,
        Date.now() - startTime,
        error.message
      );
      return createErrorResponse(error, request);
    }

    if (body.customLighting && body.customLighting.length > 10) {
      const error = Errors.validation(
        "Custom lighting cannot exceed 10 characters"
      );
      logger.logResponse(
        logId,
        error.status,
        Date.now() - startTime,
        error.message
      );
      return createErrorResponse(error, request);
    }

    if (body.customColor && body.customColor.length > 10) {
      const error = Errors.validation(
        "Custom color cannot exceed 10 characters"
      );
      logger.logResponse(
        logId,
        error.status,
        Date.now() - startTime,
        error.message
      );
      return createErrorResponse(error, request);
    }

    if (body.customMood && body.customMood.length > 10) {
      const error = Errors.validation(
        "Custom mood cannot exceed 10 characters"
      );
      logger.logResponse(
        logId,
        error.status,
        Date.now() - startTime,
        error.message
      );
      return createErrorResponse(error, request);
    }

    if (body.customEnvironment && body.customEnvironment.length > 10) {
      const error = Errors.validation(
        "Custom environment cannot exceed 10 characters"
      );
      logger.logResponse(
        logId,
        error.status,
        Date.now() - startTime,
        error.message
      );
      return createErrorResponse(error, request);
    }

    // 处理自定义输入
    const subject =
      body.subject === "other" && body.customSubject
        ? body.customSubject
        : body.subject;
    const style =
      body.style === "other" && body.customStyle
        ? body.customStyle
        : body.style;
    const quality =
      body.quality === "other" && body.customQuality
        ? body.customQuality
        : body.quality;
    const composition =
      body.composition === "other" && body.customComposition
        ? body.customComposition
        : body.composition;
    const lighting =
      body.lighting === "other" && body.customLighting
        ? body.customLighting
        : body.lighting;
    const color =
      body.color === "other" && body.customColor
        ? body.customColor
        : body.color;
    const mood =
      body.mood === "other" && body.customMood ? body.customMood : body.mood;
    const environment =
      body.environment === "other" && body.customEnvironment
        ? body.customEnvironment
        : body.environment;

    // 构建基础提示词（只处理选择了的维度）
    const promptParts = [
      subject,
      style,
      quality,
      composition,
      lighting,
      color,
      mood,
      environment,
    ].filter((part) => part && part !== "other");

    const basePrompt = promptParts.join(", ");

    // 调用Pollinations API生成优化的图像提示词
    try {
      // 构建Pollinations API URL
      const systemInstruction =
        "Please create a detailed and creative image generation prompt that is suitable for artificial intelligence image generation, with no more than 1000 characters, based on the following elements:";
      const fullPrompt = `${systemInstruction}\n\n${basePrompt}`;

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

      let optimizedPrompt = basePrompt;
      if (response.ok) {
        const textResponse = await response.text();
        if (textResponse && textResponse.trim().length > 0) {
          optimizedPrompt = textResponse.trim();
        }
      }

      const result = {
        success: true,
        prompt: optimizedPrompt,
        basePrompt: basePrompt,
        dimensions: {
          subject,
          style,
          quality,
          composition,
          lighting,
          color,
          mood,
          environment,
        },
      };

      logger.logResponse(logId, 200, Date.now() - startTime);
      return NextResponse.json(result);
    } catch (apiError) {
      // 如果Pollinations API调用失败，返回基础提示词
      const result = {
        success: true,
        prompt: basePrompt,
        basePrompt: basePrompt,
        dimensions: {
          subject,
          style,
          quality,
          composition,
          lighting,
          color,
          mood,
          environment,
        },
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

    const apiError = Errors.internal("Failed to generate image prompt");
    logger.logResponse(logId, apiError.status, responseTime, apiError.message);
    throw apiError;
  }
});
