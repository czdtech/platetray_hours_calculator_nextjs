import { useEffect, useRef, useCallback } from 'react';

/**
 * 性能优化Hook
 * 提供防抖、节流和缓存功能
 */
export function usePerformanceOptimization() {
  const cacheRef = useRef<Map<string, any>>(new Map());
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  /**
   * 防抖函数
   * @param callback 要执行的函数
   * @param delay 延迟时间（毫秒）
   */
  const debounce = useCallback((callback: () => void, delay: number = 300) => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    
    timeoutRef.current = setTimeout(() => {
      callback();
      timeoutRef.current = null;
    }, delay);
  }, []);

  /**
   * 缓存函数结果
   * @param key 缓存键
   * @param computeFn 计算函数
   * @param ttl 缓存时间（毫秒），默认5分钟
   */
  const memoize = useCallback(<T>(
    key: string, 
    computeFn: () => T, 
    ttl: number = 5 * 60 * 1000
  ): T => {
    const cached = cacheRef.current.get(key);
    const now = Date.now();

    if (cached && (now - cached.timestamp) < ttl) {
      return cached.value;
    }

    const value = computeFn();
    cacheRef.current.set(key, {
      value,
      timestamp: now
    });

    return value;
  }, []);

  /**
   * 清理缓存
   */
  const clearCache = useCallback(() => {
    cacheRef.current.clear();
  }, []);

  /**
   * 清理过期缓存
   */
  const cleanupExpiredCache = useCallback((ttl: number = 5 * 60 * 1000) => {
    const now = Date.now();
    const cache = cacheRef.current;
    
    for (const [key, value] of cache.entries()) {
      if ((now - value.timestamp) >= ttl) {
        cache.delete(key);
      }
    }
  }, []);

  // 定期清理过期缓存
  useEffect(() => {
    const interval = setInterval(() => {
      cleanupExpiredCache();
    }, 5 * 60 * 1000); // 每5分钟清理一次

    return () => {
      clearInterval(interval);
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [cleanupExpiredCache]);

  return {
    debounce,
    memoize,
    clearCache,
    cleanupExpiredCache,
  };
}

/**
 * 组件渲染性能监控Hook
 */
export function useRenderPerformance(componentName: string) {
  const renderCountRef = useRef(0);
  const lastRenderTimeRef = useRef(Date.now());

  useEffect(() => {
    renderCountRef.current += 1;
    const now = Date.now();
    const timeSinceLastRender = now - lastRenderTimeRef.current;
    
    if (process.env.NODE_ENV === 'development') {
      console.log(`🎭 [${componentName}] 渲染次数: ${renderCountRef.current}, 距离上次渲染: ${timeSinceLastRender}ms`);
    }
    
    lastRenderTimeRef.current = now;
  });

  return {
    renderCount: renderCountRef.current,
  };
}

/**
 * 网络请求优化Hook
 */
export function useNetworkOptimization() {
  const requestCacheRef = useRef<Map<string, Promise<any>>>(new Map());

  /**
   * 防重复请求
   * @param key 请求键
   * @param requestFn 请求函数
   */
  const dedupeRequest = useCallback(<T>(
    key: string,
    requestFn: () => Promise<T>
  ): Promise<T> => {
    const existingRequest = requestCacheRef.current.get(key);
    
    if (existingRequest) {
      return existingRequest;
    }

    const request = requestFn().finally(() => {
      // 请求完成后清除缓存，允许后续请求
      requestCacheRef.current.delete(key);
    });

    requestCacheRef.current.set(key, request);
    return request;
  }, []);

  return {
    dedupeRequest,
  };
}