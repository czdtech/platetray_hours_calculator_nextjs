import { NextResponse } from 'next/server'
import { forcePrecomputeToday } from '../../../../../scripts/force-precompute-today'
import { assertBearerToken, UnauthorizedError, jsonUnauthorizedResponse } from '@/utils/server/auth'

// 强制动态执行，防止Vercel缓存
export const dynamic = 'force-dynamic'

async function handle(request: Request) {
  try {
    assertBearerToken(request, 'CRON_SECRET')
  } catch (error) {
    if (error instanceof UnauthorizedError) {
      return jsonUnauthorizedResponse('未授权的Cron请求')
    }
    throw error
  }

  try {
    console.log('[Manual Trigger] 开始手动触发今日预计算数据生成')
    await forcePrecomputeToday()
    console.log('[Manual Trigger] 手动触发完成')
    return NextResponse.json({
      success: true,
      message: '今日预计算数据生成成功',
      timestamp: new Date().toISOString(),
    })
  } catch (error: unknown) {
    const err = error instanceof Error ? error : new Error(String(error))
    console.error('[Manual Trigger] 手动触发失败:', err)
    return NextResponse.json(
      {
        success: false,
        error: err.message,
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
  return handle(request)
}

export async function GET(request: Request) {
  return handle(request)
}
