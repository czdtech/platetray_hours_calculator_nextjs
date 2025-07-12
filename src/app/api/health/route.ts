import { NextResponse } from 'next/server';

export async function GET() {
  const healthCheck = {
    timestamp: new Date().toISOString(),
    status: 'healthy',
    environment: process.env.NODE_ENV,
    apis: {},
    cacheHeaders: {},
  };

  try {
    // 测试时区API
    const timezoneUrl = `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/api/maps/timezone?location=51.5074,-0.1278&timestamp=${Math.floor(Date.now() / 1000)}`;
    const timezoneResponse = await fetch(timezoneUrl, {
      headers: { 'Cache-Control': 'no-cache' }
    });
    
    const timezoneData = await timezoneResponse.json();
    
    healthCheck.apis = {
      timezone: {
        status: timezoneResponse.status,
        ok: timezoneResponse.ok,
        data: timezoneData,
        headers: {
          'cache-control': timezoneResponse.headers.get('cache-control'),
          'x-vercel-cache': timezoneResponse.headers.get('x-vercel-cache'),
        }
      }
    };

    // 测试会话API
    try {
      const sessionUrl = `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/api/maps/session/start`;
      const sessionResponse = await fetch(sessionUrl);
      const sessionData = await sessionResponse.json();
      
      healthCheck.apis.session = {
        status: sessionResponse.status,
        ok: sessionResponse.ok,
        data: sessionData
      };
    } catch (sessionError) {
      healthCheck.apis.session = {
        status: 'error',
        error: sessionError instanceof Error ? sessionError.message : 'Unknown error'
      };
    }

  } catch (error) {
    healthCheck.apis.timezone = {
      status: 'error',
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }

  return NextResponse.json(healthCheck, {
    headers: {
      'Cache-Control': 'no-cache, no-store, must-revalidate',
      'Pragma': 'no-cache',
      'Expires': '0'
    }
  });
}