import { NextResponse } from 'next/server';

import { createLogger } from '@/utils/logger';
/**
 * 健康检查端点
 * 用于负载均衡器和监控系统检查应用状态
 */
export async function GET() {
  const logger = createLogger('Route');

  try {
    // 检查应用基本状态
    const healthCheck = {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      environment: process.env.NODE_ENV,
      version: process.env.npm_package_version || '1.0.0',
      checks: {
        database: 'not_applicable', // 如果有数据库，在这里检查
        external_apis: await checkExternalAPIs(),
        memory: getMemoryUsage(),
      }
    };

    return NextResponse.json(healthCheck, { status: 200 });
  } catch (error) {
    logger.error('Health check failed:', error);
    
    return NextResponse.json(
      {
        status: 'unhealthy',
        timestamp: new Date().toISOString(),
        error: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 503 }
    );
  }
}

/**
 * 检查外部 API 状态
 */
async function checkExternalAPIs() {
  const checks = {
    google_maps: 'unknown'
  };

  try {
    // 简单检查 Google Maps API 是否可访问
    if (process.env.GOOGLE_MAPS_API_KEY) {
      checks.google_maps = 'configured';
    } else {
      checks.google_maps = 'not_configured';
    }
  } catch {
    checks.google_maps = 'error';
  }

  return checks;
}

/**
 * 获取内存使用情况
 */
function getMemoryUsage() {
  const usage = process.memoryUsage();
  return {
    rss: Math.round(usage.rss / 1024 / 1024), // MB
    heapTotal: Math.round(usage.heapTotal / 1024 / 1024), // MB
    heapUsed: Math.round(usage.heapUsed / 1024 / 1024), // MB
    external: Math.round(usage.external / 1024 / 1024), // MB
  };
}