"use client";

import { useEffect } from 'react';

import { createLogger } from '@/utils/logger';
/**
 * 字体优化组件
 * 优化字体加载性能，减少 CLS
 */
export function FontOptimizer() {
  const logger = createLogger('FontOptimizer');

  useEffect(() => {
    // 检查字体是否已加载
    const checkFontLoaded = async () => {
      try {
        // 检查是否在浏览器环境中
        if (typeof window !== 'undefined' && typeof document !== 'undefined') {
          if ('fonts' in document && document.fonts) {
            try {
              // 预加载关键字体
              await document.fonts.load('400 16px Inter');
              await document.fonts.load('500 16px Inter');
              await document.fonts.load('600 16px Inter');
              
              // 字体加载完成后添加类名，避免 FOUT
              if (document.documentElement) {
                document.documentElement.classList.add('fonts-loaded');
              }
            } catch (fontError) {
              logger.warn('Font loading failed:', fontError);
              // 即使字体加载失败，也要添加类名以避免无限等待
              if (document.documentElement) {
                document.documentElement.classList.add('fonts-loaded');
              }
            }
          } else {
            // 不支持 Font Loading API 的浏览器
            if (document.documentElement) {
              document.documentElement.classList.add('fonts-loaded');
            }
          }
        }
      } catch (error) {
        logger.warn('FontOptimizer error:', error);
      }
    };

    checkFontLoaded();
  }, []);

  return null;
}

/**
 * 字体显示优化 CSS
 */
export function FontDisplayCSS() {
  return (
    <style jsx global>{`
      /* 字体加载优化 */
      html {
        font-family: system-ui, -apple-system, sans-serif;
      }
      
      html.fonts-loaded {
        font-family: 'Inter', system-ui, -apple-system, sans-serif;
      }
      
      /* 减少字体切换时的布局偏移 */
      .font-display-swap {
        font-display: swap;
      }
      
      /* 关键文本的字体回退 */
      .critical-text {
        font-family: system-ui, -apple-system, sans-serif;
      }
      
      html.fonts-loaded .critical-text {
        font-family: 'Inter', system-ui, -apple-system, sans-serif;
      }
    `}</style>
  );
}