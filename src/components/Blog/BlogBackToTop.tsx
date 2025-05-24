'use client';

import { useState, useEffect } from 'react';
import { ChevronUp, MessageCircle, Share2 } from 'lucide-react';

interface BlogBackToTopProps {
  /** 文章标题，用于分享 */
  title?: string;
  /** 文章URL，用于分享 */
  url?: string;
  /** 显示按钮的滚动阈值（像素） */
  threshold?: number;
}

export function BlogBackToTop({ 
  title = '',
  url = '',
  threshold = 300 
}: BlogBackToTopProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [scrollProgress, setScrollProgress] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.pageYOffset;
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      const progress = (scrollTop / docHeight) * 100;
      
      setScrollProgress(progress);
      setIsVisible(scrollTop > threshold);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [threshold]);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  };

  const handleShare = async () => {
    if (navigator.share && title && url) {
      try {
        await navigator.share({
          title,
          url
        });
      } catch {
        // 如果原生分享失败，复制到剪贴板
        navigator.clipboard.writeText(url);
      }
    } else if (url) {
      // 备用方案：复制到剪贴板
      navigator.clipboard.writeText(url);
    }
  };

  const scrollToComments = () => {
    const commentsSection = document.getElementById('comments');
    if (commentsSection) {
      commentsSection.scrollIntoView({ behavior: 'smooth' });
    }
  };

  if (!isVisible) {
    return null;
  }

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-2">
      {/* 阅读进度指示器 */}
      <div className="relative">
        <svg className="w-12 h-12 transform -rotate-90" viewBox="0 0 36 36">
          <path
            className="text-gray-300 dark:text-gray-600"
            stroke="currentColor"
            strokeWidth="2"
            fill="none"
            d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
          />
          <path
            className="text-purple-600"
            stroke="currentColor"
            strokeWidth="2"
            fill="none"
            strokeDasharray={`${scrollProgress}, 100`}
            d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
          />
        </svg>
        <button
          onClick={scrollToTop}
          className="absolute inset-0 flex items-center justify-center
                     bg-white dark:bg-gray-800 rounded-full shadow-lg
                     hover:bg-gray-50 dark:hover:bg-gray-700
                     transition-colors duration-200
                     focus:outline-none focus:ring-2 focus:ring-purple-500"
          aria-label="返回顶部"
          title="返回顶部"
        >
          <ChevronUp className="w-5 h-5 text-purple-600" />
        </button>
      </div>

      {/* 分享按钮 */}
      {title && url && (
        <button
          onClick={handleShare}
          className="bg-blue-600 hover:bg-blue-700 text-white rounded-full p-3
                     shadow-lg hover:shadow-xl transition-all duration-200
                     focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          aria-label="分享文章"
          title="分享文章"
        >
          <Share2 className="w-5 h-5" />
        </button>
      )}

      {/* 跳转到评论按钮 */}
      <button
        onClick={scrollToComments}
        className="bg-green-600 hover:bg-green-700 text-white rounded-full p-3
                   shadow-lg hover:shadow-xl transition-all duration-200
                   focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
        aria-label="跳转到评论"
        title="跳转到评论"
      >
        <MessageCircle className="w-5 h-5" />
      </button>
    </div>
  );
}