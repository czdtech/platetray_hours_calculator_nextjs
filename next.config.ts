import type { NextConfig } from "next";
import withSerwistInit from "@serwist/next";

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
          // X-Frame-Options 移除，AdSense需要完全的iframe自由度
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
            value: 'camera=(), microphone=(), geolocation=(self)' // 完全移除interest-cohort限制，AdSense需要更多权限
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
    // 生产环境移除console.log，开发环境保留
    removeConsole: process.env.NODE_ENV === 'production',
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

// Serwist PWA 配置 - 现代化PWA解决方案
const withSerwist = withSerwistInit({
  swSrc: "src/app/sw.ts", // Service Worker 源文件
  swDest: "public/sw.js", // 输出目标
  cacheOnNavigation: true,
  reloadOnOnline: true,
  disable: process.env.NODE_ENV === "development",
});

// 导出配置
export default withSerwist(nextConfig);
