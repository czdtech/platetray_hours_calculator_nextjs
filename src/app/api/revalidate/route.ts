import { NextRequest, NextResponse } from 'next/server'
import { revalidatePath } from 'next/cache'
import { createLogger } from '@/utils/unified-logger'

const logger = createLogger('RevalidateAPI')

// 强制动态执行，防止Vercel缓存
export const dynamic = 'force-dynamic'

/**
 * ISR缓存重新验证API
 * 用于在数据更新后立即清理页面缓存
 */
export async function POST(request: NextRequest) {
  try {
    // 验证授权token
    const authHeader = request.headers.get('authorization')
    const token = authHeader?.replace('Bearer ', '')
    
    // 简单token验证（生产环境应使用更安全的方式）
    if (!token || !['daily-precompute-token', process.env.REVALIDATE_TOKEN].includes(token)) {
      logger.warn('缓存重新验证请求授权失败', { 
        hasToken: !!token,
        userAgent: request.headers.get('user-agent')
      })
      
      return NextResponse.json(
        { error: '未授权访问' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { paths } = body

    if (!Array.isArray(paths)) {
      return NextResponse.json(
        { error: 'paths必须是数组' },
        { status: 400 }
      )
    }

    // 执行缓存重新验证
    const revalidatedPaths: string[] = []
    const errors: { path: string; error: string }[] = []

    for (const path of paths) {
      try {
        revalidatePath(path)
        revalidatedPaths.push(path)
        logger.info(`页面缓存已重新验证: ${path}`)
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error)
        errors.push({ path, error: errorMessage })
        logger.error(`页面缓存重新验证失败: ${path}`, error instanceof Error ? error : new Error(errorMessage))
      }
    }

    logger.info('缓存重新验证完成', {
      revalidatedCount: revalidatedPaths.length,
      errorCount: errors.length,
      revalidatedPaths,
      errors
    })

    return NextResponse.json({
      success: true,
      message: '缓存重新验证完成',
      revalidatedPaths,
      errors,
      timestamp: new Date().toISOString()
    })

  } catch (error) {
    logger.error('缓存重新验证API执行失败', error instanceof Error ? error : new Error(String(error)))
    
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : String(error),
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    )
  }
}

/**
 * 支持GET方法查看API状态
 */
export async function GET() {
  return NextResponse.json({
    service: 'ISR缓存重新验证API',
    method: 'POST',
    description: '用于在数据更新后立即清理页面缓存',
    usage: {
      method: 'POST',
      headers: {
        'Authorization': 'Bearer <token>',
        'Content-Type': 'application/json'
      },
      body: {
        paths: ['/', '/api/calculator']
      }
    },
    timestamp: new Date().toISOString()
  })
}