import { NextResponse, NextRequest } from 'next/server';
import crypto from 'crypto';

/**
 * AdSense Revenue-Optimized Middleware
 * 收益优先的CSP配置 - 允许所有AdSense功能
 */
export function middleware(request: NextRequest) {
  // 16-byte base64 nonce (128-bit entropy)
  const nonce = crypto.randomBytes(16).toString('base64');

  // AdSense收益优先的CSP配置
  const csp = [
    "default-src 'self'",
    // 允许所有Google/AdSense脚本和内联脚本
    `script-src 'self' 'unsafe-inline' 'unsafe-eval' 'nonce-${nonce}' 'strict-dynamic' https: *.google.com *.googlesyndication.com *.googleadservices.com *.googletagservices.com *.doubleclick.net *.google-analytics.com *.googletagmanager.com *.gstatic.com *.googleapis.com data: blob:`,
    // 允许所有样式和字体，包括内联样式
    "style-src 'self' 'unsafe-inline' https: *.google.com *.googlesyndication.com *.gstatic.com *.googleapis.com data: blob:",
    // 允许所有图像源
    "img-src 'self' 'unsafe-inline' https: http: *.google.com *.googlesyndication.com *.googleadservices.com *.doubleclick.net *.gstatic.com data: blob:",
    // 允许所有字体源
    "font-src 'self' https: *.google.com *.gstatic.com data: blob:",
    // 允许所有连接
    "connect-src 'self' https: wss: *.google.com *.googlesyndication.com *.googleadservices.com *.doubleclick.net *.google-analytics.com *.googletagmanager.com",
    // 允许所有AdSense iframe
    "frame-src 'self' https: *.google.com *.googlesyndication.com *.doubleclick.net *.googleadservices.com *.googletagservices.com *.google-analytics.com *.googletagmanager.com *.googleapis.com *.gstatic.com *.adtrafficquality.google https://cdn.ampproject.org",
    // 移除frame-ancestors限制，允许AdSense嵌入
    // "frame-ancestors 'none'", // 注释掉，允许iframe嵌入
    "object-src 'none'",
    "base-uri 'self'",
    'upgrade-insecure-requests',
  ].join('; ');

  const response = NextResponse.next();
  response.headers.set('Content-Security-Policy', csp);
  // Expose nonce so that useNonce() can consume it
  response.headers.set('x-nonce', nonce);
  return response;
}

// Apply to all routes
export const config = {
  // Use Node.js runtime so we can leverage crypto.randomBytes safely
  runtime: 'nodejs',
  matcher: '/:path*',
};
