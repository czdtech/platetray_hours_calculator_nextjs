import { NextResponse } from 'next/server'
import { forcePrecomputeToday } from '../../../../../scripts/force-precompute-today'

export async function GET() {
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
    console.error('[Manual Trigger] 手动触发失败:', error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : String(error),
        timestamp: new Date().toISOString(),
      },
      {
        status: 500,
      }
    )
  }
}
