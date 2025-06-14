import { NextResponse } from 'next/server';
import { verifyTask } from '../../../../../scripts/verify-newyork';

export async function GET() {
  try {
    await verifyTask();
    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('[Cron] verify-newyork error', error);
    return NextResponse.json({ success: false, error: String(error?.message ?? error) }, {
      status: 500,
    });
  }
}
