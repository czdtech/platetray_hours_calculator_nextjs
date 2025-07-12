import { NextResponse } from 'next/server';
import {
  checkApiKey,
  fetchWithTimeout,
  handleGoogleApiResponse,
  handleApiError,
  buildGoogleApiUrl,
  logApiStart,
  logApiSuccess
} from '@/utils/maps-api-helpers';

// Autocomplete API 响应接口
interface AutocompleteResponse {
  predictions: Array<{
    place_id: string;
    description: string;
    structured_formatting: {
      main_text: string;
      secondary_text: string;
    };
  }>;
  status: string;
}

// 缓存配置
const CACHE_DURATION = 10 * 60 * 1000; // 10分钟缓存

interface CacheItem {
  data: { predictions: AutocompleteResponse['predictions'] };
  timestamp: number;
}

const cache = new Map<string, CacheItem>();

export async function GET(request: Request) {
  const start = logApiStart('/api/maps/autocomplete', 'GET');
  const { searchParams } = new URL(request.url);
  const input = searchParams.get('input');
  const sessionToken = searchParams.get('sessiontoken');

  // 检查API密钥
  const keyCheckResult = checkApiKey('/api/maps/autocomplete', start);
  if (keyCheckResult) return keyCheckResult;

  // 验证输入参数
  if (!input || typeof input !== 'string' || input.trim().length < 2) {
    return NextResponse.json(
      { error: 'Input must be at least 2 characters long' },
      { status: 400 }
    );
  }

  // 检查缓存
  const cacheKey = `${input.toLowerCase()}_${sessionToken || 'default'}`;
  const cachedResult = cache.get(cacheKey);
  if (cachedResult && Date.now() - cachedResult.timestamp < CACHE_DURATION) {
    logApiSuccess('/api/maps/autocomplete', start, { source: 'cache' });
    return NextResponse.json(cachedResult.data, { status: 200 });
  }

  try {
    // 构建API参数
    const params = new URLSearchParams({
      input: input.trim(),
      types: 'geocode', // 只返回地理位置
    });

    if (sessionToken) {
      params.append('sessiontoken', sessionToken);
    }

    const apiUrl = buildGoogleApiUrl('place/autocomplete/json', params);
    const googleResponse = await fetchWithTimeout(apiUrl, 8000);
    const data = (await googleResponse.json()) as AutocompleteResponse;

    if (!googleResponse.ok || data.status !== 'OK') {
      return handleGoogleApiResponse(googleResponse, '/api/maps/autocomplete', start);
    }

    // 处理响应数据
    const predictions = data.predictions.map(prediction => ({
      place_id: prediction.place_id,
      description: prediction.description,
      structured_formatting: {
        main_text: prediction.structured_formatting.main_text,
        secondary_text: prediction.structured_formatting.secondary_text,
      },
    }));

    const result = { predictions };

    // 缓存结果
    cache.set(cacheKey, {
      data: result,
      timestamp: Date.now(),
    });

    // 清理过期缓存
    const now = Date.now();
    for (const [key, value] of cache.entries()) {
      if (now - value.timestamp > CACHE_DURATION) {
        cache.delete(key);
      }
    }

    logApiSuccess('/api/maps/autocomplete', start, { count: predictions.length });
    return NextResponse.json(result, { status: 200 });
  } catch (error: unknown) {
    return handleApiError(error, '/api/maps/autocomplete', start);
  }
}
