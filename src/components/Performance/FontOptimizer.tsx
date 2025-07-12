"use client";

/**
 * 字体优化组件 - 简化版
 * 依赖Next.js内置字体优化，只添加基本的字体加载类
 */
export function FontOptimizer() {
  // 使用简单的useEffect在客户端添加字体加载类
  if (typeof window !== 'undefined') {
    // 延迟执行，确保页面基本渲染完成
    setTimeout(() => {
      document.documentElement.classList.add('fonts-loaded');
    }, 100);
  }

  return null;
}

/**
 * 字体显示优化 CSS - 简化版
 */
export function FontDisplayCSS() {
  return (
    <style jsx global>{`
      html {
        font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      }

      html.fonts-loaded {
        font-family: 'Inter', system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      }
    `}</style>
  );
}
