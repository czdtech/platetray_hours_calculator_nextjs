/**
 * 统一设置简化版日志和性能监控
 * 在 layout.tsx 或 _app.tsx 中导入并调用
 */

import { initPerformanceMonitoring, performanceReporter } from '@/utils/performance-monitor';
import { createLogger } from '@/utils/unified-logger';

const logger = createLogger('Performance');

// 初始化所有监控系统
export function setupMonitoring() {
  if (typeof window === 'undefined') return; // 仅在客户端运行

  // 1. 启动 Google Core Web Vitals 监控
  initPerformanceMonitoring();

  // 2. 启动页面加载监控
  performanceReporter.reportPageLoad();

  // 3. 开发环境提示
  if (process.env.NODE_ENV === 'development') {
    logger.info('简化版监控系统已启动');
    logger.info('Core Web Vitals → Google Analytics');
    logger.info('开发调试日志 → 浏览器控制台');
    logger.info('生产错误日志 → Vercel Dashboard');
  }
}

// 全局错误处理 (用于捕获未处理的错误)
export function setupGlobalErrorHandling() {
  if (typeof window === 'undefined') return;

  // 捕获 JavaScript 错误
  window.addEventListener('error', (event) => {
    logger.error('全局 JavaScript 错误', event.error, {
      filename: event.filename,
      lineno: event.lineno,
      colno: event.colno,
      message: event.message
    });
  });

  // 捕获 Promise 拒绝错误
  window.addEventListener('unhandledrejection', (event) => {
    logger.error('未处理的 Promise 拒绝', new Error(event.reason), {
      reason: event.reason
    });
  });
}

// 性能优化建议检测
export function setupPerformanceHints() {
  if (typeof window === 'undefined' || process.env.NODE_ENV !== 'development') return;

  // 检测长任务
  if ('PerformanceObserver' in window) {
    const observer = new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        if (entry.duration > 50) {
          logger.warn(`检测到长任务: ${entry.duration.toFixed(1)}ms`);
        }
      }
    });

    try {
      observer.observe({ entryTypes: ['longtask'] });
    } catch {
      // 某些浏览器可能不支持 longtask
    }
  }

  // 内存使用检测
  const checkMemoryUsage = () => {
    if ('memory' in performance) {
      const memory = (performance as unknown as { memory?: { usedJSHeapSize: number; totalJSHeapSize: number } }).memory;
      if (memory) {
        const usedMB = Math.round(memory.usedJSHeapSize / 1048576);
        const totalMB = Math.round(memory.totalJSHeapSize / 1048576);

        if (usedMB > 50) { // 超过 50MB 提醒
          logger.warn(`内存使用: ${usedMB}MB / ${totalMB}MB`);
        }
      }
    }
  };

  // 每30秒检查一次内存
  setInterval(checkMemoryUsage, 30000);
}
