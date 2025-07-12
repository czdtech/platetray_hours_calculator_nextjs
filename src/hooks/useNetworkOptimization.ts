import { useRef, useCallback } from 'react';

/**
 * 网络请求优化Hook
 * 提供防重复请求功能
 */
export function useNetworkOptimization() {
  const requestCacheRef = useRef<Map<string, Promise<unknown>>>(new Map());

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
      return existingRequest as Promise<T>;
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