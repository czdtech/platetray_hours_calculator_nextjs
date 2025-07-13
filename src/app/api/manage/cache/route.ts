import { NextResponse } from 'next/server'
import { revalidatePath } from 'next/cache'
import { createLogger } from '@/utils/unified-logger'
import fs from 'fs/promises'
import path from 'path'

const logger = createLogger('CacheManagement')

export const runtime = "nodejs";

interface CacheOperationResult {
  operation: string
  success: boolean
  message: string
  details?: Record<string, unknown>
  error?: string
}

async function clearPrecomputedFiles(): Promise<CacheOperationResult> {
  try {
    const precomputedDir = path.join(process.cwd(), 'public', 'precomputed')
    
    // 检查目录是否存在
    try {
      await fs.access(precomputedDir)
    } catch {
      return {
        operation: 'clear_precomputed',
        success: true,
        message: '预计算目录不存在，无需清理'
      }
    }
    
    // 读取目录内容
    const files = await fs.readdir(precomputedDir)
    const jsonFiles = files.filter(file => file.endsWith('.json'))
    
    if (jsonFiles.length === 0) {
      return {
        operation: 'clear_precomputed',
        success: true,
        message: '预计算目录为空，无需清理',
        details: { filesFound: 0 }
      }
    }
    
    // 删除所有 JSON 文件
    const deleteResults = await Promise.allSettled(
      jsonFiles.map(file => fs.unlink(path.join(precomputedDir, file)))
    )
    
    const successCount = deleteResults.filter(r => r.status === 'fulfilled').length
    const failureCount = deleteResults.filter(r => r.status === 'rejected').length
    
    return {
      operation: 'clear_precomputed',
      success: failureCount === 0,
      message: `清理预计算文件完成: ${successCount} 成功, ${failureCount} 失败`,
      details: {
        totalFiles: jsonFiles.length,
        successCount,
        failureCount,
        deletedFiles: jsonFiles
      }
    }
    
  } catch (error) {
    return {
      operation: 'clear_precomputed',
      success: false,
      message: '清理预计算文件失败',
      error: error instanceof Error ? error.message : String(error)
    }
  }
}

async function clearNextJSCache(): Promise<CacheOperationResult> {
  try {
    // 清理主页和相关路径的缓存
    const pathsToRevalidate = [
      '/',
      '/api/status/precompute',
      '/api/cron/daily-precompute',
      '/debug'
    ]
    
    for (const path of pathsToRevalidate) {
      await revalidatePath(path)
    }
    
    return {
      operation: 'clear_nextjs_cache',
      success: true,
      message: `已清理 Next.js 缓存`,
      details: {
        revalidatedPaths: pathsToRevalidate
      }
    }
    
  } catch (error) {
    return {
      operation: 'clear_nextjs_cache',
      success: false,
      message: '清理 Next.js 缓存失败',
      error: error instanceof Error ? error.message : String(error)
    }
  }
}

async function triggerDataRegeneration(_days: number = 7): Promise<CacheOperationResult> {
  try {
    // 调用每日预计算 API
    const baseUrl = process.env.VERCEL_URL 
      ? `https://${process.env.VERCEL_URL}` 
      : 'http://localhost:3000'
    
    const response = await fetch(`${baseUrl}/api/cron/daily-precompute`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'Cache-Management/1.0'
      }
    })
    
    const result = await response.json()
    
    return {
      operation: 'regenerate_data',
      success: response.ok,
      message: result.message || `数据重新生成${response.ok ? '成功' : '失败'}`,
      details: {
        statusCode: response.status,
        apiResponse: result
      }
    }
    
  } catch (error) {
    return {
      operation: 'regenerate_data',
      success: false,
      message: '触发数据重新生成失败',
      error: error instanceof Error ? error.message : String(error)
    }
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { operations = [], clearPrecomputed = false, clearCache = false, regenerateData = false, days = 7 } = body
    
    logger.info('开始缓存管理操作', { 
      operations, 
      clearPrecomputed, 
      clearCache, 
      regenerateData, 
      days 
    })
    
    const results: CacheOperationResult[] = []
    
    // 执行指定的操作
    const operationsToExecute = operations.length > 0 
      ? operations 
      : [
          ...(clearPrecomputed ? ['clear_precomputed'] : []),
          ...(clearCache ? ['clear_nextjs_cache'] : []),
          ...(regenerateData ? ['regenerate_data'] : [])
        ]
    
    if (operationsToExecute.length === 0) {
      return NextResponse.json({
        success: false,
        message: '未指定任何操作',
        availableOperations: ['clear_precomputed', 'clear_nextjs_cache', 'regenerate_data']
      }, { status: 400 })
    }
    
    // 按顺序执行操作
    for (const operation of operationsToExecute) {
      switch (operation) {
        case 'clear_precomputed':
          results.push(await clearPrecomputedFiles())
          break
        case 'clear_nextjs_cache':
          results.push(await clearNextJSCache())
          break
        case 'regenerate_data':
          results.push(await triggerDataRegeneration(days))
          break
        default:
          results.push({
            operation,
            success: false,
            message: `未知操作: ${operation}`
          })
      }
    }
    
    // 统计结果
    const successCount = results.filter(r => r.success).length
    const failureCount = results.filter(r => !r.success).length
    const allSuccess = failureCount === 0
    
    logger.info('缓存管理操作完成', {
      totalOperations: results.length,
      successCount,
      failureCount,
      allSuccess
    })
    
    return NextResponse.json({
      success: allSuccess,
      message: `缓存管理操作完成: ${successCount} 成功, ${failureCount} 失败`,
      results,
      summary: {
        totalOperations: results.length,
        successCount,
        failureCount
      },
      timestamp: new Date().toISOString()
    }, { status: allSuccess ? 200 : 207 })
    
  } catch (error) {
    logger.error('缓存管理操作失败', error as Error)
    
    return NextResponse.json({
      success: false,
      message: '缓存管理操作失败',
      error: error instanceof Error ? error.message : String(error),
      timestamp: new Date().toISOString()
    }, { status: 500 })
  }
}

// 支持 GET 请求查看可用操作
export async function GET() {
  return NextResponse.json({
    message: '缓存管理接口',
    availableOperations: {
      clear_precomputed: '清理预计算文件',
      clear_nextjs_cache: '清理 Next.js 缓存',
      regenerate_data: '重新生成数据'
    },
    usage: {
      endpoint: '/api/manage/cache',
      method: 'POST',
      body: {
        operations: ['clear_precomputed', 'clear_nextjs_cache', 'regenerate_data'],
        // 或者使用简化方式:
        clearPrecomputed: true,
        clearCache: true,
        regenerateData: true,
        days: 7
      }
    },
    timestamp: new Date().toISOString()
  })
}