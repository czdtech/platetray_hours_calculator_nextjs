#!/usr/bin/env tsx
/*
  强制生成多个热门城市的行星时预计算数据
  用于紧急修复线上数据不一致问题
*/

import { formatInTimeZone } from 'date-fns-tz'
import fs from 'fs/promises'
import path from 'path'
import { planetaryHoursCalculator } from '../src/services/PlanetaryHoursCalculator'
import { getCurrentUTCDate } from '../src/utils/time'
import { kv } from '@vercel/kv'

// 热门城市配置
const CITIES = [
  {
    name: 'ny', // 纽约
    latitude: 40.7128,
    longitude: -74.006,
    timezone: 'America/New_York'
  },
  {
    name: 'sydney', // 悉尼
    latitude: -33.8688,
    longitude: 151.2093,
    timezone: 'Australia/Sydney'
  },
  {
    name: 'london', // 伦敦
    latitude: 51.5074,
    longitude: -0.1278,
    timezone: 'Europe/London'
  },
  {
    name: 'dubai', // 迪拜
    latitude: 25.2048,
    longitude: 55.2708,
    timezone: 'Asia/Dubai'
  }
]

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
  console.log(`[Start] 强制生成多个热门城市的预计算数据`)
  console.log(`[Info] 当前UTC时间: ${nowUTC.toISOString()}`)

  for (const city of CITIES) {
    console.log(`\n[Process] 开始处理城市: ${city.name}`)
    
    // 计算该城市的今日日期
    const todayStr = formatInTimeZone(nowUTC, city.timezone, 'yyyy-MM-dd')
    console.log(`[Info] ${city.name} 今日日期: ${todayStr}`)

    const cacheKey = `${city.name}-${todayStr}`

    console.log(`[Process] 开始计算 ${city.name} 今日行星时数据...`)
    const calcResult = await planetaryHoursCalculator.calculate(
      nowUTC,
      city.latitude,
      city.longitude,
      city.timezone
    )

    if (!calcResult) {
      console.error(`[Error] ${city.name} 计算结果为空，生成失败`)
      continue
    }

    console.log(`[Success] ${city.name} 计算完成`)
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

    console.log(`[Complete] ${city.name} 预计算数据生成完成: ${cacheKey}${kvSuccess ? ' (KV存储)' : ' (本地文件)'}`)
  }

  console.log(`\n[All Complete] 所有热门城市预计算数据生成完成`)
}

// 如果脚本被直接执行，运行任务
if (process.argv[1]?.includes('force-precompute-today')) {
  forcePrecomputeToday().catch(err => {
    console.error('[Fatal]', err)
    process.exit(1)
  })
}
