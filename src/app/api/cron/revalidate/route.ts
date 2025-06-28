import { revalidatePath } from "next/cache";
import { createLogger } from '@/utils/unified-logger';

const logger = createLogger('CronRevalidate');

export const runtime = "nodejs";

export async function GET() {
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
