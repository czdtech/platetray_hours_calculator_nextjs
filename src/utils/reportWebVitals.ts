import { onCLS, onLCP, onINP, onFCP, onTTFB, Metric } from "web-vitals";

import { createLogger } from '@/utils/logger';

const logger = createLogger('ReportWebVitals');

interface ExtendedMetric {
  name: string;
  value: number;
  id: string;
  rating?: 'good' | 'needs-improvement' | 'poor';
}

function sendToGA({ name, value, id, rating }: ExtendedMetric) {
  // @ts-expect-error -- gtag is injected by GA script at runtime
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const gtag = window.gtag as (...args: any[]) => void | undefined;
  if (!gtag) return;

  const val = name === "CLS" ? value * 1000 : value; // GA 需整数
  gtag("event", name, {
    event_category: "Web Vitals",
    event_label: id,
    value: Math.round(val),
    custom_map: { metric_rating: rating },
    non_interaction: true,
  });
}

function sendToConsole({ name, value, rating }: ExtendedMetric) {
  if (process.env.NODE_ENV === 'development') {
    logger.info(`[Web Vitals] ${name}: ${value} (${rating})`);
  }
}

function sendToAnalytics(metric: Metric) {
  const extendedMetric: ExtendedMetric = {
    name: metric.name,
    value: metric.value,
    id: metric.id,
    rating: getMetricRating(metric.name, metric.value),
  };

  // 发送到Google Analytics
  sendToGA(extendedMetric);

  // 开发环境下输出到控制台
  sendToConsole(extendedMetric);

  // 可以在这里添加其他分析服务
  // 例如：sendToDatadog(metric), sendToNewRelic(metric)
}

function getMetricRating(name: string, value: number): 'good' | 'needs-improvement' | 'poor' {
  switch (name) {
    case 'CLS':
      return value <= 0.1 ? 'good' : value <= 0.25 ? 'needs-improvement' : 'poor';
    case 'LCP':
      return value <= 2500 ? 'good' : value <= 4000 ? 'needs-improvement' : 'poor';
    case 'INP':
      return value <= 200 ? 'good' : value <= 500 ? 'needs-improvement' : 'poor';
    case 'FCP':
      return value <= 1800 ? 'good' : value <= 3000 ? 'needs-improvement' : 'poor';
    case 'TTFB':
      return value <= 800 ? 'good' : value <= 1800 ? 'needs-improvement' : 'poor';
    default:
      return 'good';
  }
}

export function reportWebVitals() {
  // Core Web Vitals
  onCLS(sendToAnalytics);
  onLCP(sendToAnalytics);
  onINP(sendToAnalytics);

  // Additional Performance Metrics
  onFCP(sendToAnalytics);
  onTTFB(sendToAnalytics);
}

// SEO相关的性能监控
export function reportSEOMetrics() {
  // 监控页面加载完成时间
  if (typeof window !== 'undefined') {
    window.addEventListener('load', () => {
      const loadTime = performance.now();

      // @ts-expect-error -- gtag is injected by GA script at runtime
      const gtag = window.gtag;
      if (gtag) {
        gtag('event', 'page_load_time', {
          event_category: 'SEO Performance',
          value: Math.round(loadTime),
          non_interaction: true,
        });
      }
    });

    // 监控DOM内容加载时间
    document.addEventListener('DOMContentLoaded', () => {
      const domLoadTime = performance.now();

      // @ts-expect-error -- gtag is injected by GA script at runtime
      const gtag = window.gtag;
      if (gtag) {
        gtag('event', 'dom_content_loaded', {
          event_category: 'SEO Performance',
          value: Math.round(domLoadTime),
          non_interaction: true,
        });
      }
    });
  }
}
