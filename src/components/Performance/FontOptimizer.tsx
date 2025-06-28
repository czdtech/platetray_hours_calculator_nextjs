"use client";

import { useEffect } from 'react';

import { createLogger } from '@/utils/unified-logger';

// 将 logger 创建移到组件外部，避免每次渲染时重新创建
const logger = createLogger('FontOptimizer');

/**
 * 字体优化组件
 * 优化字体加载性能，减少 CLS
 */
export function FontOptimizer() {
  useEffect(() => {
    // 简化字体优化，减少复杂的异步逻辑
    const timeoutId = setTimeout(() => {
      try {
        // 检查是否在浏览器环境中
        if (typeof window !== 'undefined' && typeof document !== 'undefined' && document.documentElement) {
          // 简单地添加fonts-loaded类，让CSS处理字体优化
          document.documentElement.classList.add('fonts-loaded');
          logger.info('Font optimization applied');
        }
      } catch (error: unknown) {
        const err = error instanceof Error ? error : new Error('Unknown FontOptimizer error');
        logger.error('FontOptimizer error:', err);
      }
    }, 200); // 稍微延长延迟，确保页面基本渲染完成

    return () => clearTimeout(timeoutId);
  }, []);

  return null;
}

/**
 * 字体显示优化 CSS
 */
export function FontDisplayCSS() {
  return (
    <style jsx global>{`
      /* 字体加载优化 - 更平滑的字体切换 */
      html {
        /* 使用size-adjust减少字体度量差异 */
        font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      }

      html.fonts-loaded {
        font-family: 'Inter', system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        /* 平滑过渡，减少布局偏移 */
        transition: font-family 0ms;
      }

      /* 减少字体切换时的布局偏移 */
      .font-display-swap {
        font-display: swap;
      }

      /* 预加载关键字体，减少FOUT */
      @font-face {
        font-family: 'Inter';
        font-display: optional;
        src: local('Inter');
      }
    `}</style>
  );
}
