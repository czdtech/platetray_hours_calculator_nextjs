import { NextResponse } from 'next/server';
import { apiLogger } from '@/utils/unified-logger';

/**
 * Google Maps API公共工具函数
 * 减少重复代码，统一错误处理和日志记录
 */

// Google Maps API密钥
const GOOGLE_MAPS_API_KEY = process.env.GOOGLE_MAPS_API_KEY;

/**
 * 标准API响应接口
 */
export interface ApiResponse<T = any> {
  error?: string;
  details?: string;
  data?: T;
}

/**
 * 检查API密钥是否配置
 */
export function checkApiKey(routePath: string, startTime: number): NextResponse | null {
  if (!GOOGLE_MAPS_API_KEY) {
    apiLogger.error(`${routePath} 失败 (${(performance.now() - startTime).toFixed(1)}ms): Google Maps API Key missing`);
    return NextResponse.json(
      { error: 'Server configuration error: API key missing' } as ApiResponse,
      { status: 500 }
    );
  }
  return null;
}

/**
 * 创建带超时的fetch请求
 */
export async function fetchWithTimeout(
  url: string, 
  timeoutMs: number = 10000
): Promise<Response> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);
  
  try {
    const response = await fetch(url, { signal: controller.signal });
    clearTimeout(timeoutId);
    return response;
  } catch (error) {
    clearTimeout(timeoutId);
    throw error;
  }
}

/**
 * 处理Google API响应
 */
export async function handleGoogleApiResponse<T>(
  response: Response,
  routePath: string,
  startTime: number
): Promise<NextResponse> {
  const data = await response.json();
  
  if (!response.ok || (data.status && data.status !== 'OK')) {
    const errorStatus = data.status || 'Unknown API error';
    const errorMessage = data.error_message || 'No additional details from API.';
    
    apiLogger.error(`${routePath} 失败: Google API error: ${errorStatus}`, new Error(errorMessage));
    
    return NextResponse.json(
      {
        error: `Failed to process request: ${errorStatus}`,
        details: errorMessage
      } as ApiResponse,
      { status: response.status || 500 }
    );
  }
  
  return NextResponse.json(data, { status: 200 });
}

/**
 * 通用错误处理
 */
export function handleApiError(
  error: unknown,
  routePath: string,
  startTime: number
): NextResponse {
  const err = error instanceof Error ? error : new Error('Unknown error');
  apiLogger.error(`${routePath} 失败 (${(performance.now() - startTime).toFixed(1)}ms)`, err);
  
  return NextResponse.json(
    {
      error: 'Internal server error',
      details: err.message
    } as ApiResponse,
    { status: 500 }
  );
}

/**
 * 构建Google Maps API URL
 */
export function buildGoogleApiUrl(
  endpoint: string,
  params: URLSearchParams
): string {
  if (!GOOGLE_MAPS_API_KEY) {
    throw new Error('Google Maps API Key is not configured');
  }
  
  params.append('key', GOOGLE_MAPS_API_KEY);
  return `https://maps.googleapis.com/maps/api/${endpoint}?${params.toString()}`;
}

/**
 * 记录API请求开始
 */
export function logApiStart(
  routePath: string,
  method: string,
  params?: Record<string, any>
): number {
  const start = performance.now();
  apiLogger.debug(`${method} ${routePath}`, params || '');
  return start;
}

/**
 * 记录API请求成功
 */
export function logApiSuccess(
  routePath: string,
  startTime: number,
  additionalData?: Record<string, any>
): void {
  apiLogger.info(`${routePath} 成功 (${(performance.now() - startTime).toFixed(1)}ms)`, additionalData || '');
}