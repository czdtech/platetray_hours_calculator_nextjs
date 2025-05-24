import { NextResponse } from "next/server";

import { createLogger } from '@/utils/logger';
const GOOGLE_MAPS_API_KEY = process.env.GOOGLE_MAPS_API_KEY;

// 根据 Google Places API Details 响应定义接口
// 您可以根据需要从 API 文档中添加更多字段
interface PlaceDetailsResult {
  address_components?: {
    long_name: string;
    short_name: string;
    types: string[];
  }[];
  formatted_address?: string;
  geometry?: {
    location: {
      lat: number;
      lng: number;
    };
  };
  name?: string;
  place_id: string;
  // ... 其他您可能需要的字段
}

interface PlaceDetailsApiResponse {
  result: PlaceDetailsResult;
  status: string; // e.g., "OK", "ZERO_RESULTS", "INVALID_REQUEST", etc.
  error_message?: string; // Present if status is not "OK"
  // html_attributions?: string[]; // If you need to display attributions
}

export async function GET(request: Request) {
  const logger = createLogger('Route');

  const { searchParams } = new URL(request.url);
  const placeid = searchParams.get("placeid");
  const sessiontoken = searchParams.get("sessiontoken");

  if (!GOOGLE_MAPS_API_KEY) {
    logger.error("Google Maps API Key is not configured for place details.");
    return NextResponse.json(
      { error: "Server configuration error: API key missing" },
      { status: 500 },
    );
  }

  if (!placeid || typeof placeid !== "string") {
    return NextResponse.json(
      { error: "Place ID parameter is required and must be a string" },
      { status: 400 },
    );
  }

  // 指定您需要的字段，以避免不必要的数据和费用
  const fields = "address_component,formatted_address,geometry,name,place_id";
  let apiUrl = `https://maps.googleapis.com/maps/api/place/details/json?place_id=${encodeURIComponent(placeid)}&fields=${fields}&key=${GOOGLE_MAPS_API_KEY}`;

  if (sessiontoken && typeof sessiontoken === "string") {
    apiUrl += `&sessiontoken=${encodeURIComponent(sessiontoken)}`;
  }
  // 可以根据需要添加 language 参数

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000); // 10秒超时

    const googleResponse = await fetch(apiUrl, { signal: controller.signal });
    clearTimeout(timeoutId);

    const data = (await googleResponse.json()) as PlaceDetailsApiResponse;

    if (!googleResponse.ok || data.status !== "OK") {
      logger.error(
        "Google Places Details API error. Status:",
        data.status,
        "Message:",
        data.error_message,
        "Full response:",
        data,
      );
      return NextResponse.json(
        {
          error: `Failed to fetch place details: ${data.status || "Unknown error"}`,
          details: data.error_message || "No additional details provided.",
        },
        { status: googleResponse.status || 500 },
      );
    }

    // 返回 Google API 的 result 对象
    return NextResponse.json(data.result, { status: 200 });
  } catch (error: unknown) {
    const err = error instanceof Error ? error : new Error("Unknown error");
    logger.error("Error in placeDetails proxy:", err);
    return NextResponse.json(
      { error: "Internal server error", details: err.message },
      { status: 500 },
    );
  }
}
