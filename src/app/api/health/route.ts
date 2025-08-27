export const runtime = 'edge';

import { NextRequest, NextResponse } from 'next/server';
import { createErrorResponse, withErrorHandler } from '@/lib/middleware/error-handler';

interface HealthCheck {
  status: 'healthy' | 'degraded' | 'unhealthy';
  timestamp: string;
  uptime: number;
  services: {
    textToImage: ServiceHealth;
    textToText: ServiceHealth;
    textToSpeech: ServiceHealth;
    speechToText: ServiceHealth;
  };
  system: {
    memory: MemoryInfo;
    cpu: CpuInfo;
  };
}

interface ServiceHealth {
  status: 'healthy' | 'unhealthy';
  responseTime: number;
  error?: string;
}

interface MemoryInfo {
  used: number;
  total: number;
  free: number;
  usage: number;
}

interface CpuInfo {
  usage: number;
  loadAverage?: number[];
}

async function checkServiceHealth(serviceUrl: string): Promise<ServiceHealth> {
  const startTime = Date.now();
  
  try {
    const response = await fetch(serviceUrl, {
      method: 'HEAD',
      timeout: 5000,
    } as any);
    
    return {
      status: response.ok ? 'healthy' : 'unhealthy',
      responseTime: Date.now() - startTime,
    };
  } catch (error) {
    return {
      status: 'unhealthy',
      responseTime: Date.now() - startTime,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

function getSystemInfo() {
  // 模拟系统信息获取
  const memoryUsage = process.memoryUsage();
  const totalMemory = 1024 * 1024 * 1024; // 假设1GB
  const usedMemory = memoryUsage.heapUsed;
  const freeMemory = totalMemory - usedMemory;
  
  return {
    memory: {
      used: Math.round(usedMemory / 1024 / 1024), // MB
      total: Math.round(totalMemory / 1024 / 1024), // MB
      free: Math.round(freeMemory / 1024 / 1024), // MB
      usage: Math.round((usedMemory / totalMemory) * 100),
    },
    cpu: {
      usage: Math.round(Math.random() * 50 + 10), // 模拟CPU使用率
    },
  };
}

export const GET = withErrorHandler(async (request: NextRequest) => {
  const startTime = Date.now();
  
  // 检查各个外部服务的状态
  const [textToImage, textToText, textToSpeech, speechToText] = await Promise.allSettled([
    checkServiceHealth('https://image.pollinations.ai/'),
    checkServiceHealth('https://text.pollinations.ai/'),
    checkServiceHealth('https://text.pollinations.ai/tts'),
    checkServiceHealth('https://speech.pollinations.ai/'),
  ]);

  const services = {
    textToImage: textToImage.status === 'fulfilled' ? textToImage.value : { status: 'unhealthy' as const, responseTime: 0, error: 'Service unavailable' },
    textToText: textToText.status === 'fulfilled' ? textToText.value : { status: 'unhealthy' as const, responseTime: 0, error: 'Service unavailable' },
    textToSpeech: textToSpeech.status === 'fulfilled' ? textToSpeech.value : { status: 'unhealthy' as const, responseTime: 0, error: 'Service unavailable' },
    speechToText: speechToText.status === 'fulfilled' ? speechToText.value : { status: 'unhealthy' as const, responseTime: 0, error: 'Service unavailable' },
  };

  // 计算整体健康状态
  const unhealthyServices = Object.values(services).filter(s => s.status === 'unhealthy').length;
  let overallStatus: 'healthy' | 'degraded' | 'unhealthy';
  
  if (unhealthyServices === 0) {
    overallStatus = 'healthy';
  } else if (unhealthyServices <= 2) {
    overallStatus = 'degraded';
  } else {
    overallStatus = 'unhealthy';
  }

  const system = getSystemInfo();
  
  const health: HealthCheck = {
    status: overallStatus,
    timestamp: new Date().toISOString(),
    uptime: Math.floor(process.uptime()),
    services,
    system,
  };

  const responseTime = Date.now() - startTime;

  return NextResponse.json(health, {
    headers: {
      'Cache-Control': 'no-cache, no-store, must-revalidate',
      'Pragma': 'no-cache',
      'Expires': '0',
      'X-Response-Time': `${responseTime}ms`,
    },
  });
});

// 简化的健康检查端点（用于负载均衡器）
export async function HEAD(request: NextRequest) {
  try {
    // 快速检查核心服务
    const response = await fetch('https://image.pollinations.ai/', {
      method: 'HEAD',
      timeout: 2000,
    } as any);
    
    if (response.ok) {
      return new NextResponse(null, { status: 200 });
    } else {
      return new NextResponse(null, { status: 503 });
    }
  } catch {
    return new NextResponse(null, { status: 503 });
  }
}