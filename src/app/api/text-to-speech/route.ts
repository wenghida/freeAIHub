import { NextRequest, NextResponse } from "next/server";
import { rateLimit } from "@/lib/middleware/rate-limiter";
import { validateTurnstile } from "@/lib/middleware/turnstile-middleware";

interface TextToSpeechRequest {
  text: string;
  voice?: string;
  language?: "zh" | "en" | "ja" | "ko";
  speed?: number;
}

const voiceOptions = {
  zh: [
    "zh-CN-XiaoxiaoNeural",
    "zh-CN-YunjianNeural",
    "zh-CN-XiaoyiNeural",
    "zh-CN-YunxiNeural",
  ],
  en: [
    "en-US-AriaNeural",
    "en-US-JennyNeural",
    "en-US-GuyNeural",
    "en-US-DavisNeural",
  ],
  ja: ["ja-JP-NanamiNeural", "ja-JP-KeitaNeural"],
  ko: ["ko-KR-SunHiNeural", "ko-KR-InJoonNeural"],
};

// Pollinations TTS支持的音色
const pollinationsVoices = ["alloy", "echo", "fable", "onyx", "nova", "shimmer"];

const rateLimiter = rateLimit(20, 60 * 1000); // 20 requests per minute

export async function POST(request: NextRequest) {
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

  try {
    // 解析请求体，使用try-catch处理可能的错误
    let requestBody: any;
    try {
      requestBody = await request.json();
    } catch (error) {
      return NextResponse.json({ error: "Invalid request body format" }, { status: 400 });
    }
    
    // 从请求体中提取参数，排除Turnstile令牌字段
    const {
      text,
      voice,
      language = "zh",
      speed = 1.0,
      turnstileToken,
      "cf-turnstile-response": cfTurnstileResponse,
      ...rest
    } = requestBody;

    // 验证是否有额外的未知字段
    const unknownFields = Object.keys(rest);
    if (unknownFields.length > 0) {
      return NextResponse.json({ error: `Unknown fields: ${unknownFields.join(", ")}` }, { status: 400 });
    }

    // 参数验证
    if (!text || text.trim().length === 0) {
      return NextResponse.json(
        { error: "Text cannot be empty" },
        { status: 400 }
      );
    }

    // 清理和验证文本输入
    const sanitizedText = text.trim().replace(/<[^>]*>/g, "");
    if (sanitizedText.length > 1000) {
      return NextResponse.json(
        { error: "Text length cannot exceed 1000 characters" },
        { status: 400 }
      );
    }

    // 验证语速参数
    const speedValue = parseFloat(speed.toString());
    if (isNaN(speedValue) || speedValue < 0.5 || speedValue > 2.0) {
      return NextResponse.json(
        { error: "Speech speed must be between 0.5 and 2.0" },
        { status: 400 }
      );
    }

    // 验证语言参数
    const validLanguages = ["zh", "en", "ja", "ko"];
    if (!validLanguages.includes(language)) {
      return NextResponse.json(
        { error: "Unsupported language type" },
        { status: 400 }
      );
    }

    // 映射语言到Pollinations支持的音色
    let selectedVoice = "alloy"; // 默认音色
    if (voice && pollinationsVoices.includes(voice)) {
      selectedVoice = voice;
    }

    // 使用Pollinations TTS API
    const apiUrl = new URL(
      `https://text.pollinations.ai/${encodeURIComponent(sanitizedText)}`
    );
    apiUrl.searchParams.set("model", "openai-audio");
    apiUrl.searchParams.set("voice", selectedVoice);

    // 添加认证信息（如果环境变量中提供了）
    const referrer = process.env.POLLINATIONS_REFERRER;
    const token = process.env.POLLINATIONS_API_TOKEN;
    
    if (token) {
      apiUrl.searchParams.set("token", token);
    } else if (referrer) {
      apiUrl.searchParams.set("referrer", referrer);
    }

    // 获取音频数据
    const response = await fetch(apiUrl.toString(), {
      method: "GET",
      headers: {
        Accept: "audio/mpeg",
      },
    });

    // 处理不同类型的错误
    if (!response.ok) {
      let errorMessage = `TTS service response error: ${response.status}`;
      
      // 特别处理402错误
      if (response.status === 402) {
        errorMessage = "Payment required - Please check your API usage limits or authentication";
      } else if (response.status === 429) {
        errorMessage = "Rate limit exceeded - Please try again later";
      }
      
      throw new Error(errorMessage);
    }

    // 获取音频数据并转换为Base64
    const audioBuffer = await response.arrayBuffer();
    const base64Audio = Buffer.from(audioBuffer).toString("base64");

    // 获取音频时长（模拟，实际需要解析音频文件）
    const estimatedDuration = Math.ceil(sanitizedText.length / 8); // 大致估算：每8个字符约1秒

    return NextResponse.json({
      success: true,
      audioData: `data:audio/mpeg;base64,${base64Audio}`,
      text: sanitizedText,
      voice: selectedVoice,
      language,
      speed: speedValue,
      estimatedDuration,
    });
  } catch (error) {
    console.error("Text-to-speech API error:", error);
    
    // 提供更具体的错误信息
    let errorResponse = {
      error: "Speech synthesis failed",
      details: error instanceof Error ? error.message : "Unknown error",
    };
    
    // 根据错误类型设置适当的HTTP状态码
    let statusCode = 500;
    if (error instanceof Error && error.message.includes("Payment required")) {
      statusCode = 402;
    } else if (error instanceof Error && error.message.includes("Rate limit")) {
      statusCode = 429;
    } else if (error instanceof Error && error.message.includes("API usage limits")) {
      statusCode = 402;
    }
    
    return NextResponse.json(errorResponse, { status: statusCode });
  }
}
