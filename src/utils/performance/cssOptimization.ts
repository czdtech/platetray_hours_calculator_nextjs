/**
 * CSS 性能优化工具
 */

/**
 * 动态加载 CSS
 * 用于非关键 CSS 的延迟加载
 */
export function loadCSS(href: string, media: string = 'all'): Promise<void> {
  return new Promise((resolve, reject) => {
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = href;
    link.media = media;
    
    link.onload = () => resolve();
    link.onerror = () => reject(new Error(`Failed to load CSS: ${href}`));
    
    document.head.appendChild(link);
  });
}

/**
 * 预加载关键 CSS
 */
export function preloadCSS(href: string): void {
  const link = document.createElement('link');
  link.rel = 'preload';
  link.as = 'style';
  link.href = href;
  link.onload = () => {
    link.rel = 'stylesheet';
  };
  document.head.appendChild(link);
}

/**
 * 内联关键 CSS
 * 用于首屏渲染的关键样式
 */
export const criticalCSS = `
  /* 关键样式 - 首屏渲染必需 */
  html, body {
    margin: 0;
    padding: 0;
    font-family: system-ui, -apple-system, sans-serif;
    line-height: 1.6;
  }
  
  /* 防止布局偏移的占位样式 */
  .skeleton {
    background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
    background-size: 200% 100%;
    animation: loading 1.5s infinite;
  }
  
  @keyframes loading {
    0% { background-position: 200% 0; }
    100% { background-position: -200% 0; }
  }
  
  /* 关键布局样式 */
  .container {
    max-width: 1200px;
    margin: 0 auto;
    padding: 0 1rem;
  }
  
  /* 响应式网格 */
  .grid {
    display: grid;
    gap: 1rem;
  }
  
  @media (min-width: 768px) {
    .grid-md-2 {
      grid-template-columns: repeat(2, 1fr);
    }
  }
  
  /* 性能优化的过渡效果 */
  .transition-optimized {
    transition: transform 0.2s ease-out, opacity 0.2s ease-out;
    will-change: transform, opacity;
  }
  
  .transition-optimized:hover {
    transform: translateY(-2px);
  }
`;

/**
 * CSS 变量管理
 * 用于主题和动态样式
 */
export const cssVariables = {
  // 颜色系统
  colors: {
    primary: '#8B5CF6',
    secondary: '#06B6D4',
    success: '#10B981',
    warning: '#F59E0B',
    error: '#EF4444',
    gray: {
      50: '#F9FAFB',
      100: '#F3F4F6',
      200: '#E5E7EB',
      300: '#D1D5DB',
      400: '#9CA3AF',
      500: '#6B7280',
      600: '#4B5563',
      700: '#374151',
      800: '#1F2937',
      900: '#111827',
    },
  },
  
  // 间距系统
  spacing: {
    xs: '0.25rem',
    sm: '0.5rem',
    md: '1rem',
    lg: '1.5rem',
    xl: '2rem',
    '2xl': '3rem',
  },
  
  // 断点系统
  breakpoints: {
    sm: '640px',
    md: '768px',
    lg: '1024px',
    xl: '1280px',
    '2xl': '1536px',
  },
};

/**
 * 生成 CSS 变量字符串
 */
export function generateCSSVariables(): string {
  const vars: string[] = [];
  
  // 颜色变量
  Object.entries(cssVariables.colors).forEach(([key, value]) => {
    if (typeof value === 'string') {
      vars.push(`--color-${key}: ${value};`);
    } else {
      Object.entries(value).forEach(([shade, color]) => {
        vars.push(`--color-${key}-${shade}: ${color};`);
      });
    }
  });
  
  // 间距变量
  Object.entries(cssVariables.spacing).forEach(([key, value]) => {
    vars.push(`--spacing-${key}: ${value};`);
  });
  
  return `:root { ${vars.join(' ')} }`;
}

/**
 * 媒体查询工具
 */
export const mediaQueries = {
  mobile: `@media (max-width: ${cssVariables.breakpoints.sm})`,
  tablet: `@media (min-width: ${cssVariables.breakpoints.sm}) and (max-width: ${cssVariables.breakpoints.lg})`,
  desktop: `@media (min-width: ${cssVariables.breakpoints.lg})`,
  
  // 性能优化的媒体查询
  prefersReducedMotion: '@media (prefers-reduced-motion: reduce)',
  prefersDarkMode: '@media (prefers-color-scheme: dark)',
  highDPI: '@media (-webkit-min-device-pixel-ratio: 2), (min-resolution: 192dpi)',
};

/**
 * 性能优化的 CSS 类生成器
 */
export function generateOptimizedClasses() {
  return `
    /* 硬件加速 */
    .gpu-accelerated {
      transform: translateZ(0);
      will-change: transform;
    }
    
    /* 优化的阴影 */
    .shadow-optimized {
      box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06);
    }
    
    /* 性能友好的模糊效果 */
    .backdrop-blur-optimized {
      backdrop-filter: blur(8px);
      -webkit-backdrop-filter: blur(8px);
    }
    
    /* 优化的渐变 */
    .gradient-optimized {
      background: linear-gradient(135deg, var(--color-primary) 0%, var(--color-secondary) 100%);
    }
    
    /* 响应式文本 */
    .text-responsive {
      font-size: clamp(1rem, 2.5vw, 1.5rem);
    }
  `;
}