import { NextResponse } from 'next/server';

// 在 Vercel 平台或本地 .env.local 文件中配置此环境变量
const GOOGLE_MAPS_API_KEY = process.env.GOOGLE_MAPS_API_KEY;

interface TimezoneApiResponse {
  dstOffset: number;      // 夏令时偏移量（秒）
  rawOffset: number;      // 与UTC的基本偏移量（秒）
  timeZoneId: string;     // IANA格式的时区ID，如"America/New_York"
  timeZoneName: string;   // 本地化的时区名称
  status: string;         // API响应状态，如"OK", "ZERO_RESULTS", "INVALID_REQUEST"等
  error_message?: string; // 仅在错误时存在
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const location = searchParams.get('location');
  const timestamp = searchParams.get('timestamp');

  if (!GOOGLE_MAPS_API_KEY) {
    console.error('Google Maps API Key is not configured for timezone API.');
    return NextResponse.json({ error: 'Server configuration error: API key missing' }, { status: 500 });
  }

  if (!location || typeof location !== 'string') { // location can be null from searchParams.get
    return NextResponse.json({ error: 'Location parameter is required and must be in format "latitude,longitude"' }, { status: 400 });
  }

  // 验证location参数格式（latitude,longitude）
  const locationRegex = /^[-+]?([1-8]?\d(\.\d+)?|90(\.0+)?),\s*[-+]?(180(\.0+)?|((1[0-7]\d)|([1-9]?\d))(\.\d+)?)$/;
  if (!locationRegex.test(location)) {
    return NextResponse.json({ error: 'Invalid location format. Must be "latitude,longitude"' }, { status: 400 });
  }

  // 使用当前时间戳（如果未提供）
  const ts = timestamp ? Number(timestamp) : Math.floor(Date.now() / 1000);

  if (isNaN(ts)) {
    return NextResponse.json({ error: 'Timestamp must be a valid number' }, { status: 400 });
  }

  const apiUrl = `https://maps.googleapis.com/maps/api/timezone/json?location=${encodeURIComponent(location)}&timestamp=${ts}&key=${GOOGLE_MAPS_API_KEY}`;

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000); // 10秒超时

    const googleResponse = await fetch(apiUrl, { signal: controller.signal });
    clearTimeout(timeoutId);

    const data = await googleResponse.json() as TimezoneApiResponse;

    if (!googleResponse.ok || data.status !== 'OK') {
      console.error('Google Timezone API error. Status:', data.status, 'Message:', data.error_message, 'Full response:', data);
      return NextResponse.json({
        error: `Failed to fetch timezone information: ${data.status || 'Unknown error'}`,
        details: data.error_message || 'No additional details provided.'
      }, { status: googleResponse.status || 500 });
    }

    // 返回完整的Google API响应
    return NextResponse.json(data, { status: 200 });
  } catch (error: unknown) {
    const err = error instanceof Error ? error : new Error('Unknown error');
    console.error('Error in timezone proxy:', err);
    return NextResponse.json({ error: 'Internal server error', details: err.message }, { status: 500 });
  }
}