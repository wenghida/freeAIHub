import { NextRequest, NextResponse } from 'next/server';
import { rateLimit } from '@/lib/middleware/rate-limiter';
import { validateTurnstile } from '@/lib/middleware/turnstile-middleware';

interface TextProcessingRequest {
  text: string;
  maxLength?: number;
  model?: string;
}

const systemPrompt = 'Please process the following text:';

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
      text,
      maxLength = 1000,
      model = 'openai',
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
      return NextResponse.json({ error: 'Text cannot be empty' }, { status: 400 });
    }

    if (text.length > 5000) {
      return NextResponse.json({ error: 'Text length cannot exceed 5000 characters' }, { status: 400 });
    }

    // 构建完整提示词
    const fullPrompt = `${systemPrompt}\n\n${text}`;

    // 构建Pollinations API URL
    const apiUrl = new URL('https://text.pollinations.ai/' + encodeURIComponent(fullPrompt));
    apiUrl.searchParams.set('model', model);
    apiUrl.searchParams.set('max_tokens', Math.min(maxLength, 1000).toString());

    // 发起请求
    const response = await fetch(apiUrl.toString(), {
      method: 'GET',
      headers: {
        'Accept': 'text/plain',
      },
    });

    if (!response.ok) {
      throw new Error(`Pollinations API error: ${response.status}`);
    }

    const processedText = await response.text();

    return NextResponse.json({
      success: true,
      originalText: text,
      processedText: processedText.trim(),
      model
    });

  } catch (error) {
    console.error('Text processing API error:', error);
    return NextResponse.json(
      { 
        error: 'Text processing failed', 
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}