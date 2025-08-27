const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "";

// API响应类型
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  details?: string;
}

// 文本转图像类型
export interface TextToImageResponse {
  success: true;
  imageData: string;
  prompt: string;
  width: number;
  height: number;
  model: string;
}

// 图像转图像类型
export interface ImageToImageResponse {
  success: true;
  imageData: string;
  prompt: string;
  model: string;
}

// 文本转文本类型
export interface TextToTextRequest {
  text: string;
  maxLength?: number;
  model?: string;
}

export interface TextToTextResponse {
  success: true;
  originalText: string;
  processedText: string;
  model?: string;
}

// 文本转语音类型
export interface TextToSpeechRequest {
  text: string;
  voice?: string;
  language?: "zh" | "en" | "ja" | "ko";
  speed?: number;
}

export interface TextToSpeechResponse {
  success: true;
  audioData: string;
  text: string;
  voice: string;
  language: string;
  speed: number;
  estimatedDuration: number;
}

// 语音转文本类型
export interface SpeechToTextRequest {
  audioData: string;
  format?: "mp3" | "wav" | "m4a" | "webm";
  language?: "zh-CN" | "en-US" | "ja-JP" | "ko-KR" | "auto";
}

export interface SpeechToTextResponse {
  success: true;
  text: string;
  confidence: number;
  language: string;
  format: string;
  duration: number;
}

// 错误处理
class ApiError extends Error {
  constructor(
    public status: number,
    message: string,
    public details?: string
  ) {
    super(message);
    this.name = "ApiError";
  }
}

// API客户端
export class ApiClient {
  // Turnstile token management
  private turnstileToken: string | null = null;

  setTurnstileToken(token: string) {
    this.turnstileToken = token;
  }

  clearTurnstileToken() {
    this.turnstileToken = null;
  }

  getTurnstileToken(): string | null {
    return this.turnstileToken;
  }

  public async fetchWithError(url: string, options?: RequestInit) {
    try {
      // 设置请求超时
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 30000); // 30秒超时

      // Add Turnstile token to request body if available and this is a POST request
      let body = options?.body;
      if (this.turnstileToken && options?.method === "POST" && body) {
        try {
          const parsedBody = JSON.parse(body as string);
          parsedBody.turnstileToken = this.turnstileToken;
          body = JSON.stringify(parsedBody);
        } catch {
          // If body parsing fails, just use original body
        }
      }

      const response = await fetch(url, {
        ...options,
        body,
        signal: controller.signal,
        headers: {
          "Content-Type": "application/json",
          ...options?.headers,
        },
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        let errorData;
        try {
          errorData = await response.json();
        } catch {
          errorData = {
            error: "Request failed",
            details: `HTTP ${response.status}`,
          };
        }

        // Clear Turnstile token if verification failed
        if (
          errorData.code === "TURNSTILE_FAILED" ||
          errorData.code === "TURNSTILE_MISSING"
        ) {
          this.clearTurnstileToken();
        }

        throw new ApiError(
          response.status,
          errorData.error || "Request failed",
          errorData.details
        );
      }

      return response.json();
    } catch (error) {
      if (error instanceof ApiError) {
        throw error;
      }
      if (error instanceof Error) {
        if (error.name === "AbortError") {
          throw new ApiError(
            0,
            "Request timeout",
            "Request did not complete within 30 seconds"
          );
        }
        throw new ApiError(0, "Network error", error.message);
      }
      throw new ApiError(0, "Unknown error", "An unknown error occurred");
    }
  }

  // 文本转图像
  async generateImage(
    prompt: string,
    width = 512,
    height = 512,
    model = "flux"
  ) {
    // 输入验证和清理
    const trimmedPrompt = prompt.trim();
    if (!trimmedPrompt) {
      throw new ApiError(400, "Prompt text cannot be empty");
    }

    // 防止XSS攻击，清理特殊字符
    const sanitizedPrompt = trimmedPrompt.replace(/[<>]/g, "");
    if (sanitizedPrompt.length > 500) {
      throw new ApiError(400, "Prompt text cannot exceed 500 characters");
    }

    const requestBody = {
      prompt: sanitizedPrompt,
      width: width.toString(),
      height: height.toString(),
      model,
    };

    return this.fetchWithError(`${API_BASE_URL}/api/text-to-image`, {
      method: "POST",
      body: JSON.stringify(requestBody),
    });
  }

  // 图像转图像
  async generateImageFromImage(
    prompt: string,
    imageUrl: string,
    model = "flux",
    strength = 0.5
  ) {
    // 输入验证和清理
    const trimmedPrompt = prompt.trim();
    if (!trimmedPrompt) {
      throw new ApiError(400, "Prompt text cannot be empty");
    }

    // 防止XSS攻击，清理特殊字符
    const sanitizedPrompt = trimmedPrompt.replace(/[<>]/g, "");
    if (sanitizedPrompt.length > 500) {
      throw new ApiError(400, "Prompt text cannot exceed 500 characters");
    }

    // 验证图片URL
    if (!imageUrl) {
      throw new ApiError(400, "Image URL cannot be empty");
    }

    try {
      new URL(imageUrl);
    } catch {
      throw new ApiError(400, "Invalid image URL");
    }

    // 验证strength参数
    const strengthValue = parseFloat(strength.toString());
    if (isNaN(strengthValue) || strengthValue < 0 || strengthValue > 1) {
      throw new ApiError(400, "Strength must be between 0 and 1");
    }

    const requestBody = {
      prompt: sanitizedPrompt,
      imageUrl,
      model,
      strength: strengthValue.toString(),
    };

    return this.fetchWithError(`${API_BASE_URL}/api/image-to-image`, {
      method: "POST",
      body: JSON.stringify(requestBody),
    });
  }

  // 文本转文本
  async processText(request: TextToTextRequest) {
    // 输入验证和清理
    const trimmedText = request.text.trim();
    if (!trimmedText) {
      throw new ApiError(400, "Text content cannot be empty");
    }

    // 防止XSS攻击，清理特殊字符
    const sanitizedText = trimmedText.replace(/[<>]/g, "");
    if (sanitizedText.length > 5000) {
      throw new ApiError(400, "Text content cannot exceed 5000 characters");
    }

    // 验证最大长度
    if (
      request.maxLength &&
      (request.maxLength < 100 || request.maxLength > 5000)
    ) {
      throw new ApiError(400, "Maximum length must be between 100-5000");
    }

    const sanitizedRequest = {
      ...request,
      text: sanitizedText,
    };

    return this.fetchWithError(`${API_BASE_URL}/api/text-to-text`, {
      method: "POST",
      body: JSON.stringify(sanitizedRequest),
    });
  }

  // 文本转语音
  async generateSpeech(request: TextToSpeechRequest) {
    // 输入验证和清理
    const trimmedText = request.text.trim();
    if (!trimmedText) {
      throw new ApiError(400, "Text content cannot be empty");
    }

    // 防止XSS攻击，清理特殊字符
    const sanitizedText = trimmedText.replace(/[<>]/g, "");
    if (sanitizedText.length > 1000) {
      throw new ApiError(400, "Text content cannot exceed 1000 characters");
    }

    // 验证语言参数
    if (request.language) {
      const validLanguages = ["zh", "en", "ja", "ko"];
      if (!validLanguages.includes(request.language)) {
        throw new ApiError(400, "Unsupported language type");
      }
    }

    // 验证语速参数
    if (request.speed !== undefined) {
      const speedValue = parseFloat(request.speed.toString());
      if (isNaN(speedValue) || speedValue < 0.5 || speedValue > 2.0) {
        throw new ApiError(400, "Speech speed must be between 0.5 and 2.0");
      }
    }

    const sanitizedRequest = {
      ...request,
      text: sanitizedText,
    };

    return this.fetchWithError(`${API_BASE_URL}/api/text-to-speech`, {
      method: "POST",
      body: JSON.stringify(sanitizedRequest),
    });
  }

  // 语音转文本
  async recognizeSpeech(request: SpeechToTextRequest) {
    // 验证音频数据
    if (!request.audioData) {
      throw new ApiError(400, "Audio data cannot be empty");
    }

    // 验证音频数据格式
    if (!request.audioData.startsWith("data:audio/")) {
      throw new ApiError(
        400,
        "Incorrect audio data format, please use base64 encoded audio data"
      );
    }

    // 验证音频格式
    if (request.format) {
      const validFormats = ["mp3", "wav", "m4a", "webm"];
      if (!validFormats.includes(request.format)) {
        throw new ApiError(400, "Audio format must be mp3, wav, m4a, or webm");
      }
    }

    // 验证语言参数
    if (request.language) {
      const validLanguages = ["zh-CN", "en-US", "ja-JP", "ko-KR", "auto"];
      if (!validLanguages.includes(request.language)) {
        throw new ApiError(400, "Unsupported language type");
      }
    }

    // 验证MIME类型
    const mimeType = request.audioData.substring(
      5,
      request.audioData.indexOf(";")
    );
    const allowedMimeTypes = [
      "audio/mp3",
      "audio/mpeg",
      "audio/wav",
      "audio/x-wav",
      "audio/m4a",
      "audio/webm",
    ];
    if (!allowedMimeTypes.includes(mimeType)) {
      throw new ApiError(
        400,
        "Unsupported audio format, please use MP3, WAV, M4A, or WebM format"
      );
    }

    // 验证base64数据长度（防止过大的数据传输）
    const base64Parts = request.audioData.split(",");
    if (base64Parts.length !== 2) {
      throw new ApiError(400, "Incorrect audio data format");
    }

    const base64Data = base64Parts[1];
    if (base64Data.length > 50 * 1024 * 1024 * 1.33) {
      // 约50MB的base64编码数据
      throw new ApiError(400, "Audio file size cannot exceed 50MB");
    }

    return this.fetchWithError(`${API_BASE_URL}/api/speech-to-text`, {
      method: "POST",
      body: JSON.stringify(request),
    });
  }
}

// 创建单例实例
export const apiClient = new ApiClient();

// 工具函数
export const validateImagePrompt = (prompt: string) => {
  if (!prompt?.trim()) {
    return "Please enter a description";
  }
  if (prompt.length > 500) {
    return "Description cannot exceed 500 characters";
  }
  return null;
};

export const validateTextInput = (text: string, maxLength = 5000) => {
  if (!text?.trim()) {
    return "Please enter text content";
  }
  if (text.length > maxLength) {
    return `Text content cannot exceed ${maxLength} characters`;
  }
  return null;
};

export const validateAudioFormat = (file: File) => {
  const validTypes = [
    "audio/wav",
    "audio/mp3",
    "audio/mpeg",
    "audio/m4a",
    "audio/webm",
  ];
  if (!validTypes.includes(file.type)) {
    return "Please upload an audio file in MP3, WAV, M4A, or WebM format";
  }
  if (file.size > 50 * 1024 * 1024) {
    return "Audio file size cannot exceed 50MB";
  }
  return null;
};

// 文件转Base64
export const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = (error) => reject(error);
  });
};

// 复制到剪贴板
export const copyToClipboard = async (text: string) => {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch (err) {
    console.error("Copy failed:", err);
    return false;
  }
};

// 下载文件
export const downloadFile = (url: string, filename: string) => {
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

// 下载Base64格式的图片
export const downloadBase64Image = (base64Data: string, filename: string) => {
  try {
    // 创建一个临时的a标签
    const link = document.createElement("a");
    link.href = base64Data;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  } catch (error) {
    console.error("Download image failed:", error);
  }
};
