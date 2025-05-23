import { NextResponse } from "next/server";

const GOOGLE_MAPS_API_KEY = process.env.GOOGLE_MAPS_API_KEY;

interface AutocompletePrediction {
  description: string;
  place_id: string;
  // 根据需要可以添加 structured_formatting, terms, types 等
}

interface AutocompleteApiResponse {
  predictions: AutocompletePrediction[];
  status: string; // e.g., "OK", "ZERO_RESULTS", "INVALID_REQUEST", etc.
  error_message?: string; // Present if status is not "OK"
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const input = searchParams.get("input");
  const sessiontoken = searchParams.get("sessiontoken");

  if (!GOOGLE_MAPS_API_KEY) {
    console.error("Google Maps API Key is not configured for autocomplete.");
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

  let apiUrl = `https://maps.googleapis.com/maps/api/place/autocomplete/json?input=${encodeURIComponent(input)}&key=${GOOGLE_MAPS_API_KEY}&types=locality`;

  if (sessiontoken && typeof sessiontoken === "string") {
    apiUrl += `&sessiontoken=${encodeURIComponent(sessiontoken)}`;
  }
  // 可以根据需要添加其他参数，如 language, components 等

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 20000); // 20秒超时

    const googleResponse = await fetch(apiUrl, { signal: controller.signal });
    clearTimeout(timeoutId);

    const data = (await googleResponse.json()) as AutocompleteApiResponse;

    if (!googleResponse.ok || data.status !== "OK") {
      console.error(
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

    // 返回 Google API 的原始 predictions 数组或适配后的数组
    // 前端将需要适配这个结构，因为它不同于 JS SDK 的 PlacePrediction
    return NextResponse.json(
      { predictions: data.predictions },
      { status: 200 },
    );
  } catch (error: unknown) {
    const err = error instanceof Error ? error : new Error("Unknown error");
    console.error("Error in autocomplete proxy:", err);
    return NextResponse.json(
      { error: "Internal server error", details: err.message },
      { status: 500 },
    );
  }
}
