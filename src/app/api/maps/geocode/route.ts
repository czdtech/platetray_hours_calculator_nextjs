import { NextResponse } from "next/server";

// 在 Vercel 平台或本地 .env.local 文件中配置此环境变量
const GOOGLE_MAPS_API_KEY = process.env.GOOGLE_MAPS_API_KEY;

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const address = searchParams.get("address");
  const latlng = searchParams.get("latlng");

  if (!GOOGLE_MAPS_API_KEY) {
    console.error("Google Maps API Key is not configured.");
    return NextResponse.json(
      { error: "Server configuration error: API key missing" },
      { status: 500 },
    );
  }

  let apiUrl =
    "https://maps.googleapis.com/maps/api/geocode/json?key=" +
    GOOGLE_MAPS_API_KEY;

  if (address) {
    apiUrl += `&address=${encodeURIComponent(address as string)}`;
  } else if (latlng) {
    apiUrl += `&latlng=${encodeURIComponent(latlng as string)}`;
  } else {
    return NextResponse.json(
      { error: "Address or latlng parameter is required" },
      { status: 400 },
    );
  }

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000); // 10秒超时

    const googleResponse = await fetch(apiUrl, { signal: controller.signal });
    clearTimeout(timeoutId);

    // 尝试解析JSON，即使响应不是ok，也可能包含有用的错误信息
    interface GeocodeResult {
      geometry: { location: { lat: number; lng: number } };
      formatted_address: string;
      // 可以根据需要添加更多字段
    }

    interface GeocodeErrorResponse {
      error_message?: string;
      results?: GeocodeResult[];
      status: string;
    }

    interface GeocodeSuccessResponse {
      results: GeocodeResult[];
      status: "OK" | "ZERO_RESULTS"; // 扩展可能的成功状态
      // 可以根据需要添加其他成功状态
    }

    const data = (await googleResponse.json()) as
      | GeocodeSuccessResponse
      | GeocodeErrorResponse;

    if (!googleResponse.ok || !("results" in data && data.status === "OK")) {
      const errorStatus =
        (data as GeocodeErrorResponse).status || "Unknown API error";
      const errorMessage =
        (data as GeocodeErrorResponse).error_message ||
        "No additional details from API.";
      console.error(
        "Google Geocoding API error. Status:",
        errorStatus,
        "Message:",
        errorMessage,
        "Full response:",
        data,
      );
      return NextResponse.json(
        {
          error: `Failed to process geocoding request: ${errorStatus}`,
          details: errorMessage,
        },
        { status: googleResponse.status || 500 },
      );
    }
    return NextResponse.json(data, { status: 200 });
  } catch (error: unknown) {
    const err = error instanceof Error ? error : new Error("Unknown error");
    console.error("Error in geocode proxy:", err);
    return NextResponse.json(
      { error: "Internal server error", details: err.message },
      { status: 500 },
    );
  }
}
