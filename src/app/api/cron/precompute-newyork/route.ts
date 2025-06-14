import { NextResponse } from 'next/server';
import { precomputeTask } from '../../../../../scripts/precompute-newyork';

export async function GET() {
  try {
    await precomputeTask();
    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('[Cron] precompute-newyork error', error);
    return NextResponse.json({ success: false, error: String(error?.message ?? error) }, {
      status: 500,
    });
  }
}
