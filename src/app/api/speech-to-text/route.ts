import { NextRequest, NextResponse } from 'next/server'
import { rateLimit } from '@/lib/middleware/rate-limiter'
import { validateTurnstile } from '@/lib/middleware/turnstile-middleware'

interface SpeechToTextRequest {
  audioData: string // base64 encoded audio data
  format?: 'mp3' | 'wav' | 'm4a' | 'webm'
  language?: 'zh-CN' | 'en-US' | 'ja-JP' | 'ko-KR' | 'auto'
}

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
      return NextResponse.json({ error: 'Invalid request body format' }, { status: 400 });
    }
    
    // 从请求体中提取参数，排除Turnstile令牌字段
    const {
      audioData,
      format = 'mp3',
      language = 'auto',
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
    if (!audioData) {
      return NextResponse.json(
        { error: 'Audio data cannot be empty' },
        { status: 400 }
      )
    }

    // 验证音频格式
    const validFormats = ['mp3', 'wav', 'm4a', 'webm']
    if (!validFormats.includes(format)) {
      return NextResponse.json(
        { error: 'Audio format must be mp3, wav, m4a, or webm' },
        { status: 400 }
      )
    }

    // 验证音频数据格式
    if (!audioData.startsWith('data:audio/')) {
      return NextResponse.json(
        { error: 'Incorrect audio data format, please use base64 encoded audio data' },
        { status: 400 }
      )
    }

    // 验证MIME类型
    const mimeType = audioData.substring(5, audioData.indexOf(';'));
    const allowedMimeTypes = ['audio/mp3', 'audio/mpeg', 'audio/wav', 'audio/x-wav', 'audio/m4a', 'audio/webm'];
    if (!allowedMimeTypes.includes(mimeType)) {
      return NextResponse.json(
        { error: 'Unsupported audio format, please use MP3, WAV, M4A, or WebM format' },
        { status: 400 }
      )
    }

    // 检查音频大小（base64解码后的大小限制）
    const base64Parts = audioData.split(',');
    if (base64Parts.length !== 2) {
      return NextResponse.json(
        { error: 'Incorrect audio data format' },
        { status: 400 }
      )
    }
    
    const base64Data = base64Parts[1];
    // 限制base64数据长度以防止过大的数据传输
    if (base64Data.length > 50 * 1024 * 1024 * 1.33) { // Approximately 50MB of base64 encoded data
      return NextResponse.json(
        { error: 'Audio file size cannot exceed 50MB' },
        { status: 400 }
      )
    }
    
    const audioBuffer = Buffer.from(base64Data, 'base64')
    const audioSizeMB = audioBuffer.length / (1024 * 1024)
    
    if (audioSizeMB > 50) {
      return NextResponse.json(
        { error: 'Audio file size cannot exceed 50MB' },
        { status: 400 }
      )
    }

    // 验证音频时长（限制为5分钟）
    // 基于不同格式的平均比特率估算时长
    let estimatedDuration = 0;
    switch (format) {
      case 'mp3':
        // MP3平均比特率128kbps
        estimatedDuration = Math.round((audioBuffer.length * 8) / (128 * 1000));
        break;
      case 'wav':
        // WAV假设16-bit, 44.1kHz, mono
        estimatedDuration = Math.round(audioBuffer.length / (2 * 44100));
        break;
      case 'm4a':
        // M4A平均比特率96kbps
        estimatedDuration = Math.round((audioBuffer.length * 8) / (96 * 1000));
        break;
      case 'webm':
        // WebM平均比特率64kbps
        estimatedDuration = Math.round((audioBuffer.length * 8) / (64 * 1000));
        break;
      default:
        // 默认按MP3计算
        estimatedDuration = Math.round((audioBuffer.length * 8) / (128 * 1000));
    }

    if (estimatedDuration > 300) { // 5分钟 = 300秒
      return NextResponse.json(
        { error: 'Audio duration cannot exceed 5 minutes' },
        { status: 400 }
      )
    }

    // 验证语言参数
    const validLanguages = ['zh-CN', 'en-US', 'ja-JP', 'ko-KR', 'auto'];
    if (!validLanguages.includes(language)) {
      return NextResponse.json(
        { error: 'Unsupported language type' },
        { status: 400 }
      )
    }

    // 使用Pollinations Whisper API进行语音识别
    // Pollinations Whisper API: https://text.pollinations.ai/openai
    
    // 直接调用API，不使用模拟数据
    console.log('Attempting to call Whisper API with audio data');
    console.log('MIME type:', mimeType);
    console.log('Audio data length:', audioData.length);
    
    // 构建API URL
    const apiUrl = 'https://text.pollinations.ai/openai';
    
    // 准备请求载荷，使用示例中的格式
    const payload = {
      model: "openai-audio",
      messages: [
        {
          role: "user",
          content: [
            { type: "text", text: "Transcribe this audio" },
            {
              type: "input_audio",
              input_audio: {
                data: base64Data,  // 只发送base64数据部分，不包括data:前缀
                format: format
              }
            }
          ]
        }
      ]
    };
    
    // 获取API token
    const apiToken = process.env.POLLINATIONS_API_TOKEN;
    
    // 发送请求到Pollinations Whisper API
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(apiToken && { 'Authorization': `Bearer ${apiToken}` }), // 如果有API token则添加认证头部
      },
      body: JSON.stringify(payload)
    });
    
    console.log('Whisper API response status:', response.status);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('Whisper API error response:', errorText);
      throw new Error(`Whisper API request failed with status ${response.status}: ${errorText}`);
    }
    
    // 获取识别结果
    const result = await response.json();
    const recognizedText = result.choices?.[0]?.message?.content;
    console.log('Whisper API recognized text length:', recognizedText?.length);
    
    // 检查返回的文本是否有效
    if (!recognizedText || recognizedText.length === 0) {
      throw new Error('Whisper API returned empty response');
    }
    
    // 返回真实的识别结果
    return NextResponse.json({ 
      success: true,
      text: recognizedText,
      confidence: 0.95, // Whisper API不返回置信度，我们使用一个合理的默认值
      language: language === 'auto' ? 'en-US' : language,
      format,
      duration: estimatedDuration
    });
  } catch (error) {
    console.error('Speech-to-text API error:', error)
    return NextResponse.json(
      { 
        error: 'Speech recognition failed',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}