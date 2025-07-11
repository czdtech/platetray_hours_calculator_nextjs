import { NextResponse } from 'next/server'

import { apiLogger } from '@/utils/unified-logger'

// 在 Vercel 平台或本地 .env.local 文件中配置此环境变量
const GOOGLE_MAPS_API_KEY = process.env.GOOGLE_MAPS_API_KEY

// Place Details API 响应接口
interface PlaceDetailsResponse {
  result: {
    place_id: string
    name: string
    formatted_address: string
    geometry: {
      location: {
        lat: number
        lng: number
      }
    }
    address_components?: Array<{
      long_name: string
      short_name: string
      types: string[]
    }>
  }
  status: string
}

export async function GET(request: Request) {
  const start = performance.now()
  const { searchParams } = new URL(request.url)
  const placeId = searchParams.get('placeid') || searchParams.get('placeId')
  const sessionToken = searchParams.get('sessiontoken')

  apiLogger.request('/api/maps/placeDetails', 'GET', { placeId })

  if (!GOOGLE_MAPS_API_KEY) {
    apiLogger.error(
      '/api/maps/placeDetails',
      new Error('Google Maps API Key missing'),
      performance.now() - start
    )
    return NextResponse.json(
      { error: 'Server configuration error: API key missing' },
      { status: 500 }
    )
  }

  if (!placeId || typeof placeId !== 'string') {
    return NextResponse.json({ error: 'Place ID is required' }, { status: 400 })
  }

  // 构建Place Details API URL
  const params = new URLSearchParams({
    place_id: placeId,
    fields: 'place_id,name,formatted_address,geometry,address_components',
    key: GOOGLE_MAPS_API_KEY,
  })

  if (sessionToken) {
    params.append('sessiontoken', sessionToken)
  }

  const apiUrl = `https://maps.googleapis.com/maps/api/place/details/json?${params.toString()}`

  try {
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 10000) // 10秒超时

    const googleResponse = await fetch(apiUrl, { signal: controller.signal })
    clearTimeout(timeoutId)

    const data = (await googleResponse.json()) as PlaceDetailsResponse

    if (!googleResponse.ok || data.status !== 'OK') {
      apiLogger.error(
        '/api/maps/placeDetails',
        new Error(`Google API error: ${data.status}`),
        performance.now() - start
      )
      return NextResponse.json(
        {
          error: `Failed to fetch place details: ${data.status || 'Unknown error'}`,
        },
        { status: googleResponse.status || 500 }
      )
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
    }

    apiLogger.success('/api/maps/placeDetails', performance.now() - start, {
      name: result.name,
    })
    return NextResponse.json(result, { status: 200 })
  } catch (error: unknown) {
    const err = error instanceof Error ? error : new Error('Unknown error')
    apiLogger.error('/api/maps/placeDetails', err, performance.now() - start)
    return NextResponse.json(
      { error: 'Internal server error', details: err.message },
      { status: 500 }
    )
  }
}
