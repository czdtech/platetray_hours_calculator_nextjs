import { NextResponse } from "next/server";

function generateSessionToken() {
  // 生成一个简单的会话令牌
  const sessionToken = Math.random().toString(36).substring(2, 15) +
    Math.random().toString(36).substring(2, 15);

  return NextResponse.json({
    sessionToken,
    expiresAt: Date.now() + (24 * 60 * 60 * 1000) // 24小时后过期
  });
}

export async function GET(_request: Request) {
  return generateSessionToken();
}

export async function POST(_request: Request) {
  return generateSessionToken();
}
