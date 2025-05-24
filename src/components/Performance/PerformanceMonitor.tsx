"use client";

import { useEffect, useRef } from 'react';

interface PerformanceMetrics {
  fcp?: number;
  lcp?: number;
  cls?: number;
  fid?: number;
  ttfb?: number;
  inp?: number;
}

/**
 * 性能监控组件
 * 监控Web Vitals指标并提供优化建议
 */
export function PerformanceMonitor() {
  const metricsRef = useRef<PerformanceMetrics>({});

  useEffect(() => {
    // 只在开发环境中启用性能监控
    if (process.env.NODE_ENV !== 'development') {
      return;
    }

    const reportMetric = (metric: any) => {
      const { name, value, rating } = metric;
      metricsRef.current[name.toLowerCase() as keyof PerformanceMetrics] = value;
      
      console.log(`📊 [Performance] ${name}: ${value.toFixed(2)}ms (${rating})`);
      
      // 提供优化建议
      if (rating === 'needs-improvement' || rating === 'poor') {
        console.warn(`⚠️ [Performance] ${name} 需要优化:`, getOptimizationTip(name, value));
      }
    };

    // 动态导入web-vitals库，兼容不同版本
    import('web-vitals').then((webVitals) => {
      const { onCLS, onFCP, onLCP, onTTFB, onINP } = webVitals;
      
      // 注册核心指标监听器
      onCLS(reportMetric);
      onFCP(reportMetric);
      onLCP(reportMetric);
      onTTFB(reportMetric);
      onINP(reportMetric);
      
      // FID在新版本中可能不存在，使用可选调用
      if ('onFID' in webVitals && typeof webVitals.onFID === 'function') {
        webVitals.onFID(reportMetric);
      } else {
        console.log('📊 [Performance] FID指标在当前版本中不可用，使用INP代替');
      }
    }).catch(error => {
      console.warn('⚠️ [Performance] 无法加载web-vitals库:', error.message);
      console.log('💡 [Performance] 性能监控将使用基础模式');
    });

    // 监控渲染性能
    const observer = new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        if (entry.entryType === 'measure') {
          console.log(`🎭 [Render] ${entry.name}: ${entry.duration.toFixed(2)}ms`);
        }
      }
    });

    observer.observe({ entryTypes: ['measure'] });

    return () => {
      observer.disconnect();
    };
  }, []);

  return null; // 这是一个监控组件，不渲染任何内容
}

/**
 * 获取性能优化建议
 */
function getOptimizationTip(metric: string, value: number): string {
  switch (metric) {
    case 'CLS':
      return `累积布局偏移过高 (${value.toFixed(3)})。建议：
        1. 为图片和视频设置明确的尺寸
        2. 避免在现有内容上方插入内容
        3. 使用CSS contain属性
        4. 预留广告和嵌入内容的空间`;
    
    case 'LCP':
      return `最大内容绘制时间过长 (${value.toFixed(0)}ms)。建议：
        1. 优化服务器响应时间
        2. 使用CDN加速资源加载
        3. 预加载关键资源
        4. 优化图片格式和大小`;
    
    case 'FCP':
      return `首次内容绘制时间过长 (${value.toFixed(0)}ms)。建议：
        1. 减少阻塞渲染的资源
        2. 内联关键CSS
        3. 移除未使用的CSS
        4. 压缩文本资源`;
    
    case 'TTFB':
      return `首字节时间过长 (${value.toFixed(0)}ms)。建议：
        1. 优化服务器配置
        2. 使用CDN
        3. 启用服务器端缓存
        4. 减少服务器处理时间`;
    
    case 'FID':
      return `首次输入延迟过长 (${value.toFixed(0)}ms)。建议：
        1. 减少JavaScript执行时间
        2. 拆分长任务
        3. 使用Web Workers
        4. 延迟加载非关键JavaScript`;
    
    case 'INP':
      return `交互到下一次绘制时间过长 (${value.toFixed(0)}ms)。建议：
        1. 优化事件处理器
        2. 避免长时间运行的JavaScript
        3. 使用防抖和节流
        4. 优化DOM操作`;
    
    default:
      return '考虑优化页面性能';
  }
}

/**
 * 性能标记工具
 */
export class PerformanceMarker {
  private static marks: Map<string, number> = new Map();

  static start(name: string) {
    if (process.env.NODE_ENV === 'development') {
      this.marks.set(name, performance.now());
      performance.mark(`${name}-start`);
    }
  }

  static end(name: string) {
    if (process.env.NODE_ENV === 'development') {
      const startTime = this.marks.get(name);
      if (startTime) {
        const endTime = performance.now();
        const duration = endTime - startTime;
        
        performance.mark(`${name}-end`);
        performance.measure(name, `${name}-start`, `${name}-end`);
        
        console.log(`⏱️ [Performance] ${name}: ${duration.toFixed(2)}ms`);
        
        this.marks.delete(name);
      }
    }
  }

  static measure(name: string, fn: () => void) {
    this.start(name);
    fn();
    this.end(name);
  }

  static async measureAsync<T>(name: string, fn: () => Promise<T>): Promise<T> {
    this.start(name);
    try {
      const result = await fn();
      this.end(name);
      return result;
    } catch (error) {
      this.end(name);
      throw error;
    }
  }
}