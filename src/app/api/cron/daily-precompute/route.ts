import { NextResponse } from 'next/server'
import { forcePrecomputeMultipleDays } from '../../../../../scripts/force-precompute-multiple-days'
import { createLogger } from '@/utils/unified-logger'
import { assertBearerToken, UnauthorizedError, jsonUnauthorizedResponse } from '@/utils/server/auth'

const logger = createLogger('DailyPrecomputeCron')

// 强制动态执行，防止Vercel缓存
export const dynamic = 'force-dynamic'

async function handleRequest(request: Request) {
  try {
    assertBearerToken(request, 'CRON_SECRET')
  } catch (error) {
    if (error instanceof UnauthorizedError) {
      return jsonUnauthorizedResponse('未授权的Cron请求')
    }
    throw error
  }

  const startTime = Date.now()

  try {
    logger.info('开始每日预计算任务', {
      triggerTime: new Date().toISOString(),
      source: 'vercel-cron',
    })

    await forcePrecomputeMultipleDays()

    const revalidateToken = process.env.REVALIDATE_TOKEN
    if (!revalidateToken) {
      logger.warn('缺少 REVALIDATE_TOKEN，跳过缓存重新验证')
    } else {
      const revalidateHost = process.env.VERCEL_URL ?? 'planetaryhours.org'
      const triggerUrl = 'https://' + revalidateHost + '/api/revalidate'
      try {
        await fetch(triggerUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: 'Bearer ' + revalidateToken,
          },
          body: JSON.stringify({ paths: ['/', '/api/calculator'] }),
        })
        logger.info('缓存重新验证请求已发送', { triggerUrl })
      } catch (revalidateError) {
        logger.warn(
          '缓存重新验证失败，但不影响主要功能',
          revalidateError instanceof Error ? revalidateError : new Error(String(revalidateError))
        )
      }
    }

    const duration = Date.now() - startTime
    logger.info('每日预计算任务完成', {
      duration: duration + 'ms',
      completedAt: new Date().toISOString(),
    })

    return NextResponse.json({
      success: true,
      message: '每日预计算任务执行成功',
      timestamp: new Date().toISOString(),
      duration: duration + 'ms',
      daysGenerated: process.env.PRECOMPUTE_DAYS || 7,
    })
  } catch (error: unknown) {
    const duration = Date.now() - startTime
    const err = error instanceof Error ? error : new Error(String(error))

    logger.error(
      '每日预计算任务失败',
      err,
      {
        duration: duration + 'ms',
        failedAt: new Date().toISOString(),
      }
    )

    return NextResponse.json(
      {
        success: false,
        error: err.message,
        timestamp: new Date().toISOString(),
        duration: duration + 'ms',
      },
      {
        status: 500,
      }
    )
  }
}

export async function POST(request: Request) {
  return handleRequest(request)
}

export async function GET(request: Request) {
  return handleRequest(request)
}
