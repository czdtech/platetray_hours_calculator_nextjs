"use client";

import { Suspense, lazy, ComponentType, useState, useEffect } from 'react';

interface LazyLoaderProps {
  fallback?: React.ReactNode;
  children: React.ReactNode;
}

/**
 * 懒加载包装器组件
 * 用于延迟加载非关键组件，提升首屏性能
 */
export function LazyLoader({ fallback = <div>Loading...</div>, children }: LazyLoaderProps) {
  return (
    <Suspense fallback={fallback}>
      {children}
    </Suspense>
  );
}

/**
 * 创建懒加载组件的工具函数
 */
export function createLazyComponent<T extends ComponentType<Record<string, unknown>>>(
  importFn: () => Promise<{ default: T }>,
  fallback?: React.ReactNode
) {
  const LazyComponent = lazy(importFn);

  return function WrappedLazyComponent(props: React.ComponentProps<T>) {
    return (
      <Suspense fallback={fallback || <div>Loading...</div>}>
        <LazyComponent {...(props as any)} />
      </Suspense>
    );
  };
}

/**
 * 延迟加载Hook - 在组件挂载后再加载
 */
export function useDeferredLoad(delay: number = 100) {
  const [shouldLoad, setShouldLoad] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setShouldLoad(true);
    }, delay);

    return () => clearTimeout(timer);
  }, [delay]);

  return shouldLoad;
}