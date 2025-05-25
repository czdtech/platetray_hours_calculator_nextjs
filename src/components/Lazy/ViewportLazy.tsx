"use client";

import { useEffect, useRef, useState, Suspense } from "react";

interface ComponentModule {
  default?: React.ComponentType<unknown>;
  [key: string]: unknown;
}

interface ViewportLazyProps<P> {
  /**
   * 动态导入函数，返回组件模块 Promise
   */
  loader: () => Promise<ComponentModule>;
  /**
   * 占位符（组件可见前的占位内容）
   */
  fallback?: React.ReactNode;
  /**
   * 传递给懒加载组件的 props
   */
  componentProps?: P;
  /**
   * IntersectionObserver 触发阈值，默认 0
   */
  rootMargin?: string;
  threshold?: number;
}

/**
 * 当元素进入视口时才动态加载对应组件，避免首屏无关资源提前下载。
 */
export function ViewportLazy<P = Record<string, unknown>>({
  loader,
  fallback = null,
  componentProps,
  rootMargin = "0px",
  threshold = 0,
}: ViewportLazyProps<P>) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [LoadedComponent, setLoadedComponent] =
    useState<React.ComponentType<P> | null>(null);
  const [hasStartedLoading, setHasStartedLoading] = useState(false);

  useEffect(() => {
    if (!containerRef.current || hasStartedLoading) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        if (entry.isIntersecting) {
          setHasStartedLoading(true);
          // 开始加载组件
          loader().then((mod) => {
            const Loaded = (mod.default ?? mod) as React.ComponentType<P>;
            setLoadedComponent(() => Loaded);
          });
          observer.disconnect();
        }
      },
      { rootMargin, threshold },
    );

    observer.observe(containerRef.current);

    return () => {
      observer.disconnect();
    };
  }, [loader, rootMargin, threshold, hasStartedLoading]);

  return (
    <div ref={containerRef}>
      {LoadedComponent ? (
        <Suspense fallback={fallback}>
          <LoadedComponent {...(componentProps || {} as any)} />
        </Suspense>
      ) : (
        fallback
      )}
    </div>
  );
}
