"use client";

import { useEffect, useRef } from 'react';
import { usePathname } from 'next/navigation';

interface PerformanceMetrics {
  fcp?: number;
  lcp?: number;
  cls?: number;
  fid?: number;
  ttfb?: number;
  inp?: number;
}

/**
 * 全局性能监控组件
 * 在整个应用生命周期内持续监控性能指标
 */
export function GlobalPerformanceMonitor() {
  const metricsRef = useRef<PerformanceMetrics>({});
  const isInitializedRef = useRef(false);
  const pathname = usePathname();

  useEffect(() => {
    // 只在开发环境中启用性能监控
    if (process.env.NODE_ENV !== 'development') {
      return;
    }

    // 避免重复初始化
    if (isInitializedRef.current) {
      return;
    }

    console.log('🚀 [GlobalPerformance] 初始化全局性能监控');
    isInitializedRef.current = true;

    const reportMetric = (metric: any) => {
      const { name, value, rating } = metric;
      const metricKey = name.toLowerCase() as keyof PerformanceMetrics;
      metricsRef.current[metricKey] = value;
      
      console.log(`📊 [Performance] ${name}: ${value.toFixed(2)}ms (${rating}) - 页面: ${pathname}`);
      
      // 提供优化建议
      if (rating === 'needs-improvement' || rating === 'poor') {
        console.warn(`⚠️ [Performance] ${name} 需要优化:`, getOptimizationTip(name, value));
      }

      // 记录性能历史
      recordPerformanceHistory(name, value, rating, pathname);
    };

    // 动态导入web-vitals库，兼容不同版本
    import('web-vitals').then((webVitals) => {
      const { onCLS, onFCP, onLCP, onTTFB, onINP } = webVitals;
      
      console.log('📈 [GlobalPerformance] Web Vitals监控已启动');
      
      // 注册核心指标监听器
      onCLS(reportMetric);
      onFCP(reportMetric);
      onLCP(reportMetric);
      onTTFB(reportMetric);
      onINP(reportMetric);
      
      // FID在新版本中可能不存在，使用可选调用
      if ('onFID' in webVitals && typeof webVitals.onFID === 'function') {
        webVitals.onFID(reportMetric);
      }
    }).catch(error => {
      console.warn('⚠️ [GlobalPerformance] 无法加载web-vitals库:', error.message);
    });

    // 监控导航性能
    const navigationObserver = new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        if (entry.entryType === 'navigation') {
          const navEntry = entry as PerformanceNavigationTiming;
          console.log(`🧭 [Navigation] 页面加载时间: ${navEntry.loadEventEnd - navEntry.fetchStart}ms`);
          console.log(`🧭 [Navigation] DOM内容加载: ${navEntry.domContentLoadedEventEnd - navEntry.fetchStart}ms`);
        }
      }
    });

    navigationObserver.observe({ entryTypes: ['navigation'] });

    // 监控资源加载性能
    const resourceObserver = new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        if (entry.entryType === 'resource') {
          const resourceEntry = entry as PerformanceResourceTiming;
          if (resourceEntry.duration > 1000) { // 只记录超过1秒的资源
            console.warn(`🐌 [Resource] 慢资源: ${resourceEntry.name} - ${resourceEntry.duration.toFixed(2)}ms`);
          }
        }
      }
    });

    resourceObserver.observe({ entryTypes: ['resource'] });

    // 监控长任务
    const longTaskObserver = new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        if (entry.entryType === 'longtask') {
          console.warn(`⏰ [LongTask] 长任务检测: ${entry.duration.toFixed(2)}ms`);
        }
      }
    });

    try {
      longTaskObserver.observe({ entryTypes: ['longtask'] });
    } catch (e) {
      // longtask可能在某些浏览器中不支持
      console.log('💡 [GlobalPerformance] 长任务监控在当前浏览器中不支持');
    }

    return () => {
      navigationObserver.disconnect();
      resourceObserver.disconnect();
      longTaskObserver.disconnect();
    };
  }, []); // 空依赖数组，只在组件挂载时执行一次

  // 监控路由变化
  useEffect(() => {
    if (process.env.NODE_ENV === 'development') {
      console.log(`🔄 [Navigation] 路由变化: ${pathname}`);
      
      // 记录路由变化时间
      const navigationStart = performance.now();
      
      // 使用requestIdleCallback在空闲时记录性能
      if ('requestIdleCallback' in window) {
        requestIdleCallback(() => {
          const navigationEnd = performance.now();
          console.log(`⚡ [Navigation] 路由渲染耗时: ${(navigationEnd - navigationStart).toFixed(2)}ms`);
        });
      }
    }
  }, [pathname]);

  return null; // 这是一个监控组件，不渲染任何内容
}

/**
 * 记录性能历史数据
 */
function recordPerformanceHistory(metric: string, value: number, rating: string, pathname: string) {
  const historyKey = 'performance-history';
  const history = JSON.parse(localStorage.getItem(historyKey) || '[]');
  
  history.push({
    metric,
    value,
    rating,
    pathname,
    timestamp: Date.now(),
  });

  // 只保留最近100条记录
  if (history.length > 100) {
    history.splice(0, history.length - 100);
  }

  localStorage.setItem(historyKey, JSON.stringify(history));
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
 * 性能数据导出工具
 */
export function exportPerformanceData() {
  if (process.env.NODE_ENV !== 'development') {
    console.warn('性能数据导出仅在开发环境中可用');
    return;
  }

  const historyKey = 'performance-history';
  const history = JSON.parse(localStorage.getItem(historyKey) || '[]');
  
  console.log('📊 [Performance] 性能历史数据:', history);
  
  // 生成性能报告
  const report = generatePerformanceReport(history);
  console.log('📈 [Performance] 性能报告:', report);
  
  return { history, report };
}

/**
 * 生成性能报告
 */
function generatePerformanceReport(history: any[]) {
  const metrics = ['FCP', 'LCP', 'CLS', 'TTFB', 'INP'];
  const report: any = {};

  metrics.forEach(metric => {
    const metricData = history.filter(h => h.metric === metric);
    if (metricData.length > 0) {
      const values = metricData.map(d => d.value);
      report[metric] = {
        count: values.length,
        average: values.reduce((a, b) => a + b, 0) / values.length,
        min: Math.min(...values),
        max: Math.max(...values),
        latest: values[values.length - 1],
      };
    }
  });

  return report;
}

// 在开发环境中暴露到全局对象，方便调试
if (process.env.NODE_ENV === 'development' && typeof window !== 'undefined') {
  (window as any).exportPerformanceData = exportPerformanceData;
}