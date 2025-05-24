import Link from 'next/link';
import { ReactNode } from 'react';

interface OptimizedLinkProps {
  href: string;
  children: ReactNode;
  className?: string;
  priority?: 'high' | 'normal' | 'low';
  onClick?: () => void;
}

/**
 * 优化的链接组件
 * 根据页面重要性智能控制预取行为
 */
export function OptimizedLink({ 
  href, 
  children, 
  className, 
  priority = 'normal',
  onClick 
}: OptimizedLinkProps) {
  // 根据优先级决定预取策略
  const shouldPrefetch = () => {
    switch (priority) {
      case 'high':
        return true; // 主要导航页面，始终预取
      case 'normal':
        return true; // 普通页面，默认预取
      case 'low':
        return false; // 不重要页面，禁用预取
      default:
        return true;
    }
  };

  // 检查是否为外部链接
  const isExternal = href.startsWith('http') || href.startsWith('//');

  if (isExternal) {
    return (
      <a 
        href={href} 
        className={className}
        target="_blank" 
        rel="noopener noreferrer"
        onClick={onClick}
      >
        {children}
      </a>
    );
  }

  return (
    <Link 
      href={href} 
      prefetch={shouldPrefetch()}
      className={className}
      onClick={onClick}
    >
      {children}
    </Link>
  );
}

// 使用示例：
// <OptimizedLink href="/about" priority="high">About</OptimizedLink>
// <OptimizedLink href="/privacy" priority="low">Privacy</OptimizedLink>