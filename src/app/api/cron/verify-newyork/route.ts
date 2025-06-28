import { NextResponse } from 'next/server';
import { verifyTask } from '../../../../../scripts/verify-newyork';
import { createLogger } from '@/utils/unified-logger';

const logger = createLogger('CronVerifyNY');

export async function GET() {
  try {
    await verifyTask();
    return NextResponse.json({ success: true });
  } catch (error: unknown) {
    logger.error('[Cron] verify-newyork error', error as Error);
    const errorMessage = error instanceof Error ? error.message : String(error);
    return NextResponse.json({ success: false, error: errorMessage }, {
      status: 500,
    });
  }
}
