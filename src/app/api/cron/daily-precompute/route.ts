import { NextResponse } from 'next/server'
import { formatInTimeZone } from 'date-fns-tz'
import { addDays } from 'date-fns'
import { getCurrentUTCDate, NY_TIMEZONE } from '@/utils/time'
import { planetaryHoursCalculator } from '@/services/PlanetaryHoursCalculator'
import { createLogger } from '@/utils/unified-logger'
import fs from 'fs/promises'
import path from 'path'

const logger = createLogger('DailyPrecompute')

// 纽约坐标常量
const LATITUDE_NY = 40.7128
const LONGITUDE_NY = -74.006

// 预计算未来的天数
const PRECOMPUTE_DAYS_AHEAD = 7

export const runtime = "nodejs";

async function ensureDirectoryExists(dirPath: string) {
  try {
    await fs.access(dirPath)
  } catch {
    await fs.mkdir(dirPath, { recursive: true })
  }
}

async function writePrecomputedFile(key: string, data: unknown) {
  const publicDir = path.resolve(process.cwd(), 'public')
  const precomputedDir = path.join(publicDir, 'precomputed')
  
  await ensureDirectoryExists(precomputedDir)
  
  const filePath = path.join(precomputedDir, `${key}.json`)
  const jsonString = JSON.stringify(data)
  
  await fs.writeFile(filePath, jsonString, 'utf-8')
  logger.info(`预计算文件已保存: ${key}.json`)
  
  return filePath
}

async function generatePrecomputeForDate(date: Date): Promise<{key: string, success: boolean, error?: string}> {
  try {
    const dateStr = formatInTimeZone(date, NY_TIMEZONE, 'yyyy-MM-dd')
    const cacheKey = `ny-${dateStr}`
    
    logger.info(`开始计算 ${dateStr} 的行星时数据`)
    
    const calcResult = await planetaryHoursCalculator.calculate(
      date,
      LATITUDE_NY,
      LONGITUDE_NY,
      NY_TIMEZONE
    )
    
    if (!calcResult) {
      throw new Error(`计算结果为空: ${dateStr}`)
    }
    
    // 验证计算结果的完整性
    if (!calcResult.planetaryHours || calcResult.planetaryHours.length !== 24) {
      throw new Error(`行星时数据不完整: ${dateStr}, 获得 ${calcResult.planetaryHours?.length || 0} 个小时`)
    }
    
    await writePrecomputedFile(cacheKey, calcResult)
    
    logger.info(`成功生成 ${dateStr} 的预计算数据`, {
      requestedDate: calcResult.requestedDate,
      hoursCount: calcResult.planetaryHours.length,
      sunrise: calcResult.sunrise?.toISOString(),
      sunset: calcResult.sunset?.toISOString()
    })
    
    return { key: cacheKey, success: true }
    
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error)
    logger.error(`生成预计算数据失败`, error as Error)
    return { 
      key: formatInTimeZone(date, NY_TIMEZONE, 'yyyy-MM-dd'), 
      success: false, 
      error: errorMessage 
    }
  }
}

export async function GET() {
  const startTime = Date.now()
  logger.info(`开始每日预计算任务`)
  
  try {
    const now = getCurrentUTCDate()
    const results = []
    
    // 从今天开始，生成未来 PRECOMPUTE_DAYS_AHEAD 天的数据
    for (let i = 0; i < PRECOMPUTE_DAYS_AHEAD; i++) {
      const targetDate = addDays(now, i)
      const result = await generatePrecomputeForDate(targetDate)
      results.push(result)
    }
    
    // 统计结果
    const successCount = results.filter(r => r.success).length
    const failureCount = results.filter(r => !r.success).length
    const duration = Date.now() - startTime
    
    logger.info(`每日预计算任务完成`, {
      totalFiles: results.length,
      successCount,
      failureCount,
      durationMs: duration
    })
    
    if (failureCount === 0) {
      return NextResponse.json({
        success: true,
        message: `成功生成 ${successCount} 个预计算文件`,
        results: results,
        duration: `${duration}ms`,
        timestamp: new Date().toISOString()
      })
    } else {
      // 部分失败
      return NextResponse.json({
        success: false,
        message: `部分成功: ${successCount} 成功, ${failureCount} 失败`,
        results: results,
        duration: `${duration}ms`,
        timestamp: new Date().toISOString()
      }, { status: 207 }) // 207 Multi-Status
    }
    
  } catch (error) {
    const duration = Date.now() - startTime
    logger.error(`每日预计算任务失败`, error as Error)
    
    return NextResponse.json({
      success: false,
      message: '每日预计算任务失败',
      error: error instanceof Error ? error.message : String(error),
      duration: `${duration}ms`,
      timestamp: new Date().toISOString()
    }, { status: 500 })
  }
}