import { NextResponse } from 'next/server'
import { kv } from '@vercel/kv'
import { formatInTimeZone } from 'date-fns-tz'
import { getCurrentUTCDate } from '@/utils/time'
import { createLogger } from '@/utils/unified-logger'
import { assertBearerToken, UnauthorizedError, jsonUnauthorizedResponse } from '@/utils/server/auth'

const logger = createLogger('KVDebugAPI')

// 强制动态执行，防止Vercel缓存
export const dynamic = 'force-dynamic'

/**
 * KV存储调试API
 * 用于检查当前存储的预计算数据
 */
export async function GET(request: Request) {
  const tokenEnv = process.env.KV_DEBUG_TOKEN ? 'KV_DEBUG_TOKEN' : 'CRON_SECRET'
  try {
    assertBearerToken(request, tokenEnv)
  } catch (error) {
    if (error instanceof UnauthorizedError) {
      return jsonUnauthorizedResponse('未授权访问')
    }
    throw error
  }

  try {
    const nowUTC = getCurrentUTCDate()
    const nyTimezone = 'America/New_York'
    const todayStr = formatInTimeZone(nowUTC, nyTimezone, 'yyyy-MM-dd')
    const yesterdayStr = formatInTimeZone(new Date(nowUTC.getTime() - 24 * 60 * 60 * 1000), nyTimezone, 'yyyy-MM-dd')
    const tomorrowStr = formatInTimeZone(new Date(nowUTC.getTime() + 24 * 60 * 60 * 1000), nyTimezone, 'yyyy-MM-dd')

    // 检查KV是否可用
    const kvAvailable = !!(process.env.KV_REST_API_URL && process.env.KV_REST_API_TOKEN)
    
    if (!kvAvailable) {
      return NextResponse.json({
        error: 'KV存储不可用',
        envCheck: {
          KV_REST_API_URL: !!process.env.KV_REST_API_URL,
          KV_REST_API_TOKEN: !!process.env.KV_REST_API_TOKEN
        }
      }, { status: 500 })
    }

    // 检查多天数据
    const keys = [`ny-${yesterdayStr}`, `ny-${todayStr}`, `ny-${tomorrowStr}`]
    const results = await Promise.all(
      keys.map(async (key) => {
        try {
          const data = await kv.get(key) as any
          return {
            key,
            exists: !!data,
            dataSize: data ? JSON.stringify(data).length : 0,
            requestedDate: data?.requestedDate || null,
            sunrise: data?.sunrise || null,
            sunset: data?.sunset || null,
            planetaryHoursCount: data?.planetaryHours?.length || 0
          }
        } catch (error) {
          return {
            key,
            exists: false,
            error: error instanceof Error ? error.message : String(error)
          }
        }
      })
    )

    // 检查当前时间在数据范围内的情况
    const todayData = await kv.get(`ny-${todayStr}`) as any
    let currentTimeInRange = false
    let dataTimeRange = null
    
    if (todayData?.planetaryHours?.length > 0) {
      const firstHour = todayData.planetaryHours[0]
      const lastHour = todayData.planetaryHours[todayData.planetaryHours.length - 1]
      
      if (firstHour && lastHour) {
        const dataStart = new Date(firstHour.startTime)
        const dataEnd = new Date(lastHour.endTime)
        currentTimeInRange = nowUTC >= dataStart && nowUTC < dataEnd
        
        dataTimeRange = {
          start: dataStart.toISOString(),
          end: dataEnd.toISOString(),
          startLocal: formatInTimeZone(dataStart, nyTimezone, 'yyyy-MM-dd HH:mm:ss zzz'),
          endLocal: formatInTimeZone(dataEnd, nyTimezone, 'yyyy-MM-dd HH:mm:ss zzz')
        }
      }
    }

    return NextResponse.json({
      timestamp: nowUTC.toISOString(),
      currentTimeLocal: formatInTimeZone(nowUTC, nyTimezone, 'yyyy-MM-dd HH:mm:ss zzz'),
      kvAvailable,
      dataResults: results,
      currentTimeAnalysis: {
        todayKey: `ny-${todayStr}`,
        currentTimeInRange,
        dataTimeRange
      }
    })

  } catch (error) {
    logger.error('KV调试API失败', error instanceof Error ? error : new Error(String(error)))
    return NextResponse.json({
      error: '调试API执行失败',
      message: error instanceof Error ? error.message : String(error)
    }, { status: 500 })
  }
}
