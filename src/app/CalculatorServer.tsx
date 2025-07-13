import CalculatorClient from '@/components/Calculator/CalculatorClient'
import { generateCacheControlHeader } from '@/utils/cache/dynamicTTL'
import { getCurrentHourPayload } from '@/utils/planetaryHourHelpers'
import { NY_TIMEZONE, getCurrentUTCDate, toNewYorkTime } from '@/utils/time'
import { createLogger } from '@/utils/unified-logger'
import { formatInTimeZone } from 'date-fns-tz'
import fs from 'fs/promises'
import path from 'path'

import {
  PlanetaryHoursCalculationResult,
  planetaryHoursCalculator,
} from '@/services/PlanetaryHoursCalculator'

const logger = createLogger('CalculatorServer')

// 纽约坐标常量
const LATITUDE_NY = 40.7128
const LONGITUDE_NY = -74.006

const ISO_REGEX = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/

function reviveDates<T>(data: T): T {
  return JSON.parse(JSON.stringify(data), (_key, value) => {
    if (typeof value === 'string' && ISO_REGEX.test(value)) {
      return new Date(value)
    }
    return value
  })
}

async function loadPrecomputed(
  key: string
): Promise<PlanetaryHoursCalculationResult | null> {
  // 1) 尝试从本地文件读取 (public/precomputed)
  try {
    const filePath = path.resolve(
      process.cwd(),
      'public',
      'precomputed',
      `${key}.json`
    )
    const json = await fs.readFile(filePath, 'utf-8')
    const raw = JSON.parse(json)
    logger.info(`[预计算] 成功加载预计算文件: ${key}.json`, {
      filePath,
      requestedDate: raw.requestedDate,
    })
    return reviveDates(raw) as PlanetaryHoursCalculationResult
  } catch (error) {
    logger.warn(`[预计算] 无法加载预计算文件 ${key}.json`, {
      error: error instanceof Error ? error.message : error,
    })
  }
  // 2) 未来可加入 Vercel KV 读取逻辑 (边缘运行时除外)
  return null
}

/**
 * 设置动态缓存响应头
 * 注意：在App Router中，我们通过传递信息给客户端的方式来实现缓存策略
 */
async function setDynamicCacheHeaders(
  cacheControl: string,
  ttlSeconds: number
) {
  // 在App Router中，我们无法直接设置响应头
  // 但我们可以通过其他方式实现缓存控制
  logger.info('动态缓存策略', {
    cacheControl,
    ttlSeconds,
    hint: '在App Router中通过客户端和ISR策略实现',
  })
}

/**
 * 服务端组件：负责实时计算纽约行星时数据并计算缓存策略
 *
 * 该组件将在每次请求时执行，根据当前时间和行星时状态
 * 动态计算最优的缓存时间，确保用户看到准确的当前行星时
 */
export default async function CalculatorServer() {
  // 获取当前服务端时间 - 这是关键的时间基准
  const nowUTC = getCurrentUTCDate()
  const todayStr = formatInTimeZone(nowUTC, NY_TIMEZONE, 'yyyy-MM-dd')

  logger.info('服务端渲染开始', {
    serverTime: nowUTC.toISOString(),
    todayString: todayStr,
    timestamp: Date.now(),
    environment: process.env.NODE_ENV,
  })

  // 同时保留纽约当前时间对象供后续计算使用
  const nowInNY = toNewYorkTime(nowUTC)
  logger.info('[时区转换] 纽约当前时间', {
    utcTime: nowUTC.toISOString(),
    nyTime: nowInNY.toString(),
    todayStr,
  })

  const cacheKey = `ny-${todayStr}`
  let calculationResult: PlanetaryHoursCalculationResult | null = null

  try {
    // 首先尝试加载预计算数据
    logger.info('[数据获取] 尝试加载预计算数据', { cacheKey })
    let precomputed = await loadPrecomputed(cacheKey)

    // 若预计算文件存在但日期不一致（可能因缓存过期或生成错误），则忽略并重新计算
    if (precomputed && precomputed.requestedDate !== todayStr) {
      logger.warn('[数据验证] 预计算文件日期不匹配，将重新计算', {
        fileDate: precomputed.requestedDate,
        expectedDate: todayStr,
        cacheKey,
      })
      precomputed = null
    }

    // 验证预计算数据的完整性
    if (precomputed) {
      if (!precomputed.planetaryHours || precomputed.planetaryHours.length !== 24) {
        logger.warn('[数据验证] 预计算文件数据不完整，将重新计算', {
          hoursCount: precomputed.planetaryHours?.length || 0,
          expectedCount: 24,
          cacheKey,
        })
        precomputed = null
      }
    }

    if (!precomputed) {
      logger.info('[即时计算] 预计算文件不存在或无效，开始即时计算', {
        cacheKey,
        serverTime: nowUTC.toISOString(),
        nyTime: nowInNY.toString()
      })
      
      // 回退即时计算 - 使用相同的时区计算逻辑确保一致性
      calculationResult = await planetaryHoursCalculator.calculate(
        nowUTC,
        LATITUDE_NY,
        LONGITUDE_NY,
        NY_TIMEZONE
      )

      if (calculationResult) {
        // 验证即时计算结果
        if (calculationResult.requestedDate !== todayStr) {
          logger.warn('[即时计算] 计算日期与预期不符', {
            calculatedDate: calculationResult.requestedDate,
            expectedDate: todayStr,
            serverTime: nowUTC.toISOString()
          })
        }
        
        if (calculationResult.planetaryHours.length !== 24) {
          logger.error('[即时计算] 计算结果不完整', new Error('数据不完整'), {
            hoursCount: calculationResult.planetaryHours.length,
            expectedCount: 24
          })
          throw new Error(`即时计算结果不完整: ${calculationResult.planetaryHours.length}/24 小时`)
        }
        
        logger.info('[即时计算] 计算完成', {
          requestedDate: calculationResult.requestedDate,
          totalHours: calculationResult.planetaryHours.length,
          sunrise: calculationResult.sunrise?.toISOString(),
          sunset: calculationResult.sunset?.toISOString(),
        })
      } else {
        logger.error('[即时计算] 计算失败')
        throw new Error('即时计算返回空结果')
      }

      // 线上环境也保存计算结果作为缓存（仅在成功时）
      if (calculationResult && calculationResult.planetaryHours.length === 24) {
        try {
          const dir = path.resolve(process.cwd(), 'public', 'precomputed')
          await fs.mkdir(dir, { recursive: true })
          await fs.writeFile(
            path.join(dir, `${cacheKey}.json`),
            JSON.stringify(calculationResult),
            'utf-8'
          )
          logger.info('[缓存保存] 已保存即时计算结果到本地', { 
            cacheKey,
            environment: process.env.NODE_ENV 
          })
        } catch (writeError) {
          logger.warn('[缓存保存] 无法写入预计算文件', {
            error: writeError instanceof Error ? writeError.message : writeError,
          })
        }
      }
    } else {
      calculationResult = precomputed
      logger.info('[预计算] 使用预计算数据', {
        requestedDate: calculationResult.requestedDate,
        source: 'precomputed',
      })
    }

    if (!calculationResult) {
      throw new Error('无法获取计算结果')
    }

    // 基于当前服务端时间计算当前行星时和TTL信息
    const payload = getCurrentHourPayload(calculationResult, '24h', nowUTC)

    logger.info('当前行星时状态', {
      currentHour: payload.currentHour?.planet || 'none',
      nextSwitchIn: Math.round(payload.ttlInfo.remainingMs / 1000 / 60),
      isSensitive: payload.ttlInfo.isSensitivePeriod,
      recommendedTTL: payload.ttlInfo.ttlSeconds,
      serverTime: nowUTC.toISOString(),
      calculationDate: calculationResult.requestedDate,
    })

    // 设置动态缓存响应头
    const cacheControl = generateCacheControlHeader(calculationResult, nowUTC)
    await setDynamicCacheHeaders(cacheControl, payload.ttlInfo.ttlSeconds)

    return (
      <CalculatorClient
        calculationResult={calculationResult}
        initialHourPayload={payload}
        serverTime={nowUTC.toISOString()}
        cacheControl={cacheControl}
        ttlInfo={payload.ttlInfo}
      />
    )
  } catch (error) {
    logger.error(
      '服务端渲染失败',
      error instanceof Error ? error : new Error(String(error)),
      { todayStr, serverTime: nowUTC.toISOString() }
    )

    // 降级处理：返回基础组件，让客户端处理
    return (
      <CalculatorClient
        calculationResult={null}
        initialHourPayload={null}
        serverTime={nowUTC.toISOString()}
        error="服务端数据加载失败，将使用客户端计算"
      />
    )
  }
}
