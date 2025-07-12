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

interface TimezoneApiResponse {
  dstOffset: number; // 夏令时偏移量（秒）
  rawOffset: number; // 与UTC的基本偏移量（秒）
  timeZoneId: string; // IANA格式的时区ID，如"America/New_York"
  timeZoneName: string; // 本地化的时区名称
  status: string; // API响应状态，如"OK", "ZERO_RESULTS", "INVALID_REQUEST"等
  error_message?: string; // 仅在错误时存在
}

export async function GET(request: Request) {
  const start = logApiStart('/api/maps/timezone', 'GET');
  const { searchParams } = new URL(request.url);
  const location = searchParams.get('location');
  const timestamp = searchParams.get('timestamp');

  // 检查API密钥
  const keyCheckResult = checkApiKey('/api/maps/timezone', start);
  if (keyCheckResult) return keyCheckResult;

  // 验证location参数
  if (!location || typeof location !== 'string') {
    return NextResponse.json(
      {
        error: 'Location parameter is required and must be in format "latitude,longitude"',
      },
      { status: 400 }
    );
  }

  // 验证location参数格式（latitude,longitude）
  const locationRegex =
    /^[-+]?([1-8]?\d(\.\d+)?|90(\.0+)?),\s*[-+]?(180(\.0+)?|((1[0-7]\d)|([1-9]?\d))(\.\d+)?)$/;
  if (!locationRegex.test(location)) {
    return NextResponse.json(
      { error: 'Invalid location format. Must be "latitude,longitude"' },
      { status: 400 }
    );
  }

  // 使用当前时间戳（如果未提供）
  const ts = timestamp ? Number(timestamp) : Math.floor(Date.now() / 1000);

  if (isNaN(ts)) {
    return NextResponse.json(
      { error: 'Timestamp must be a valid number' },
      { status: 400 }
    );
  }

  try {
    // 构建API参数
    const params = new URLSearchParams({
      location: location,
      timestamp: ts.toString(),
    });

    const apiUrl = buildGoogleApiUrl('timezone/json', params);
    const googleResponse = await fetchWithTimeout(apiUrl);
    const data = (await googleResponse.json()) as TimezoneApiResponse;

    if (!googleResponse.ok || data.status !== 'OK') {
      return handleGoogleApiResponse(googleResponse, '/api/maps/timezone', start);
    }

    // 返回完整的Google API响应
    logApiSuccess('/api/maps/timezone', start, { status: data.status });
    return NextResponse.json(data, { status: 200 });
  } catch (error: unknown) {
    return handleApiError(error, '/api/maps/timezone', start);
  }
}
