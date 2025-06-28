/**
 * SEO监控配置
 * 包含Google Search Console、性能监控和SEO指标追踪的配置
 */

export interface SEOMonitoringConfig {
    googleSearchConsole: {
        siteUrl: string;
        verificationMeta?: string;
        verificationFile?: string;
    };
    performance: {
        thresholds: {
            lcp: number; // Largest Contentful Paint (ms)
            fid: number; // First Input Delay (ms)
            cls: number; // Cumulative Layout Shift
            fcp: number; // First Contentful Paint (ms)
            ttfb: number; // Time to First Byte (ms)
        };
        monitoring: {
            enabled: boolean;
            sampleRate: number; // 0-1, 采样率
            reportInterval: number; // 报告间隔 (ms)
        };
        // 代码性能监控阈值
        codePerformance: {
            syncOperationWarning: number; // 同步操作警告阈值 (ms)
            syncOperationError: number; // 同步操作错误阈值 (ms)
            asyncOperationWarning: number; // 异步操作警告阈值 (ms)
            asyncOperationError: number; // 异步操作错误阈值 (ms)
            frameTime: number; // 单帧时间预算 (ms)
        };
    };
    seo: {
        tracking: {
            pageViews: boolean;
            searchQueries: boolean;
            clickThroughRates: boolean;
            bounceRate: boolean;
        };
        alerts: {
            enabled: boolean;
            thresholds: {
                pageLoadTime: number; // ms
                coreWebVitalsScore: number; // 0-100
                seoScore: number; // 0-100
            };
        };
    };
    integrations: {
        googleAnalytics: {
            enabled: boolean;
            measurementId?: string;
        };
        lighthouse: {
            enabled: boolean;
            schedule: string; // cron expression
        };
    };
}

export const seoMonitoringConfig: SEOMonitoringConfig = {
    googleSearchConsole: {
        siteUrl: process.env.NEXT_PUBLIC_SITE_URL || 'https://planetaryhours.org',
        verificationMeta: process.env.NEXT_PUBLIC_GSC_VERIFICATION,
        verificationFile: 'google-site-verification.html',
    },

    performance: {
        thresholds: {
            lcp: 2500, // Good: ≤2.5s, Needs Improvement: ≤4s, Poor: >4s
            fid: 100,  // Good: ≤100ms, Needs Improvement: ≤300ms, Poor: >300ms
            cls: 0.1,  // Good: ≤0.1, Needs Improvement: ≤0.25, Poor: >0.25
            fcp: 1800, // Good: ≤1.8s, Needs Improvement: ≤3s, Poor: >3s
            ttfb: 600, // Good: ≤600ms, Needs Improvement: ≤1.8s, Poor: >1.8s
        },
        monitoring: {
            enabled: true,
            sampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1.0,
            reportInterval: 30000, // 30秒
        },
        // 统一的代码性能监控阈值
        codePerformance: {
            syncOperationWarning: 50,   // 同步操作 > 50ms 显示警告
            syncOperationError: 100,    // 同步操作 > 100ms 显示错误
            asyncOperationWarning: 100, // 异步操作 > 100ms 显示警告
            asyncOperationError: 500,   // 异步操作 > 500ms 显示错误
            frameTime: 16,              // 单帧时间预算 16.67ms (60fps)
        },
    },

    seo: {
        tracking: {
            pageViews: true,
            searchQueries: true,
            clickThroughRates: true,
            bounceRate: true,
        },
        alerts: {
            enabled: process.env.NODE_ENV === 'production',
            thresholds: {
                pageLoadTime: 3000, // 3秒
                coreWebVitalsScore: 75, // 75分
                seoScore: 90, // 90分
            },
        },
    },

    integrations: {
        googleAnalytics: {
            enabled: !!process.env.NEXT_PUBLIC_GA_ID,
            measurementId: process.env.NEXT_PUBLIC_GA_ID,
        },
        lighthouse: {
            enabled: process.env.NODE_ENV === 'production',
            schedule: '0 2 * * *', // 每天凌晨2点运行
        },
    },
};

/**
 * 获取Google Search Console验证标签
 */
export function getGSCVerificationMeta(): string | null {
    const verification = seoMonitoringConfig.googleSearchConsole.verificationMeta;
    return verification || null;
}

/**
 * 检查性能指标是否超过阈值
 */
export function isPerformanceThresholdExceeded(
    metric: string,
    value: number
): boolean {
    const _thresholds = seoMonitoringConfig.performance.thresholds;
    const threshold = _thresholds[metric as keyof typeof _thresholds];

    if (!threshold) return false;

    // CLS是越小越好，其他指标也是越小越好
    return value > threshold;
}

/**
 * 获取代码性能监控阈值
 */
export function getCodePerformanceThresholds() {
    return seoMonitoringConfig.performance.codePerformance;
}

/**
 * 获取性能等级和表情符号
 */
export function getPerformanceLevel(
    duration: number,
    isAsync: boolean = false
): { level: 'good' | 'warning' | 'error'; emoji: string } {
    const thresholds = getCodePerformanceThresholds();
    const warningThreshold = isAsync ? thresholds.asyncOperationWarning : thresholds.syncOperationWarning;
    const errorThreshold = isAsync ? thresholds.asyncOperationError : thresholds.syncOperationError;

    if (duration <= warningThreshold) {
        return { level: 'good', emoji: '✅' };
    } else if (duration <= errorThreshold) {
        return { level: 'warning', emoji: '⚠️' };
    } else {
        return { level: 'error', emoji: '❌' };
    }
}

/**
 * 获取性能指标评级
 * 支持大小写不敏感的指标名称
 */
export function getPerformanceRating(
    metric: string,
    value: number
): 'good' | 'needs-improvement' | 'poor' {
    const _thresholds = seoMonitoringConfig.performance.thresholds;
    const normalizedMetric = metric.toLowerCase();

    switch (normalizedMetric) {
        case 'lcp':
            return value <= 2500 ? 'good' : value <= 4000 ? 'needs-improvement' : 'poor';
        case 'fid':
        case 'inp':
            return value <= 100 ? 'good' : value <= 300 ? 'needs-improvement' : 'poor';
        case 'cls':
            return value <= 0.1 ? 'good' : value <= 0.25 ? 'needs-improvement' : 'poor';
        case 'fcp':
            return value <= 1800 ? 'good' : value <= 3000 ? 'needs-improvement' : 'poor';
        case 'ttfb':
            return value <= 600 ? 'good' : value <= 1800 ? 'needs-improvement' : 'poor';
        default:
            return 'good';
    }
}

/**
 * 生成性能报告
 */
export interface PerformanceReport {
    timestamp: number;
    metrics: Record<string, { value: number; rating: string }>;
    overallScore: number;
    recommendations: string[];
}

export function generatePerformanceReport(
    metrics: Record<string, number>
): PerformanceReport {
    const report: PerformanceReport = {
        timestamp: Date.now(),
        metrics: {},
        overallScore: 0,
        recommendations: [],
    };

    let totalScore = 0;
    let metricCount = 0;

    for (const [metric, value] of Object.entries(metrics)) {
        const rating = getPerformanceRating(metric, value);
        report.metrics[metric] = { value, rating };

        // 计算分数 (good: 100, needs-improvement: 50, poor: 0)
        const score = rating === 'good' ? 100 : rating === 'needs-improvement' ? 50 : 0;
        totalScore += score;
        metricCount++;

        // 生成建议
        if (rating !== 'good') {
            report.recommendations.push(getPerformanceRecommendation(metric, rating));
        }
    }

    report.overallScore = metricCount > 0 ? Math.round(totalScore / metricCount) : 0;

    return report;
}

function getPerformanceRecommendation(metric: string, rating: string): string {
    const recommendations: Record<string, Record<string, string>> = {
        lcp: {
            'needs-improvement': '优化图片加载和服务器响应时间以改善LCP',
            'poor': '紧急优化：减少图片大小，使用CDN，优化关键渲染路径'
        },
        fid: {
            'needs-improvement': '减少JavaScript执行时间，优化第三方脚本',
            'poor': '紧急优化：移除阻塞的JavaScript，使用Web Workers'
        },
        cls: {
            'needs-improvement': '为图片和广告设置尺寸属性，避免动态内容插入',
            'poor': '紧急优化：修复布局偏移问题，预留空间给动态内容'
        },
        fcp: {
            'needs-improvement': '优化关键CSS，减少渲染阻塞资源',
            'poor': '紧急优化：内联关键CSS，延迟加载非关键资源'
        },
        ttfb: {
            'needs-improvement': '优化服务器响应时间，使用CDN',
            'poor': '紧急优化：检查服务器性能，优化数据库查询'
        }
    };

    return recommendations[metric]?.[rating] || `优化${metric}性能指标`;
}
