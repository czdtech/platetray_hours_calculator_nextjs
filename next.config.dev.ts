import type { NextConfig } from "next";

// 开发环境专用配置 - 优化性能
const devConfig: NextConfig = {
  // 图片优化配置（开发环境简化）
  images: {
    domains: ['planetaryhours.org', 'localhost'],
    formats: ['image/webp'],
    deviceSizes: [640, 1080, 1920], // 减少设备尺寸
    imageSizes: [32, 64, 128], // 减少图片尺寸
    minimumCacheTTL: 60, // 开发环境短缓存
    unoptimized: true, // 开发环境跳过图片优化
  },

  // 关闭压缩（开发环境）
  compress: false,

  // 移除X-Powered-By头
  poweredByHeader: false,

  // 开发环境跳过安全头
  async headers() {
    return [];
  },

  // 开发环境跳过重定向
  async redirects() {
    return [];
  },

  // Turbopack 配置（Next.js 15+ 语法）
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

  // 实验性功能
  experimental: {
    // 启用优化的包导入
    optimizePackageImports: ['react-icons', 'lucide-react'],
  },

  // 编译配置（开发环境保留console）
  compiler: {
    removeConsole: false,
  },

  // 跟踪配置
  trailingSlash: false,

  // 开发环境关闭ETags
  generateEtags: false,
};

export default devConfig;