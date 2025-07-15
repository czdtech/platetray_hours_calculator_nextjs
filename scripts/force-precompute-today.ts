#!/usr/bin/env tsx
/*
  强制生成今日纽约行星时预计算数据
  用于紧急修复线上数据不一致问题
*/

import { formatInTimeZone } from 'date-fns-tz'
import fs from 'fs/promises'
import path from 'path'
import { planetaryHoursCalculator } from '../src/services/PlanetaryHoursCalculator'
import { NY_TIMEZONE, getCurrentUTCDate } from '../src/utils/time'
import { kv } from '@vercel/kv'

const LATITUDE_NY = 40.7128
const LONGITUDE_NY = -74.006

async function writeToKV(key: string, data: any) {
  try {
    if (process.env.KV_REST_API_URL && process.env.KV_REST_API_TOKEN) {
      await kv.set(key, data, { ex: 60 * 60 * 24 * 7 }) // 7天过期
      console.log(`[Success] 已写入KV存储: ${key}`)
      return true
    }
  } catch (error) {
    console.error(`[Error] KV写入失败: ${key}`, error)
    return false
  }
  return false
}

async function writeToLocalFile(key: string, json: string) {
  try {
    const destDir = path.resolve(process.cwd(), 'public/precomputed')
    await fs.mkdir(destDir, { recursive: true })
    const destPath = path.join(destDir, `${key}.json`)
    await fs.writeFile(destPath, json, 'utf-8')
    console.log(`[Success] 已写入本地文件: ${destPath}`)
    return true
  } catch (error) {
    console.error(`[Error] 本地文件写入失败: ${key}`, error)
    return false
  }
}

export async function forcePrecomputeToday() {
  const nowUTC = getCurrentUTCDate()
  console.log(`[Start] 强制生成今日预计算数据`)
  console.log(`[Info] 当前UTC时间: ${nowUTC.toISOString()}`)

  // 计算今天的纽约日期
  const todayStr = formatInTimeZone(nowUTC, NY_TIMEZONE, 'yyyy-MM-dd')
  console.log(`[Info] 纽约今日日期: ${todayStr}`)

  const cacheKey = `ny-${todayStr}`

  console.log(`[Process] 开始计算今日行星时数据...`)
  const calcResult = await planetaryHoursCalculator.calculate(
    nowUTC,
    LATITUDE_NY,
    LONGITUDE_NY,
    NY_TIMEZONE
  )

  if (!calcResult) {
    console.error('[Error] 计算结果为空，生成失败')
    process.exitCode = 1
    return
  }

  console.log(`[Success] 计算完成`)
  console.log(`[Info] requestedDate: ${calcResult.requestedDate}`)
  console.log(`[Info] sunrise: ${calcResult.sunrise?.toISOString()}`)
  console.log(`[Info] sunset: ${calcResult.sunset?.toISOString()}`)
  console.log(`[Info] 行星时数量: ${calcResult.planetaryHours?.length || 0}`)

  const json = JSON.stringify(calcResult)

  // 优先写入KV存储（生产环境）
  const kvSuccess = await writeToKV(cacheKey, calcResult)
  
  // 回退到本地文件（开发环境）
  if (!kvSuccess) {
    await writeToLocalFile(cacheKey, json)
  }

  console.log(`[Complete] 今日预计算数据生成完成: ${cacheKey}${kvSuccess ? ' (KV存储)' : ' (本地文件)'}`)
}

// 如果脚本被直接执行，运行任务
if (process.argv[1]?.includes('force-precompute-today')) {
  forcePrecomputeToday().catch(err => {
    console.error('[Fatal]', err)
    process.exit(1)
  })
}
