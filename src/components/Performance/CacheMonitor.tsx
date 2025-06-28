'use client';

import { useEffect, useState } from 'react';
import { CacheMonitor } from '@/utils/performance-monitor';

interface CacheStats {
  cloudflareCache: string;
  vercelCache: string;
  age: number;
  cacheControl: string;
  ray: string;
  edge: string;
}

export default function CacheMonitorComponent() {
  const [cacheStats, setCacheStats] = useState<CacheStats | null>(null);
  const [isExpanded, setIsExpanded] = useState(false);

  useEffect(() => {
    const monitor = CacheMonitor.getInstance();

    // 启动页面缓存监控
    monitor.monitorPageCache();

    // 测试当前页面的缓存状态
    const testCache = async () => {
      try {
        const response = await fetch(window.location.href, {
          method: 'HEAD',
          cache: 'no-cache'
        });

        const analysis = monitor.analyzeCacheHeaders(response);
        setCacheStats({
          cloudflareCache: analysis.cloudflareCache,
          vercelCache: analysis.vercelCache,
          age: analysis.age,
          cacheControl: analysis.cacheControl,
          ray: analysis.ray,
          edge: analysis.edge
        });
      } catch (error) {
        console.error('缓存状态获取失败:', error);
      }
    };

    // 延迟执行以确保页面完全加载
    const timer = setTimeout(testCache, 2000);

    return () => clearTimeout(timer);
  }, []);

  if (!cacheStats) {
    return null;
  }

  const getCacheStatusColor = (status: string) => {
    switch (status.toUpperCase()) {
      case 'HIT':
        return 'text-green-600 bg-green-50';
      case 'MISS':
        return 'text-yellow-600 bg-yellow-50';
      case 'DYNAMIC':
        return 'text-blue-600 bg-blue-50';
      case 'BYPASS':
        return 'text-gray-600 bg-gray-50';
      default:
        return 'text-red-600 bg-red-50';
    }
  };

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <div className="bg-white border border-gray-200 rounded-lg shadow-lg p-3 min-w-[200px]">
                <div
          className="flex items-center justify-between cursor-pointer"
          onClick={() => setIsExpanded(!isExpanded)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              setIsExpanded(!isExpanded);
            }
          }}
          role="button"
          tabIndex={0}
          aria-expanded={isExpanded}
          aria-label="切换缓存状态详情"
        >
          <h3 className="text-sm font-semibold text-gray-700">缓存状态</h3>
          <span className="text-xs text-gray-500">
            {isExpanded ? '▲' : '▼'}
          </span>
        </div>

        {isExpanded && (
          <div className="mt-3 space-y-2 text-xs">
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Cloudflare:</span>
              <span className={`px-2 py-1 rounded text-xs font-medium ${getCacheStatusColor(cacheStats.cloudflareCache)}`}>
                {cacheStats.cloudflareCache}
              </span>
            </div>

            <div className="flex justify-between items-center">
              <span className="text-gray-600">Vercel:</span>
              <span className={`px-2 py-1 rounded text-xs font-medium ${getCacheStatusColor(cacheStats.vercelCache)}`}>
                {cacheStats.vercelCache}
              </span>
            </div>

            {cacheStats.age > 0 && (
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Age:</span>
                <span className="text-gray-800 font-mono">
                  {cacheStats.age}s
                </span>
              </div>
            )}

            {cacheStats.ray && (
              <div className="flex justify-between items-center">
                <span className="text-gray-600">CF Ray:</span>
                <span className="text-gray-800 font-mono text-[10px]">
                  {cacheStats.ray.split('-')[0]}
                </span>
              </div>
            )}

            <div className="pt-2 border-t border-gray-100">
              <div className="text-[10px] text-gray-500 font-mono break-all">
                {cacheStats.cacheControl.substring(0, 50)}
                {cacheStats.cacheControl.length > 50 && '...'}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
