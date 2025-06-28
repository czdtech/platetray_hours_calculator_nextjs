import { NextResponse } from "next/server";

import { apiLogger } from '@/utils/unified-logger';

// 在 Vercel 平台或本地 .env.local 文件中配置此环境变量
const GOOGLE_MAPS_API_KEY = process.env.GOOGLE_MAPS_API_KEY;

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
  data: {
    suggestions: Array<{
      placeId: string;
      description: string;
      mainText: string;
      secondaryText: string;
    }>;
  };
  timestamp: number;
}

const cache = new Map<string, CacheItem>();

export async function GET(request: Request) {
  const start = performance.now();
  const { searchParams } = new URL(request.url);
  const input = searchParams.get("input");
  const sessionToken = searchParams.get("sessiontoken");

  apiLogger.request('/api/maps/autocomplete', 'GET', { input: input?.substring(0, 20) });

  if (!GOOGLE_MAPS_API_KEY) {
    apiLogger.error('/api/maps/autocomplete', new Error("Google Maps API Key missing"), performance.now() - start);
    return NextResponse.json(
      { error: "Server configuration error: API key missing" },
      { status: 500 },
    );
  }

  if (!input || typeof input !== "string" || input.trim().length < 2) {
    return NextResponse.json(
      { error: "Input must be at least 2 characters long" },
      { status: 400 },
    );
  }

  // 检查缓存
  const cacheKey = `${input.toLowerCase()}_${sessionToken || 'default'}`;
  const cachedResult = cache.get(cacheKey);
  if (cachedResult && Date.now() - cachedResult.timestamp < CACHE_DURATION) {
    apiLogger.success('/api/maps/autocomplete', performance.now() - start, { source: 'cache' });
    return NextResponse.json(cachedResult.data, { status: 200 });
  }

  // 构建API URL
  const params = new URLSearchParams({
    input: input.trim(),
    types: "geocode", // 只返回地理位置
    key: GOOGLE_MAPS_API_KEY,
  });

  if (sessionToken) {
    params.append("sessiontoken", sessionToken);
  }

  const apiUrl = `https://maps.googleapis.com/maps/api/place/autocomplete/json?${params.toString()}`;

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 8000); // 8秒超时

    const googleResponse = await fetch(apiUrl, { signal: controller.signal });
    clearTimeout(timeoutId);

    const data = (await googleResponse.json()) as AutocompleteResponse;

    if (!googleResponse.ok || data.status !== "OK") {
      apiLogger.error('/api/maps/autocomplete', new Error(`Google API error: ${data.status}`), performance.now() - start);
      return NextResponse.json(
        {
          error: `Failed to fetch autocomplete suggestions: ${data.status || "Unknown error"}`,
        },
        { status: googleResponse.status || 500 },
      );
    }

    // 处理响应数据
    const suggestions = data.predictions.map((prediction) => ({
      placeId: prediction.place_id,
      description: prediction.description,
      mainText: prediction.structured_formatting.main_text,
      secondaryText: prediction.structured_formatting.secondary_text,
    }));

    const result = { suggestions };

    // 缓存结果
    cache.set(cacheKey, {
      data: result,
      timestamp: Date.now()
    });

    // 清理过期缓存
      const now = Date.now();
      for (const [key, value] of cache.entries()) {
        if (now - value.timestamp > CACHE_DURATION) {
          cache.delete(key);
        }
      }

    apiLogger.success('/api/maps/autocomplete', performance.now() - start, { count: suggestions.length });
    return NextResponse.json(result, { status: 200 });
  } catch (error: unknown) {
    const err = error instanceof Error ? error : new Error("Unknown error");
    apiLogger.error('/api/maps/autocomplete', err, performance.now() - start);
    return NextResponse.json(
      { error: "Internal server error", details: err.message },
      { status: 500 },
    );
  }
}
