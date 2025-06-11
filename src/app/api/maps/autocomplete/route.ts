import { NextResponse } from "next/server";

import { createLogger } from '@/utils/logger';
const GOOGLE_MAPS_API_KEY = process.env.GOOGLE_MAPS_API_KEY;

// 添加简单的内存缓存
interface AutocompleteCacheData {
  predictions: AutocompleteApiResponse["predictions"];
}

const cache = new Map<string, { data: AutocompleteCacheData; timestamp: number }>();
const CACHE_DURATION = 5 * 60 * 1000; // 5分钟缓存

// 移除未使用的接口定义

interface AutocompleteApiResponse {
  predictions: Array<{
    description: string;
    place_id: string;
    structured_formatting: {
      main_text: string;
      secondary_text: string;
    };
  }>;
  status: string;
  error_message?: string;
}

export async function GET(request: Request) {
  const logger = createLogger('Route');

  const { searchParams } = new URL(request.url);
  const input = searchParams.get("input");
  const sessiontoken = searchParams.get("sessiontoken");

  if (!GOOGLE_MAPS_API_KEY) {
    logger.error("Google Maps API Key is not configured for autocomplete.");
    return NextResponse.json(
      { error: "Server configuration error: API key missing" },
      { status: 500 },
    );
  }

  if (!input || typeof input !== "string") {
    return NextResponse.json(
      { error: "Input parameter is required and must be a string" },
      { status: 400 },
    );
  }

  // 检查缓存
  const cacheKey = `autocomplete_${input}_${sessiontoken || 'no-session'}`;
  const cachedResult = cache.get(cacheKey);
  if (cachedResult && Date.now() - cachedResult.timestamp < CACHE_DURATION) {
    logger.info(`Cache hit for autocomplete: ${input}`);
    return NextResponse.json(cachedResult.data, { status: 200 });
  }

  let apiUrl = `https://maps.googleapis.com/maps/api/place/autocomplete/json?input=${encodeURIComponent(input)}&key=${GOOGLE_MAPS_API_KEY}&types=locality`;

  if (sessiontoken && typeof sessiontoken === "string") {
    apiUrl += `&sessiontoken=${encodeURIComponent(sessiontoken)}`;
  }
  // 可以根据需要添加其他参数，如 language, components 等

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 8000); // 减少到 8秒超时

    const googleResponse = await fetch(apiUrl, {
      signal: controller.signal,
      // 添加性能优化的请求头
      headers: {
        'Accept': 'application/json',
        'Accept-Encoding': 'gzip, deflate, br'
      }
    });
    clearTimeout(timeoutId);

    const data = (await googleResponse.json()) as AutocompleteApiResponse;

    if (!googleResponse.ok || data.status !== "OK") {
      logger.error(
        "Google Places Autocomplete API error. Status:",
        data.status,
        "Message:",
        data.error_message,
        "Full response:",
        data,
      );
      return NextResponse.json(
        {
          error: `Failed to fetch autocomplete suggestions: ${data.status || "Unknown error"}`,
          details: data.error_message || "No additional details provided.",
        },
        { status: googleResponse.status || 500 },
      );
    }

    const responseData = { predictions: data.predictions };

    // 存入缓存
    cache.set(cacheKey, {
      data: responseData,
      timestamp: Date.now()
    });

    // 清理过期缓存
    if (cache.size > 100) { // 限制缓存大小
      const now = Date.now();
      for (const [key, value] of cache.entries()) {
        if (now - value.timestamp > CACHE_DURATION) {
          cache.delete(key);
        }
      }
    }

    return NextResponse.json(responseData, {
      status: 200,
      headers: {
        'Cache-Control': 'public, max-age=300', // 5分钟浏览器缓存
      }
    });
  } catch (error: unknown) {
    const err = error instanceof Error ? error : new Error("Unknown error");
    logger.error("Error in autocomplete proxy:", err);
    return NextResponse.json(
      { error: "Internal server error", details: err.message },
      { status: 500 },
    );
  }
}
