#!/usr/bin/env tsx
/*
  生成多天纽约行星时预计算数据
  用于 Cron Jobs 每日自动预计算
*/

import { addDays } from 'date-fns'
import { formatInTimeZone } from 'date-fns-tz'
import fs from 'fs/promises'
import path from 'path'
import { planetaryHoursCalculator } from '../src/services/PlanetaryHoursCalculator'
import { NY_TIMEZONE, getCurrentUTCDate } from '../src/utils/time'
import { createLogger } from '../src/utils/unified-logger'

const logger = createLogger('PrecomputeMultipleDays')

const LATITUDE_NY = 40.7128
const LONGITUDE_NY = -74.006

// 从环境变量读取天数，默认7天
const DEFAULT_DAYS = 7
const DAYS_TO_GENERATE = process.env.PRECOMPUTE_DAYS 
  ? parseInt(process.env.PRECOMPUTE_DAYS, 10) 
  : DEFAULT_DAYS

async function writeToLocalFile(key: string, json: string) {
  const destDir = path.resolve(__dirname, '../public/precomputed')
  await fs.mkdir(destDir, { recursive: true })
  const destPath = path.join(destDir, `${key}.json`)
  await fs.writeFile(destPath, json, 'utf-8')
  logger.info(`已写入本地文件: ${destPath}`)
}

function validateCalculationResult(result: any, expectedDate: string): boolean {
  if (!result) {
    logger.error('计算结果为空')
    return false
  }

  if (result.requestedDate !== expectedDate) {
    logger.error(`日期不匹配: 期望 ${expectedDate}, 实际 ${result.requestedDate}`)
    return false
  }

  if (!result.planetaryHours || result.planetaryHours.length === 0) {
    logger.error('行星时数据为空')
    return false
  }

  if (!result.sunrise || !result.sunset) {
    logger.error('日出日落时间缺失')
    return false
  }

  return true
}

export async function generatePrecomputeForDate(targetDate: Date): Promise<boolean> {
  const dateStr = formatInTimeZone(targetDate, NY_TIMEZONE, 'yyyy-MM-dd')
  const cacheKey = `ny-${dateStr}`

  logger.info(`开始计算 ${dateStr} 的行星时数据`)

  try {
    const calcResult = await planetaryHoursCalculator.calculate(
      targetDate,
      LATITUDE_NY,
      LONGITUDE_NY,
      NY_TIMEZONE
    )

    if (!validateCalculationResult(calcResult, dateStr)) {
      return false
    }

    logger.info(`计算完成: ${dateStr}`, {
      requestedDate: calcResult!.requestedDate,
      sunrise: calcResult!.sunrise?.toISOString(),
      sunset: calcResult!.sunset?.toISOString(),
      planetaryHoursCount: calcResult!.planetaryHours?.length || 0,
    })

    const json = JSON.stringify(calcResult)
    await writeToLocalFile(cacheKey, json)

    logger.info(`预计算文件生成成功: ${cacheKey}.json`)
    return true
  } catch (error) {
    logger.error(`生成 ${dateStr} 预计算失败`, error instanceof Error ? error : new Error(String(error)))
    return false
  }
}

export async function forcePrecomputeMultipleDays(): Promise<void> {
  const nowUTC = getCurrentUTCDate()
  logger.info(`开始生成多天预计算数据`, {
    startTime: nowUTC.toISOString(),
    daysToGenerate: DAYS_TO_GENERATE,
  })

  const results: { date: string; success: boolean }[] = []

  for (let i = 0; i < DAYS_TO_GENERATE; i++) {
    const targetDate = addDays(nowUTC, i)
    const dateStr = formatInTimeZone(targetDate, NY_TIMEZONE, 'yyyy-MM-dd')
    
    logger.info(`处理第 ${i + 1}/${DAYS_TO_GENERATE} 天: ${dateStr}`)
    
    const success = await generatePrecomputeForDate(targetDate)
    results.push({ date: dateStr, success })

    // 在连续计算之间添加短暂延迟，避免资源过载
    if (i < DAYS_TO_GENERATE - 1) {
      await new Promise(resolve => setTimeout(resolve, 100))
    }
  }

  // 统计结果
  const successCount = results.filter(r => r.success).length
  const failedDates = results.filter(r => !r.success).map(r => r.date)

  logger.info(`多天预计算完成`, {
    total: DAYS_TO_GENERATE,
    success: successCount,
    failed: failedDates.length,
    failedDates,
  })

  if (failedDates.length > 0) {
    logger.error(`有 ${failedDates.length} 天预计算失败: ${failedDates.join(', ')}`)
    process.exitCode = 1
  } else {
    logger.info(`所有 ${DAYS_TO_GENERATE} 天预计算数据生成成功`)
  }
}

// 如果脚本被直接执行，运行任务
if (process.argv[1]?.includes('force-precompute-multiple-days')) {
  forcePrecomputeMultipleDays().catch(err => {
    logger.error('多天预计算执行失败', err instanceof Error ? err : new Error(String(err)))
    process.exit(1)
  })
}