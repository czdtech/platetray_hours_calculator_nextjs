#!/usr/bin/env tsx
/*
  强制生成多天纽约行星时预计算数据
  支持生成今天及未来指定天数的数据
*/

import { formatInTimeZone } from 'date-fns-tz'
import { addDays } from 'date-fns'
import fs from 'fs/promises'
import path from 'path'
import { planetaryHoursCalculator } from '../src/services/PlanetaryHoursCalculator'
import { NY_TIMEZONE, getCurrentUTCDate } from '../src/utils/time'

const LATITUDE_NY = 40.7128
const LONGITUDE_NY = -74.006

// 从环境变量或命令行参数获取天数，默认7天
const DAYS_TO_GENERATE = parseInt(process.env.DAYS_COUNT || '7')

async function writeToLocalFile(key: string, json: string) {
  const destDir = path.resolve(__dirname, '../public/precomputed')
  await fs.mkdir(destDir, { recursive: true })
  const destPath = path.join(destDir, `${key}.json`)
  await fs.writeFile(destPath, json, 'utf-8')
  console.log(`[Success] 已写入本地文件: ${key}.json`)
}

async function generateForDate(date: Date, index: number): Promise<{success: boolean, key: string, error?: string}> {
  try {
    const dateStr = formatInTimeZone(date, NY_TIMEZONE, 'yyyy-MM-dd')
    const cacheKey = `ny-${dateStr}`
    
    console.log(`[${index + 1}/${DAYS_TO_GENERATE}] 开始计算 ${dateStr} 的行星时数据...`)
    
    const calcResult = await planetaryHoursCalculator.calculate(
      date,
      LATITUDE_NY,
      LONGITUDE_NY,
      NY_TIMEZONE
    )

    if (!calcResult) {
      throw new Error(`计算结果为空: ${dateStr}`)
    }

    // 验证数据完整性
    if (!calcResult.planetaryHours || calcResult.planetaryHours.length !== 24) {
      throw new Error(`行星时数据不完整: ${dateStr}, 获得 ${calcResult.planetaryHours?.length || 0} 个小时`)
    }

    console.log(`[Info] ${dateStr} - sunrise: ${calcResult.sunrise?.toISOString()}`)
    console.log(`[Info] ${dateStr} - sunset: ${calcResult.sunset?.toISOString()}`)
    console.log(`[Info] ${dateStr} - 行星时数量: ${calcResult.planetaryHours.length}`)

    const json = JSON.stringify(calcResult)
    await writeToLocalFile(cacheKey, json)

    console.log(`[Success] ${dateStr} 预计算数据生成完成`)
    return { success: true, key: cacheKey }
    
  } catch (error) {
    const dateStr = formatInTimeZone(date, NY_TIMEZONE, 'yyyy-MM-dd')
    console.error(`[Error] ${dateStr} 生成失败:`, error)
    return { 
      success: false, 
      key: `ny-${dateStr}`, 
      error: error instanceof Error ? error.message : String(error)
    }
  }
}

export async function forcePrecomputeMultipleDays(daysCount: number = DAYS_TO_GENERATE) {
  const startTime = Date.now()
  const nowUTC = getCurrentUTCDate()
  
  console.log(`[Start] 强制生成多天预计算数据`)
  console.log(`[Info] 当前UTC时间: ${nowUTC.toISOString()}`)
  console.log(`[Info] 将生成 ${daysCount} 天的数据`)
  
  const results = []
  
  // 从今天开始生成指定天数的数据
  for (let i = 0; i < daysCount; i++) {
    const targetDate = addDays(nowUTC, i)
    const result = await generateForDate(targetDate, i)
    results.push(result)
  }
  
  // 统计结果
  const successCount = results.filter(r => r.success).length
  const failureCount = results.filter(r => !r.success).length
  const duration = Date.now() - startTime
  
  console.log(`\n[Summary] 预计算任务完成`)
  console.log(`[Info] 总文件数: ${results.length}`)
  console.log(`[Info] 成功: ${successCount}`)
  console.log(`[Info] 失败: ${failureCount}`)
  console.log(`[Info] 耗时: ${duration}ms`)
  
  if (failureCount > 0) {
    console.log(`\n[Failures] 失败的文件:`)
    results.filter(r => !r.success).forEach(r => {
      console.log(`  - ${r.key}: ${r.error}`)
    })
  }
  
  if (failureCount === 0) {
    console.log(`[Complete] 所有预计算数据生成成功！`)
  } else {
    console.error(`[Warning] 有 ${failureCount} 个文件生成失败`)
    process.exitCode = 1
  }
}

// 兼容原有的今日生成函数
export async function forcePrecomputeToday() {
  return forcePrecomputeMultipleDays(1)
}

// 如果脚本被直接执行，运行任务
if (process.argv[1]?.includes('force-precompute-multiple-days')) {
  forcePrecomputeMultipleDays().catch(err => {
    console.error('[Fatal]', err)
    process.exit(1)
  })
}