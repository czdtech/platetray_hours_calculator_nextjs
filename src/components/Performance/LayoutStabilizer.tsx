import { ReactNode, useState } from 'react';
import Image from 'next/image';

interface LayoutStabilizerProps {
  children: ReactNode;
  minHeight?: string;
  className?: string;
}

/**
 * 布局稳定器组件 - 简化版
 * 减少累积布局偏移(CLS)
 */
export function LayoutStabilizer({
  children,
  minHeight = "200px",
  className = ""
}: LayoutStabilizerProps) {
  return (
    <div
      className={className}
      style={{
        minHeight: minHeight,
        contain: 'layout style paint'
      }}
    >
      {children}
    </div>
  );
}

/**
 * 图片懒加载组件 - 简化版
 */
interface OptimizedImageProps {
  src: string;
  alt: string;
  width: number;
  height: number;
  className?: string;
  priority?: boolean;
}

export function OptimizedImage({
  src,
  alt,
  width,
  height,
  className = "",
  priority = false
}: OptimizedImageProps) {
  const [isLoaded, setIsLoaded] = useState(false);

  return (
    <div
      className={`relative overflow-hidden ${className}`}
      style={{
        width,
        height,
        backgroundColor: '#f3f4f6'
      }}
    >
      <Image
        src={src}
        alt={alt}
        width={width}
        height={height}
        className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-300 ${
          isLoaded ? 'opacity-100' : 'opacity-0'
        }`}
        onLoad={() => setIsLoaded(true)}
        priority={priority}
        fill={false}
      />
      {!isLoaded && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-8 h-8 border-2 border-gray-300 border-t-blue-500 rounded-full animate-spin"></div>
        </div>
      )}
    </div>
  );
}

/**
 * 内容骨架屏组件 - 简化版
 */
interface ContentSkeletonProps {
  lines?: number;
  className?: string;
}

export function ContentSkeleton({ lines = 3, className = "" }: ContentSkeletonProps) {
  return (
    <div className={`animate-pulse space-y-3 ${className}`}>
      {Array.from({ length: lines }).map((_, index) => (
        <div
          key={index}
          className={`h-4 bg-gray-200 rounded ${
            index === lines - 1 ? 'w-3/4' : 'w-full'
          }`}
        />
      ))}
    </div>
  );
}
