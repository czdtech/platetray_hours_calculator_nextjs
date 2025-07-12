import type { NextConfig } from "next";
// 步骤 1: 修改这里的 import
import withPWA from '@ducanh2912/next-pwa';

const nextConfig: NextConfig = {
  // 图片优化配置
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'planetaryhours.org',
      },
      {
        protocol: 'http',
        hostname: 'localhost',
      },
    ],
    formats: ['image/webp', 'image/avif'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    minimumCacheTTL: 60 * 60 * 24 * 30, // 30天缓存
  },

  // 压缩优化
  compress: true,

  // 移除X-Powered-By头
  poweredByHeader: false,

  // 安全头配置
  async headers() {
    return [
      // 静态资源长期缓存 - 与Cloudflare协同
      {
        source: '/_next/static/(.*)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable'
          },
          {
            key: 'Vary',
            value: 'Accept-Encoding'
          }
        ]
      },
      // API路由缓存控制
      {
        source: '/api/(.*)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, s-maxage=3600, max-age=0, must-revalidate'
          },
          {
            key: 'CDN-Cache-Control',
            value: 'public, s-maxage=3600'
          }
        ]
      },
      // 主页面ISR优化
      {
        source: '/((?!api|_next/static).*)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, s-maxage=3600, stale-while-revalidate=86400'
          },
          {
            key: 'Vary',
            value: 'Accept-Encoding'
          }
        ]
      },
      // 安全头
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff'
          },
          {
            key: 'X-Frame-Options',
            value: 'DENY'
          },
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block'
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin'
          },
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=(self)',
          },
          // Content-Security-Policy 通过 middleware 动态设置，不在此静态 headers 中声明
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=63072000; includeSubDomains; preload',
          }
        ]
      },
      // 静态资源缓存 - Images
      {
        source: '/images/(.*)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      }
    ];
  },

  // 重定向规则
  async redirects() {
    return [
      // 确保尾斜杠一致性
      {
        source: '/blog/:slug/',
        destination: '/blog/:slug',
        permanent: true,
      },
    ];
  },

  // 实验性功能
  experimental: {
    // 启用优化的包导入
    optimizePackageImports: ['react-icons', 'lucide-react', 'date-fns', 'lodash'],
    // 禁用可能导致 hydration 问题的特性
    optimisticClientCache: false,
  },

  // 服务器外部包配置
  serverExternalPackages: ['suncalc'],

  // 编译配置
  compiler: {
    // 临时保留console.log用于调试线上问题
    // removeConsole: process.env.NODE_ENV === 'production',
    removeConsole: false,
  },

  // 输出配置
  output: 'standalone',

  // 跟踪配置
  trailingSlash: false,

  // 生成ETags
  generateEtags: true,

  // 生成浏览器 Source Map 以便线上调试（解决 React #418 排查困难）
  productionBrowserSourceMaps: true,

  // Turbopack 配置
  turbopack: {
    rules: {
      // SVG 作为 React 组件处理
      '*.svg': {
        loaders: ['@svgr/webpack'],
        as: '*.js',
      },
    },
    resolveAlias: {
      // 路径别名配置
      '@': './src',
      '@/components': './src/components',
      '@/utils': './src/utils',
    },
  },
};

// PWA 配置 (这部分不需要修改)
const pwaConfig = withPWA({
  dest: 'public',
  disable: process.env.NODE_ENV === 'development',
  register: true,
  runtimeCaching: [
            {
          urlPattern: /^https:\/\/fonts\.googleapis\.com\/.*/i,
          handler: 'CacheFirst',
          options: {
            cacheName: 'google-fonts-cache',
            expiration: {
              maxEntries: 10,
              maxAgeSeconds: 60 * 60 * 24 * 365, // 1 year
            },
          },
        },
    {
      urlPattern: /^https:\/\/fonts\.gstatic\.com\/.*/i,
      handler: 'CacheFirst',
      options: {
        cacheName: 'gstatic-fonts-cache',
        expiration: {
          maxEntries: 10,
          maxAgeSeconds: 60 * 60 * 24 * 365, // 1 year
        },
      },
    },
    {
      urlPattern: /\.(?:png|jpg|jpeg|svg)$/i,
      handler: 'CacheFirst',
      options: {
        cacheName: 'images',
        expiration: {
          maxEntries: 60,
          maxAgeSeconds: 30 * 24 * 60 * 60, // 30 days
        },
      },
    },
    {
      urlPattern: /\/api\/.*$/i,
      handler: 'NetworkFirst',
      options: {
        cacheName: 'apis',
        expiration: {
          maxEntries: 16,
          maxAgeSeconds: 24 * 60 * 60, // 24 hours
        },
        networkTimeoutSeconds: 10, // fall back to cache if network is slow
      },
    },
  ],
});

// 步骤 2: 简化这里的 export
export default pwaConfig(nextConfig);
