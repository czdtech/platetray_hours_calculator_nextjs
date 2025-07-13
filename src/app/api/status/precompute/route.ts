import { NextResponse } from 'next/server'
import { formatInTimeZone } from 'date-fns-tz'
import { addDays } from 'date-fns'
import { getCurrentUTCDate, NY_TIMEZONE } from '@/utils/time'
import { createLogger } from '@/utils/unified-logger'
import fs from 'fs/promises'
import path from 'path'

const logger = createLogger('PrecomputeStatus')

export const runtime = "nodejs";

interface PrecomputeFileStatus {
  date: string
  key: string
  exists: boolean
  fileSize?: number
  lastModified?: string
  isValid?: boolean
  error?: string
  hoursCount?: number
  requestedDate?: string
}

async function checkPrecomputeFile(date: Date): Promise<PrecomputeFileStatus> {
  const dateStr = formatInTimeZone(date, NY_TIMEZONE, 'yyyy-MM-dd')
  const key = `ny-${dateStr}`
  const filePath = path.join(process.cwd(), 'public', 'precomputed', `${key}.json`)
  
  const status: PrecomputeFileStatus = {
    date: dateStr,
    key,
    exists: false
  }
  
  try {
    // 检查文件是否存在
    const stats = await fs.stat(filePath)
    status.exists = true
    status.fileSize = stats.size
    status.lastModified = stats.mtime.toISOString()
    
    // 尝试解析文件内容
    const content = await fs.readFile(filePath, 'utf-8')
    const data = JSON.parse(content)
    
    // 验证数据结构
    if (data.requestedDate && data.planetaryHours) {
      status.isValid = true
      status.hoursCount = data.planetaryHours.length
      status.requestedDate = data.requestedDate
      
      // 检查日期是否匹配
      if (data.requestedDate !== dateStr) {
        status.isValid = false
        status.error = `日期不匹配: 文件内容为 ${data.requestedDate}, 期望 ${dateStr}`
      }
      
      // 检查行星时数量
      if (data.planetaryHours.length !== 24) {
        status.isValid = false
        status.error = `行星时数量异常: ${data.planetaryHours.length}, 期望 24`
      }
    } else {
      status.isValid = false
      status.error = '文件格式无效'
    }
    
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === 'ENOENT') {
      // 文件不存在
      status.exists = false
    } else {
      // 其他错误（读取失败、解析失败等）
      status.exists = true
      status.isValid = false
      status.error = error instanceof Error ? error.message : String(error)
    }
  }
  
  return status
}

export async function GET(request: Request) {
  try {
    const url = new URL(request.url)
    const daysParam = url.searchParams.get('days')
    const days = daysParam ? parseInt(daysParam) : 7
    
    if (days < 1 || days > 30) {
      return NextResponse.json({
        error: 'days 参数必须在 1-30 之间'
      }, { status: 400 })
    }
    
    logger.info(`检查预计算文件状态`, { days })
    
    const now = getCurrentUTCDate()
    const statuses: PrecomputeFileStatus[] = []
    
    // 检查从今天开始的指定天数
    for (let i = 0; i < days; i++) {
      const targetDate = addDays(now, i)
      const status = await checkPrecomputeFile(targetDate)
      statuses.push(status)
    }
    
    // 统计信息
    const totalFiles = statuses.length
    const existingFiles = statuses.filter(s => s.exists).length
    const validFiles = statuses.filter(s => s.isValid).length
    const invalidFiles = statuses.filter(s => s.exists && !s.isValid).length
    const missingFiles = statuses.filter(s => !s.exists).length
    
    const summary = {
      totalFiles,
      existingFiles,
      validFiles,
      invalidFiles,
      missingFiles,
      healthScore: totalFiles > 0 ? Math.round((validFiles / totalFiles) * 100) : 0
    }
    
    // 服务端时区信息
    const serverInfo = {
      serverTime: now.toISOString(),
      nyTime: formatInTimeZone(now, NY_TIMEZONE, 'yyyy-MM-dd HH:mm:ss zzz'),
      timezone: NY_TIMEZONE,
      nodeEnv: process.env.NODE_ENV
    }
    
    logger.info(`预计算文件状态检查完成`, summary)
    
    return NextResponse.json({
      success: true,
      summary,
      serverInfo,
      files: statuses,
      checkTime: new Date().toISOString()
    })
    
  } catch (error) {
    logger.error('预计算文件状态检查失败', error as Error)
    
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : String(error),
      checkTime: new Date().toISOString()
    }, { status: 500 })
  }
}