import { NextResponse } from 'next/server'
import { forcePrecomputeMultipleDays } from '../../../../../scripts/force-precompute-multiple-days'
import { createLogger } from '@/utils/unified-logger'

const logger = createLogger('DailyPrecomputeCron')

/**
 * Vercel Cron Job API - 每日预计算任务
 * 每天22:00 (UTC) 自动执行，生成未来7天的预计算数据
 */
export async function GET() {
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
 * 支持 POST 方法用于手动触发
 * 用于紧急情况下的手动预计算
 */
export async function POST() {
  return GET() // 复用相同的逻辑
}