import { NextRequest } from "next/server";

export interface LogEntry {
  timestamp: string;
  ip: string;
  method: string;
  url: string;
  userAgent?: string;
  params?: any;
  responseStatus?: number;
  responseTime?: number;
  error?: string;
}

class Logger {
  private logs: LogEntry[] = [];
  private maxLogs = 1000; // 最多保留1000条日志

  logRequest(request: NextRequest, params?: any): string {
    const ip = this.getClientIP(request);
    const logId = this.generateLogId();

    const logEntry: LogEntry = {
      timestamp: new Date().toISOString(),
      ip,
      method: request.method,
      url: request.url,
      userAgent: request.headers.get("user-agent") || undefined,
      params,
    };

    this.logs.unshift(logEntry);

    // 清理旧日志
    if (this.logs.length > this.maxLogs) {
      this.logs = this.logs.slice(0, this.maxLogs);
    }

    console.log(
      `[${logEntry.timestamp}] ${request.method} ${request.url} - IP: ${ip}`
    );

    return logId;
  }

  logResponse(
    logId: string,
    status: number,
    responseTime: number,
    error?: string
  ) {
    const logIndex = this.logs.findIndex((log) =>
      log.timestamp.includes(logId)
    );
    if (logIndex !== -1) {
      this.logs[logIndex].responseStatus = status;
      this.logs[logIndex].responseTime = responseTime;
      if (error) {
        this.logs[logIndex].error = error;
      }
    }
  }

  getLogs(limit: number = 100): LogEntry[] {
    return this.logs.slice(0, limit);
  }

  getLogsByIP(ip: string): LogEntry[] {
    return this.logs.filter((log) => log.ip === ip);
  }

  clearLogs() {
    this.logs = [];
  }

  private getClientIP(request: NextRequest): string {
    const forwarded = request.headers.get("x-forwarded-for");
    const realIp = request.headers.get("x-real-ip");

    if (forwarded) {
      return forwarded.split(",")[0].trim();
    }

    if (realIp) {
      return realIp;
    }

    // 对于本地开发，返回一个模拟IP
    return "127.0.0.1";
  }

  private generateLogId(): string {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  }

  // 获取统计信息
  getStats(): {
    totalRequests: number;
    errorRate: number;
    averageResponseTime: number;
    requestsPerIP: Record<string, number>;
  } {
    const totalRequests = this.logs.length;
    const errorRequests = this.logs.filter(
      (log) => log.responseStatus && log.responseStatus >= 400
    ).length;
    const requestsWithTime = this.logs.filter((log) => log.responseTime);
    const averageResponseTime =
      requestsWithTime.length > 0
        ? requestsWithTime.reduce(
            (sum, log) => sum + (log.responseTime || 0),
            0
          ) / requestsWithTime.length
        : 0;

    const requestsPerIP: Record<string, number> = {};
    this.logs.forEach((log) => {
      requestsPerIP[log.ip] = (requestsPerIP[log.ip] || 0) + 1;
    });

    return {
      totalRequests,
      errorRate: totalRequests > 0 ? (errorRequests / totalRequests) * 100 : 0,
      averageResponseTime,
      requestsPerIP,
    };
  }

  /**
   * Log general errors
   */
  logError(message: string, error?: any) {
    const logData = {
      timestamp: new Date().toISOString(),
      level: "error",
      message,
      error: error instanceof Error ? error.message : error,
      stack: error instanceof Error ? error.stack : undefined,
    };

    console.error("[Error]", JSON.stringify(logData));
  }

  /**
   * Log Turnstile verification events
   */
  logTurnstileEvent(
    event:
      | "verification_success"
      | "verification_failed"
      | "widget_loaded"
      | "widget_error"
      | "token_expired",
    data: {
      ip?: string;
      hostname?: string;
      action?: string;
      errorCodes?: string[];
      userAgent?: string;
      url?: string;
    }
  ) {
    const logData = {
      timestamp: new Date().toISOString(),
      event: `turnstile_${event}`,
      level:
        event.includes("error") || event.includes("failed") ? "error" : "info",
      ...data,
    };

    console.log("[Turnstile]", JSON.stringify(logData));

    // In production, send to monitoring service
    if (process.env.NODE_ENV === "production") {
      // Send to Sentry, DataDog, or other monitoring services
      // Example: sentry.captureMessage(JSON.stringify(logData));
    }
  }

  /**
   * Log security events
   */
  logSecurityEvent(
    type:
      | "suspicious_activity"
      | "rate_limit_exceeded"
      | "validation_bypass_attempt"
      | "multiple_verification_failures",
    details: Record<string, any>
  ) {
    const logData = {
      timestamp: new Date().toISOString(),
      type: "security_event",
      severity: "high",
      event_type: type,
      ...details,
    };

    console.warn("[Security]", JSON.stringify(logData));

    // Immediately report security events in production
    if (process.env.NODE_ENV === "production") {
      // Send to security monitoring system
      // Example: securityMonitor.alert(logData);
    }
  }
}

export const logger = new Logger();
