"use client";

import { useEffect } from 'react';

import { createLogger } from '@/utils/logger';

// 将 logger 创建移到组件外部，避免每次渲染时重新创建
const logger = createLogger('ResourcePreloader');

/**
 * 资源预加载组件
 * 预加载关键资源以提升性能
 */
export function ResourcePreloader() {
  useEffect(() => {
    // 注释：移除了时区API预加载，因为常用城市的时区是已知的公共知识
    // 这些时区信息已经在 popularCities.ts 中硬编码，无需API调用
    // 这样可以：
    // 1. 减少不必要的API调用
    // 2. 节省网络资源和API配额
    // 3. 提升页面加载性能
    
    // 如果将来需要预加载其他关键资源，可以在这里添加
    logger.info('🚀 [ResourcePreloader] 资源预加载器已初始化（已优化，移除不必要的时区API预加载）');
  }, []);

  useEffect(() => {
    // 预加载字体
    const preloadFonts = () => {
      const fontUrls = [
        'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap',
      ];

      fontUrls.forEach(url => {
        const link = document.createElement('link');
        link.rel = 'preload';
        link.as = 'style';
        link.href = url;
        link.onload = () => {
          link.rel = 'stylesheet';
        };
        document.head.appendChild(link);
      });
    };

    preloadFonts();
  }, []);

  return null; // 这个组件不渲染任何内容
}

// 为 SmartPrefetcher 创建独立的 logger
const smartPrefetcherLogger = createLogger('SmartPrefetcher');

/**
 * 智能预取组件
 * 基于用户行为预取可能需要的资源
 * 注意：已禁用自动预取以避免不必要的页面请求
 */
export function SmartPrefetcher() {
  useEffect(() => {
    // 临时禁用智能预取功能
    // 原因：过于激进的预取策略导致频繁的页面请求
    // 建议：使用 Next.js 内置的 Link 组件预取功能
    smartPrefetcherLogger.info('🔧 [SmartPrefetcher] 智能预取已禁用（避免不必要的页面请求）');
    
    // 如果需要预取特定资源，可以在这里添加更精确的逻辑
    // 例如：只在用户悬停在特定链接上时才预取
  }, []);

  return null;
}
