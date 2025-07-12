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

// Geocode API 响应接口
interface GeocodeResult {
  geometry: { location: { lat: number; lng: number } };
  formatted_address: string;
}

interface GeocodeResponse {
  results: GeocodeResult[];
  status: 'OK' | 'ZERO_RESULTS' | string;
  error_message?: string;
}

export async function GET(request: Request) {
  const start = logApiStart('/api/maps/geocode', 'GET');
  const { searchParams } = new URL(request.url);
  const address = searchParams.get('address');
  const latlng = searchParams.get('latlng');

  // 检查API密钥
  const keyCheckResult = checkApiKey('/api/maps/geocode', start);
  if (keyCheckResult) return keyCheckResult;

  // 验证参数
  if (!address && !latlng) {
    return NextResponse.json(
      { error: 'Address or latlng parameter is required' },
      { status: 400 }
    );
  }

  try {
    // 构建API参数
    const params = new URLSearchParams();
    
    if (address) {
      params.append('address', address);
    } else if (latlng) {
      params.append('latlng', latlng);
    }

    const apiUrl = buildGoogleApiUrl('geocode/json', params);
    const googleResponse = await fetchWithTimeout(apiUrl);
    const data = (await googleResponse.json()) as GeocodeResponse;

    if (!googleResponse.ok || data.status !== 'OK') {
      return handleGoogleApiResponse(googleResponse, '/api/maps/geocode', start);
    }

    logApiSuccess('/api/maps/geocode', start, { count: data.results?.length || 0 });
    return NextResponse.json(data, { status: 200 });
  } catch (error: unknown) {
    return handleApiError(error, '/api/maps/geocode', start);
  }
}
