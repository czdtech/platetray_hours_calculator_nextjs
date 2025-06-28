import { NextResponse } from 'next/server';
import { precomputeTask } from '../../../../../scripts/precompute-newyork';
import { verifyTask } from '../../../../../scripts/verify-newyork';
import { revalidatePath } from "next/cache";
import { createLogger } from '@/utils/unified-logger';

const logger = createLogger('CronPrecomputeNY');

export async function GET() {
  try {
    await precomputeTask();
    await verifyTask();
    await revalidatePath("/");
    return NextResponse.json({ success: true });
  } catch (error: unknown) {
    logger.error('[Cron] precompute-newyork error', error as Error);
    const errorMessage = error instanceof Error ? error.message : String(error);
    return NextResponse.json({ success: false, error: errorMessage }, {
      status: 500,
    });
  }
}

export const runtime = "nodejs";
