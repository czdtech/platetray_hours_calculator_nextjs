import { revalidatePath } from 'next/cache'
import { createLogger } from '@/utils/unified-logger'
import { assertBearerToken, UnauthorizedError, jsonUnauthorizedResponse } from '@/utils/server/auth'

const logger = createLogger('CronRevalidate')

export const runtime = 'nodejs'
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
    await revalidatePath('/')
    return new Response('Revalidated /', {
      status: 200,
      headers: { 'content-type': 'text/plain; charset=utf-8' },
    })
  } catch (error) {
    logger.error('Revalidate cron failed', error as Error)
    return new Response('Error revalidating', {
      status: 500,
      headers: { 'content-type': 'text/plain; charset=utf-8' },
    })
  }
}

export async function POST(request: Request) {
  return handle(request)
}

export async function GET(request: Request) {
  return handle(request)
}
