/**
 * 性能监控工具 - 专注于 Google Core Web Vitals 和 SEO
 */

import { onCLS, onLCP, onINP, onFCP, onTTFB, Metric } from "web-vitals";
import { createLogger } from '@/utils/unified-logger';
import { getPerformanceRating } from '@/config/seo-monitoring';

const logger = createLogger('WebVitals');

// 发送到 Google Analytics
function sendToGA(metric: Metric) {
  // @ts-expect-error - gtag 由 GA 脚本注入
  const gtag = window.gtag;
  if (!gtag) return;

  const rating = getPerformanceRating(metric.name, metric.value);
  const value = metric.name === "CLS" ? metric.value * 1000 : metric.value;

  gtag("event", metric.name, {
    event_category: "Web Vitals",
    event_label: metric.id,
    value: Math.round(value),
    custom_map: { metric_rating: rating },
    non_interaction: true,
  });
}

// 开发环境控制台输出
function logToConsole(metric: Metric) {
  if (process.env.NODE_ENV === 'development') {
    const rating = getPerformanceRating(metric.name, metric.value);
    const emoji = rating === 'good' ? '✅' : rating === 'needs-improvement' ? '⚠️' : '❌';
    logger.performance(`${emoji} [Web Vitals] ${metric.name}: ${metric.value.toFixed(1)} (${rating})`);
  }
}

// 处理性能指标
function handleMetric(metric: Metric) {
  // 发送到 GA（用于老板报告）
  sendToGA(metric);

  // 开发环境日志
  logToConsole(metric);

  // 可以在这里添加其他分析服务
  // 比如：发送到老板的性能仪表板
}

// 初始化 Core Web Vitals 监控
export function initPerformanceMonitoring() {
  // Google 的核心性能指标
  onCLS(handleMetric);  // 布局稳定性
  onLCP(handleMetric);  // 加载性能
  onINP(handleMetric);  // 交互响应
  onFCP(handleMetric);  // 感知加载速度
  onTTFB(handleMetric); // 服务器响应速度

  if (process.env.NODE_ENV === 'development') {
    logger.info('性能监控已启动 - Core Web Vitals 正在追踪');
  }
}

// 简单的性能报告工具（给老板看的）
export const performanceReporter = {
  // 页面加载完成后的报告
  reportPageLoad: () => {
    if (typeof window === 'undefined') return;

    window.addEventListener('load', () => {
      const loadTime = performance.now();

      // @ts-expect-error - gtag 由 GA 脚本注入
      const gtag = window.gtag;
      if (gtag) {
        gtag('event', 'page_load_complete', {
          event_category: 'Performance',
          value: Math.round(loadTime),
          non_interaction: true,
        });
      }

      if (process.env.NODE_ENV === 'development') {
        logger.performance(`页面完全加载: ${loadTime.toFixed(1)}ms`);
      }
    });
  },

  // 用户交互响应时间报告
  reportUserInteraction: (action: string, duration: number) => {
    // @ts-expect-error - gtag 由 GA 脚本注入
    const gtag = window.gtag;
    if (gtag && duration > 100) { // 只报告较慢的交互
      gtag('event', 'slow_interaction', {
        event_category: 'Performance',
        event_label: action,
        value: Math.round(duration),
        non_interaction: true,
      });
    }
  }
};

// 重新导出 unified-logger 中的性能测试工具，避免重复实现
export { perfTest } from './unified-logger';

/**
 * 缓存监控工具
 */
export class CacheMonitor {
  private static instance: CacheMonitor;

  static getInstance(): CacheMonitor {
    if (!CacheMonitor.instance) {
      CacheMonitor.instance = new CacheMonitor();
    }
    return CacheMonitor.instance;
  }

  /**
   * 分析响应头中的缓存信息
   */
  analyzeCacheHeaders(response: Response): CacheAnalysis {
    const headers = response.headers;

    return {
      cloudflareCache: headers.get('cf-cache-status') || 'UNKNOWN',
      vercelCache: headers.get('x-vercel-cache') || 'UNKNOWN',
      age: parseInt(headers.get('age') || '0'),
      cacheControl: headers.get('cache-control') || '',
      etag: headers.get('etag') || '',
      lastModified: headers.get('last-modified') || '',
      vary: headers.get('vary') || '',
      server: headers.get('server') || '',
      edge: headers.get('x-vercel-id') || '',
      ray: headers.get('cf-ray') || ''
    };
  }

  /**
   * 监控页面加载中的缓存效果
   */
  monitorPageCache(): void {
    if (typeof window === 'undefined') return;

    // 监控当前页面的缓存状态
    const analyzeCurrentPage = () => {
      const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
      if (navigation) {
        console.log('🚀 页面加载性能:', {
          DNS解析: `${navigation.domainLookupEnd - navigation.domainLookupStart}ms`,
          TCP连接: `${navigation.connectEnd - navigation.connectStart}ms`,
          TLS握手: `${navigation.secureConnectionStart ? navigation.connectEnd - navigation.secureConnectionStart : 0}ms`,
          请求响应: `${navigation.responseEnd - navigation.requestStart}ms`,
          DOM加载: `${navigation.domContentLoadedEventEnd - navigation.responseEnd}ms`,
          总时间: `${navigation.loadEventEnd - navigation.fetchStart}ms`
        });
      }
    };

    // 监控资源加载的缓存情况
    const analyzeResourceCache = () => {
      const resources = performance.getEntriesByType('resource') as PerformanceResourceTiming[];
      const cacheStats = {
        total: 0,
        cached: 0,
        static: 0,
        api: 0
      };

      resources.forEach(resource => {
        cacheStats.total++;

        if (resource.transferSize === 0 && resource.decodedBodySize > 0) {
          cacheStats.cached++;
        }

        if (resource.name.includes('/_next/static/')) {
          cacheStats.static++;
        }

        if (resource.name.includes('/api/')) {
          cacheStats.api++;
        }
      });

      console.log('📊 资源缓存统计:', {
        总资源: cacheStats.total,
        缓存命中: cacheStats.cached,
        缓存率: `${((cacheStats.cached / cacheStats.total) * 100).toFixed(1)}%`,
        静态资源: cacheStats.static,
        API请求: cacheStats.api
      });
    };

    // 页面加载完成后分析
    if (document.readyState === 'complete') {
      setTimeout(() => {
        analyzeCurrentPage();
        analyzeResourceCache();
      }, 1000);
    } else {
      window.addEventListener('load', () => {
        setTimeout(() => {
          analyzeCurrentPage();
          analyzeResourceCache();
        }, 1000);
      });
    }
  }

  /**
   * 测试特定资源的缓存状态
   */
  async testResourceCache(url: string): Promise<CacheAnalysis> {
    try {
      const response = await fetch(url, {
        method: 'HEAD',
        cache: 'reload'
      });
      return this.analyzeCacheHeaders(response);
    } catch (error) {
      console.error('缓存测试失败:', error);
      return {
        cloudflareCache: 'ERROR',
        vercelCache: 'ERROR',
        age: 0,
        cacheControl: '',
        etag: '',
        lastModified: '',
        vary: '',
        server: '',
        edge: '',
        ray: ''
      };
    }
  }
}

interface CacheAnalysis {
  cloudflareCache: string;  // cf-cache-status
  vercelCache: string;      // x-vercel-cache
  age: number;              // cache age in seconds
  cacheControl: string;     // cache-control header
  etag: string;             // etag for validation
  lastModified: string;     // last-modified date
  vary: string;             // vary header
  server: string;           // server type
  edge: string;             // edge location
  ray: string;              // cloudflare ray id
}
