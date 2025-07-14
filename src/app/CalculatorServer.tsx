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

    // 额外验证：检查预计算数据的时间范围是否涵盖当前时间
    if (precomputed) {
      const firstHour = precomputed.planetaryHours[0]
      const lastHour = precomputed.planetaryHours[precomputed.planetaryHours.length - 1]
      
      if (firstHour && lastHour) {
        const dataStartTime = new Date(firstHour.startTime)
        const dataEndTime = new Date(lastHour.endTime)
        
        // 检查当前时间是否在预计算数据的时间范围内
        if (nowUTC < dataStartTime || nowUTC > dataEndTime) {
          logger.warn('[数据验证] 当前时间超出预计算数据范围，尝试加载前一天数据', {
            currentTime: nowUTC.toISOString(),
            dataStartTime: dataStartTime.toISOString(),
            dataEndTime: dataEndTime.toISOString(),
            cacheKey,
          })
          
          // 智能数据选择：如果当前时间早于今天的数据开始时间，尝试加载前一天的数据
          if (nowUTC < dataStartTime) {
            const yesterdayDate = new Date(nowUTC.getTime() - 24 * 60 * 60 * 1000)
            const yesterdayStr = formatInTimeZone(yesterdayDate, NY_TIMEZONE, 'yyyy-MM-dd')
            const yesterdayCacheKey = `ny-${yesterdayStr}`
            
            logger.info('[智能数据选择] 尝试加载前一天数据', { 
              yesterdayCacheKey,
              reason: '当前时间早于今天数据开始时间'
            })
            
            const yesterdayData = await loadPrecomputed(yesterdayCacheKey)
            if (yesterdayData) {
              const yesterdayLastHour = yesterdayData.planetaryHours[yesterdayData.planetaryHours.length - 1]
              if (yesterdayLastHour) {
                const yesterdayEndTime = new Date(yesterdayLastHour.endTime)
                
                // 检查当前时间是否在前一天数据的覆盖范围内
                if (nowUTC >= new Date(yesterdayData.planetaryHours[0].startTime) && nowUTC < yesterdayEndTime) {
                  logger.info('[智能数据选择] 使用前一天数据', {
                    dataRange: `${yesterdayData.planetaryHours[0].startTime} - ${yesterdayLastHour.endTime}`,
                    currentTime: nowUTC.toISOString()
                  })
                  precomputed = yesterdayData
                } else {
                  logger.warn('[智能数据选择] 前一天数据也无法覆盖当前时间', {
                    currentTime: nowUTC.toISOString(),
                    yesterdayEndTime: yesterdayEndTime.toISOString()
                  })
                  precomputed = null
                }
              }
            } else {
              logger.warn('[智能数据选择] 无法加载前一天数据', { yesterdayCacheKey })
              precomputed = null
            }
          } else {
            precomputed = null
          }
        }
      }
    }

    if (!precomputed) {
      logger.info('[即时计算] 预计算文件不存在，开始即时计算')
      // 回退即时计算
      calculationResult = await planetaryHoursCalculator.calculate(
        nowUTC,
        LATITUDE_NY,
        LONGITUDE_NY,
        NY_TIMEZONE
      )

      if (calculationResult) {
        logger.info('[即时计算] 计算完成', {
          requestedDate: calculationResult.requestedDate,
          totalHours: calculationResult.planetaryHours.length,
        })
      } else {
        logger.error('[即时计算] 计算失败')
      }

      // 开发模式将结果写入本地，方便下次复用
      if (process.env.NODE_ENV === 'development' && calculationResult) {
        try {
          const dir = path.resolve(process.cwd(), 'public', 'precomputed')
          await fs.mkdir(dir, { recursive: true })
          await fs.writeFile(
            path.join(dir, `${cacheKey}.json`),
            JSON.stringify(calculationResult),
            'utf-8'
          )
          logger.info('[开发模式] 已保存预计算文件到本地', { cacheKey })
        } catch (writeError) {
          logger.warn('[开发模式] 无法写入预计算文件', {
            error:
              writeError instanceof Error ? writeError.message : writeError,
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
