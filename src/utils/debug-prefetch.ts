import { createLogger } from '@/utils/logger';

/**
 * 预取调试工具
 * 帮助理解和监控 Next.js 预取行为
 */

export function debugPrefetch() {
  const logger = createLogger('Debug-prefetch');

  if (typeof window === 'undefined' || process.env.NODE_ENV !== 'development') {
    return;
  }

  logger.info('🔍 [Debug] 预取调试工具已启动');

  // 监控所有网络请求
  const originalFetch = window.fetch;
  window.fetch = function(...args) {
    const url = args[0];
    logger.info('🌐 [Fetch]', url);
    return originalFetch.apply(this, args);
  };

  // 监控 Link 元素的创建
  const observer = new MutationObserver((mutations) => {
    mutations.forEach((mutation) => {
      mutation.addedNodes.forEach((node) => {
        if (node.nodeType === Node.ELEMENT_NODE) {
          const element = node as Element;
          
          // 检查预取链接
          const prefetchLinks = element.querySelectorAll('link[rel="prefetch"]');
          prefetchLinks.forEach((link) => {
            logger.info('🔗 [Prefetch] 预取链接已添加:', (link as HTMLLinkElement).href);
          });

          // 检查 Next.js 链接
          const nextLinks = element.querySelectorAll('a[href^="/"]');
          nextLinks.forEach((link) => {
            logger.info('🔗 [Link] Next.js 链接:', (link as HTMLAnchorElement).href);
          });
        }
      });
    });
  });

  observer.observe(document.body, {
    childList: true,
    subtree: true
  });

  // 监控页面导航
  let currentPath = window.location.pathname;
  const checkNavigation = () => {
    if (window.location.pathname !== currentPath) {
      logger.info('🧭 [Navigation] 页面导航:', {
        from: currentPath,
        to: window.location.pathname
      });
      currentPath = window.location.pathname;
    }
  };

  setInterval(checkNavigation, 100);

  logger.info('✅ [Debug] 预取调试工具设置完成');
}

// 在开发环境中自动启动
if (typeof window !== 'undefined' && process.env.NODE_ENV === 'development') {
  // 延迟启动，确保页面加载完成
  setTimeout(debugPrefetch, 1000);
}