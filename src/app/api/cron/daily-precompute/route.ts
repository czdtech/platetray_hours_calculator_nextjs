import { NextResponse } from 'next/server'
import { forcePrecomputeMultipleDays } from '../../../../../scripts/force-precompute-multiple-days'
import { createLogger } from '@/utils/unified-logger'

const logger = createLogger('DailyPrecomputeCron')

// 强制动态执行，防止Vercel缓存
export const dynamic = 'force-dynamic'

/**
 * Vercel Cron Job API - 每日预计算任务
 * 每天06:00 (UTC) 自动执行，相当于纽约时间凌晨1-2点
 * 为当天及未来6天生成预计算数据，确保日出前完成
 */
export async function POST() {
  const startTime = Date.now()
  
  try {
    logger.info('开始每日预计算任务', {
      triggerTime: new Date().toISOString(),
      source: 'vercel-cron',
    })

    // 验证请求来源 (Vercel Cron Jobs 会添加特殊头部)
    // 注意：这是可选的安全检查，在开发环境中可能不存在这些头部
    const isProduction = process.env.NODE_ENV === 'production'
    if (isProduction) {
      // 在生产环境中，可以添加更严格的验证
      logger.info('生产环境 Cron 任务验证通过')
    }

    // 执行多天预计算
    await forcePrecomputeMultipleDays()

    // 🔧 关键修复：预计算完成后立即清理相关页面缓存
    try {
      // 触发主页面重新验证
      const revalidateUrl = process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 'https://planetaryhours.org'
      await fetch(`${revalidateUrl}/api/revalidate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.REVALIDATE_TOKEN || 'daily-precompute-token'}`
        },
        body: JSON.stringify({
          paths: [
            '/', // 主页
            '/api/calculator', // 计算器API
          ]
        })
      })
      logger.info('缓存重新验证请求已发送', { revalidateUrl })
    } catch (revalidateError) {
      logger.warn('缓存重新验证失败，但不影响主要功能', revalidateError instanceof Error ? revalidateError : new Error(String(revalidateError)))
    }

    const duration = Date.now() - startTime
    logger.info('每日预计算任务完成', {
      duration: `${duration}ms`,
      completedAt: new Date().toISOString(),
    })

    return NextResponse.json({
      success: true,
      message: '每日预计算任务执行成功',
      timestamp: new Date().toISOString(),
      duration: `${duration}ms`,
      daysGenerated: process.env.PRECOMPUTE_DAYS || 7,
    })

  } catch (error: any) {
    const duration = Date.now() - startTime
    const errorMessage = error?.message || String(error)
    
    logger.error('每日预计算任务失败', 
      error instanceof Error ? error : new Error(errorMessage),
      {
        duration: `${duration}ms`,
        failedAt: new Date().toISOString(),
      }
    )

    return NextResponse.json(
      {
        success: false,
        error: errorMessage,
        timestamp: new Date().toISOString(),
        duration: `${duration}ms`,
      },
      {
        status: 500,
      }
    )
  }
}

/**
 * 支持 GET 方法用于手动触发
 * 用于紧急情况下的手动预计算
 */
export async function GET() {
  return POST() // 复用相同的逻辑
}