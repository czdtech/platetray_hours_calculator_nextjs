import { NextResponse, NextRequest } from 'next/server';
import crypto from 'crypto';

/**
 * Generate a per-request nonce and inject a strict CSP header.
 * The nonce is exposed via the custom "x-nonce" header so that
 * `useNonce()` (Next.js built-in) can pick it up and automatically
 * propagate it to inline <script> elements.
 */
export function middleware(request: NextRequest) {
  // 16-byte base64 nonce (128-bit entropy)
  const nonce = crypto.randomBytes(16).toString('base64');

  // Build Content-Security-Policy directive
  const csp = [
    "default-src 'self'",
    // Inline scripts are only allowed if they carry this nonce
    `script-src 'self' 'nonce-${nonce}' 'strict-dynamic' https:`,
    // Inline styles may use report-sample for debugging; allow fonts/css CDNs
    `style-src 'self' 'report-sample' https://fonts.googleapis.com https://*.gstatic.com`,
    "img-src 'self' data: blob: https:",
    "font-src 'self' https://*.gstatic.com",
    "connect-src 'self' https:",
    "frame-src 'self' https://*.googlesyndication.com https://*.doubleclick.net https://*.googleadservices.com https://*.googletagservices.com https://*.google-analytics.com https://*.googletagmanager.com https://*.googleapis.com https://*.gstatic.com https://*.google.com https://*.adtrafficquality.google https://cdn.ampproject.org",
    "frame-ancestors 'none'",
    "object-src 'none'",
    "base-uri 'none'",
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
