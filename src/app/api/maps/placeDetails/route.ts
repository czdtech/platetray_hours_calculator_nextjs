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

// Place Details API 响应接口
interface PlaceDetailsResponse {
  result: {
    place_id: string;
    name: string;
    formatted_address: string;
    geometry: {
      location: {
        lat: number;
        lng: number;
      };
    };
    address_components?: Array<{
      long_name: string;
      short_name: string;
      types: string[];
    }>;
  };
  status: string;
}

export async function GET(request: Request) {
  const start = logApiStart('/api/maps/placeDetails', 'GET');
  const { searchParams } = new URL(request.url);
  const placeId = searchParams.get('placeid') || searchParams.get('placeId');
  const sessionToken = searchParams.get('sessiontoken');

  // 检查API密钥
  const keyCheckResult = checkApiKey('/api/maps/placeDetails', start);
  if (keyCheckResult) return keyCheckResult;

  // 验证参数
  if (!placeId || typeof placeId !== 'string') {
    return NextResponse.json({ error: 'Place ID is required' }, { status: 400 });
  }

  try {
    // 构建API参数
    const params = new URLSearchParams({
      place_id: placeId,
      fields: 'place_id,name,formatted_address,geometry,address_components',
    });

    if (sessionToken) {
      params.append('sessiontoken', sessionToken);
    }

    const apiUrl = buildGoogleApiUrl('place/details/json', params);
    const googleResponse = await fetchWithTimeout(apiUrl);
    const data = (await googleResponse.json()) as PlaceDetailsResponse;

    if (!googleResponse.ok || data.status !== 'OK') {
      return handleGoogleApiResponse(googleResponse, '/api/maps/placeDetails', start);
    }

    // 返回Google Maps标准格式的数据
    const result = {
      place_id: data.result.place_id,
      name: data.result.name,
      formatted_address: data.result.formatted_address,
      geometry: {
        location: {
          lat: data.result.geometry.location.lat,
          lng: data.result.geometry.location.lng,
        },
      },
      address_components: data.result.address_components || [],
    };

    logApiSuccess('/api/maps/placeDetails', start, { name: result.name });
    return NextResponse.json(result, { status: 200 });
  } catch (error: unknown) {
    return handleApiError(error, '/api/maps/placeDetails', start);
  }
}
