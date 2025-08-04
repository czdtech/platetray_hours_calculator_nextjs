#!/usr/bin/env tsx
/*
  纽约行星时验证脚本
  用于验证预计算数据的正确性，如果数据缺失则进行补偿计算
*/

import { formatInTimeZone } from 'date-fns-tz'
import fs from 'fs/promises'
import path from 'path'
import { planetaryHoursCalculator } from '../src/services/PlanetaryHoursCalculator'
import { NY_TIMEZONE, getCurrentUTCDate } from '../src/utils/time'
import { kv } from '@vercel/kv'

const LATITUDE_NY = 40.7128
const LONGITUDE_NY = -74.006

async function readFromKV(key: string) {
  try {
    if (process.env.KV_REST_API_URL && process.env.KV_REST_API_TOKEN) {
      const data = await kv.get(key)
      if (data) {
        console.log(`[Success] 从KV存储读取: ${key}`)
        return data
      }
    }
  } catch (error) {
    console.error(`[Error] KV读取失败: ${key}`, error)
  }
  return null
}

async function readFromLocalFile(key: string) {
  try {
    const filePath = path.resolve(process.cwd(), 'public/precomputed', `${key}.json`)
    const content = await fs.readFile(filePath, 'utf-8')
    const data = JSON.parse(content)
    console.log(`[Success] 从本地文件读取: ${filePath}`)
    return data
  } catch (error) {
    if ((error as any)?.code === 'ENOENT') {
      console.log(`[Info] 本地文件不存在: ${key}`)
    } else {
      console.error(`[Error] 本地文件读取失败: ${key}`, error)
    }
  }
  return null
}

async function writeToLocalFile(key: string, json: string) {
  const destDir = path.resolve(process.cwd(), 'public/precomputed')
  await fs.mkdir(destDir, { recursive: true })
  const destPath = path.join(destDir, `${key}.json`)
  await fs.writeFile(destPath, json, 'utf-8')
  console.log(`[Success] 补偿写入本地文件: ${destPath}`)
}

async function writeToKV(key: string, data: any) {
  try {
    if (process.env.KV_REST_API_URL && process.env.KV_REST_API_TOKEN) {
      await kv.set(key, data, { ex: 60 * 60 * 24 * 7 }) // 7天过期
      console.log(`[Success] 补偿写入KV存储: ${key}`)
      return true
    }
  } catch (error) {
    console.error(`[Error] KV补偿写入失败: ${key}`, error)
    return false
  }
  return false
}

export async function verifyTask() {
  const nowUTC = getCurrentUTCDate()
  const dateStr = formatInTimeZone(nowUTC, NY_TIMEZONE, 'yyyy-MM-dd')
  const cacheKey = `ny-${dateStr}`

  console.log(`[Start] 开始验证纽约预计算数据: ${dateStr}`)

  // 尝试从KV存储读取
  let data = await readFromKV(cacheKey)
  
  // 如果KV中没有，尝试从本地文件读取
  if (!data) {
    data = await readFromLocalFile(cacheKey)
  }

  // 如果都没有找到数据，进行补偿计算
  if (!data) {
    console.log(`[Warning] 未找到预计算数据，开始补偿计算: ${cacheKey}`)
    
    try {
      const calcResult = await planetaryHoursCalculator.calculate(
        nowUTC,
        LATITUDE_NY,
        LONGITUDE_NY,
        NY_TIMEZONE
      )

      if (!calcResult) {
        throw new Error('补偿计算结果为空')
      }

      console.log(`[Success] 补偿计算完成`)
      console.log(`[Info] requestedDate: ${calcResult.requestedDate}`)
      console.log(`[Info] sunrise: ${calcResult.sunrise?.toISOString()}`)
      console.log(`[Info] sunset: ${calcResult.sunset?.toISOString()}`)
      console.log(`[Info] 行星时数量: ${calcResult.planetaryHours?.length || 0}`)

      const json = JSON.stringify(calcResult)

      // 优先写入KV存储
      const kvSuccess = await writeToKV(cacheKey, calcResult)
      
      // 回退到本地文件
      if (!kvSuccess) {
        await writeToLocalFile(cacheKey, json)
      }

      console.log(`[Complete] 补偿计算并存储完成: ${cacheKey}`)
      return calcResult
    } catch (error) {
      console.error(`[Error] 补偿计算失败`, error)
      throw error
    }
  } else {
    console.log(`[Success] 验证通过，数据存在: ${cacheKey}`)
    return data
  }
}

// 如果脚本被直接执行，运行任务
if (process.argv[1]?.includes('verify-newyork')) {
  verifyTask().catch(err => {
    console.error('[Fatal]', err)
    process.exit(1)
  })
}