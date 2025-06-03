'use client';

import { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { ChevronUp } from 'lucide-react';

interface BackToTopProps {
  /** 显示按钮的滚动阈值（像素） */
  threshold?: number;
  /** 按钮位置 */
  position?: 'bottom-right' | 'bottom-left';
  /** 自定义样式类 */
  className?: string;
}

export function BackToTop({
  threshold = 300,
  position = 'bottom-right',
  className = ''
}: BackToTopProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const pathname = usePathname();

  // 防止 hydration 错误
  useEffect(() => {
    setIsMounted(true);
  }, []);

  // 如果是博客文章页面，不显示通用返回顶部按钮
  const isBlogPost = pathname?.startsWith('/blog/') && pathname !== '/blog';

  useEffect(() => {
    if (!isMounted || isBlogPost) {
      return;
    }
    const toggleVisibility = () => {
      if (window.pageYOffset > threshold) {
        setIsVisible(true);
      } else {
        setIsVisible(false);
      }
    };

    window.addEventListener('scroll', toggleVisibility);

    return () => {
      window.removeEventListener('scroll', toggleVisibility);
    };
  }, [threshold, isBlogPost, isMounted]);

  if (!isMounted || isBlogPost) {
    return null;
  }

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  };

  if (!isVisible) {
    return null;
  }

  const positionClasses = {
    'bottom-right': 'bottom-6 right-6',
    'bottom-left': 'bottom-6 left-6'
  };

  return (
    <button
      onClick={scrollToTop}
      className={`
        fixed ${positionClasses[position]} z-50
        bg-purple-600 hover:bg-purple-700 
        text-white rounded-full p-3 
        shadow-lg hover:shadow-xl
        transition-all duration-300 ease-in-out
        transform hover:scale-110
        focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2
        ${className}
      `}
      aria-label="返回顶部"
      title="返回顶部"
    >
      <ChevronUp className="w-6 h-6" />
    </button>
  );
}