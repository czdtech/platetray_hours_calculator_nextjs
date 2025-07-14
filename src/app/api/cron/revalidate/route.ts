import { revalidatePath } from "next/cache";
import { createLogger } from '@/utils/unified-logger';

const logger = createLogger('CronRevalidate');

export const runtime = "nodejs";
// 强制动态执行，防止Vercel缓存
export const dynamic = 'force-dynamic';

export async function POST() {
  try {
    // 手动失效首页缓存，让下一次访问重新生成
    await revalidatePath("/");

    return new Response("Revalidated /", {
      status: 200,
      headers: {
        "content-type": "text/plain; charset=utf-8",
      },
    });
  } catch (error) {
    logger.error("Revalidate cron failed", error as Error);
    return new Response("Error revalidating", {
      status: 500,
      headers: {
        "content-type": "text/plain; charset=utf-8",
      },
    });
  }
}

/**
 * 支持 GET 方法用于手动触发
 */
export async function GET() {
  return POST() // 复用相同的逻辑
}
