import { NextResponse } from 'next/server';
import { precomputeTask } from '../../../../../scripts/precompute-newyork';
import { verifyTask } from '../../../../../scripts/verify-newyork';
import { revalidatePath } from "next/cache";

export async function GET() {
  try {
    await precomputeTask();
    await verifyTask();
    await revalidatePath("/");
    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('[Cron] precompute-newyork error', error);
    return NextResponse.json({ success: false, error: String(error?.message ?? error) }, {
      status: 500,
    });
  }
}

export const runtime = "nodejs";
