import { NextRequest, NextResponse } from "next/server";
import { v2 as cloudinary } from "cloudinary";
import { logger } from "@/lib/utils/logger";
import {
  createErrorResponse,
  withErrorHandler,
  Errors,
} from "@/lib/middleware/error-handler";
import { rateLimit } from "@/lib/middleware/rate-limiter";

// 配置Cloudinary
cloudinary.config({
  cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// 创建速率限制器，每分钟最多10次上传
const rateLimiter = rateLimit(10, 60 * 1000);

export const POST = withErrorHandler(async (request: NextRequest) => {
  // 应用速率限制
  const rateLimitResponse = await rateLimiter(request);
  if (rateLimitResponse) {
    return rateLimitResponse;
  }

  const startTime = Date.now();
  const logId = logger.logRequest(request);

  try {
    // 获取上传的数据
    const formData = await request.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      const error = Errors.validation("No file provided", { field: "file" });
      logger.logResponse(
        logId,
        error.status,
        Date.now() - startTime,
        error.message
      );
      return createErrorResponse(error, request);
    }

    // 验证文件类型
    const allowedTypes = ["image/jpeg", "image/png", "image/webp", "image/gif"];
    if (!allowedTypes.includes(file.type)) {
      const error = Errors.validation("Invalid file type. Only JPEG, PNG, WebP, and GIF are allowed.", { field: "file" });
      logger.logResponse(
        logId,
        error.status,
        Date.now() - startTime,
        error.message
      );
      return createErrorResponse(error, request);
    }

    // 验证文件大小 (最大10MB)
    if (file.size > 10 * 1024 * 1024) {
      const error = Errors.validation("File size too large. Maximum 10MB allowed.", { field: "file" });
      logger.logResponse(
        logId,
        error.status,
        Date.now() - startTime,
        error.message
      );
      return createErrorResponse(error, request);
    }

    // 将文件转换为buffer
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // 上传到Cloudinary
    const uploadResult = await new Promise<any>((resolve, reject) => {
      cloudinary.uploader
        .upload_stream(
          {
            folder: "freeai-hub/uploads",
            use_filename: true,
            unique_filename: true,
            overwrite: false,
            resource_type: "image",
          },
          (error, result) => {
            if (error) {
              reject(error);
            } else {
              resolve(result);
            }
          }
        )
        .end(buffer);
    });

    // 返回上传结果
    const result = {
      success: true,
      url: uploadResult.secure_url,
      publicId: uploadResult.public_id,
      format: uploadResult.format,
    };

    logger.logResponse(logId, 200, Date.now() - startTime);
    
    return NextResponse.json(result, {
      headers: {
        "Cache-Control": "no-cache",
        "X-Response-Time": `${Date.now() - startTime}ms`,
      },
    });
  } catch (error) {
    const responseTime = Date.now() - startTime;
    
    if (error instanceof Error) {
      const apiError = Errors.internal("Failed to upload image");
      logger.logResponse(logId, apiError.status, responseTime, error.message);
      return createErrorResponse(apiError, request);
    }

    const apiError = Errors.internal("Failed to upload image");
    logger.logResponse(logId, apiError.status, responseTime, apiError.message);
    return createErrorResponse(apiError, request);
  }
});