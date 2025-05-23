"use client";

import { useEffect, useState } from "react";
import { onCLS, onLCP, onINP, onFCP, onTTFB, Metric } from "web-vitals";

interface PerformanceMetric {
    name: string;
    value: number;
    rating: 'good' | 'needs-improvement' | 'poor';
    unit: string;
}

interface PerformanceData {
    [key: string]: PerformanceMetric;
}

export function PerformanceDashboard() {
    const [metrics, setMetrics] = useState<PerformanceData>({});
    const [isVisible, setIsVisible] = useState(false);

    // 只在开发环境显示
    useEffect(() => {
        if (process.env.NODE_ENV === 'development') {
            setIsVisible(true);
        }
    }, []);

    useEffect(() => {
        if (!isVisible) return;

        const updateMetric = (metric: Metric) => {
            const rating = getRating(metric.name, metric.value);
            setMetrics(prev => ({
                ...prev,
                [metric.name]: {
                    name: metric.name,
                    value: metric.value,
                    rating,
                    unit: getUnit(metric.name)
                }
            }));
        };

        // 监听Web Vitals指标
        onCLS(updateMetric);
        onLCP(updateMetric);
        onINP(updateMetric);
        onFCP(updateMetric);
        onTTFB(updateMetric);

        // 监听页面加载性能
        const handleLoad = () => {
            const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
            if (navigation) {
                const loadTime = navigation.loadEventEnd - navigation.fetchStart;
                const domContentLoaded = navigation.domContentLoadedEventEnd - navigation.fetchStart;

                setMetrics(prev => ({
                    ...prev,
                    'Page Load': {
                        name: 'Page Load',
                        value: loadTime,
                        rating: loadTime < 2000 ? 'good' : loadTime < 4000 ? 'needs-improvement' : 'poor',
                        unit: 'ms'
                    },
                    'DOM Ready': {
                        name: 'DOM Ready',
                        value: domContentLoaded,
                        rating: domContentLoaded < 1500 ? 'good' : domContentLoaded < 3000 ? 'needs-improvement' : 'poor',
                        unit: 'ms'
                    }
                }));
            }
        };

        if (document.readyState === 'complete') {
            handleLoad();
        } else {
            window.addEventListener('load', handleLoad);
        }

        return () => {
            window.removeEventListener('load', handleLoad);
        };
    }, [isVisible]);

    if (!isVisible || Object.keys(metrics).length === 0) {
        return null;
    }

    return (
        <div className="fixed bottom-4 right-4 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg p-4 max-w-sm z-50">
            <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-semibold text-gray-900 dark:text-white">
                    性能监控
                </h3>
                <button
                    onClick={() => setIsVisible(false)}
                    className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                >
                    ✕
                </button>
            </div>

            <div className="space-y-2">
                {Object.values(metrics).map((metric) => (
                    <div key={metric.name} className="flex items-center justify-between">
                        <span className="text-xs text-gray-600 dark:text-gray-400">
                            {metric.name}
                        </span>
                        <div className="flex items-center space-x-2">
                            <span className="text-xs font-mono">
                                {formatValue(metric.value, metric.unit)}
                            </span>
                            <div className={`w-2 h-2 rounded-full ${getRatingColor(metric.rating)}`} />
                        </div>
                    </div>
                ))}
            </div>

            <div className="mt-3 pt-2 border-t border-gray-200 dark:border-gray-700">
                <div className="flex items-center space-x-4 text-xs">
                    <div className="flex items-center space-x-1">
                        <div className="w-2 h-2 rounded-full bg-green-500" />
                        <span className="text-gray-600 dark:text-gray-400">Good</span>
                    </div>
                    <div className="flex items-center space-x-1">
                        <div className="w-2 h-2 rounded-full bg-yellow-500" />
                        <span className="text-gray-600 dark:text-gray-400">Needs Improvement</span>
                    </div>
                    <div className="flex items-center space-x-1">
                        <div className="w-2 h-2 rounded-full bg-red-500" />
                        <span className="text-gray-600 dark:text-gray-400">Poor</span>
                    </div>
                </div>
            </div>
        </div>
    );
}

function getRating(name: string, value: number): 'good' | 'needs-improvement' | 'poor' {
    const thresholds: Record<string, [number, number]> = {
        'CLS': [0.1, 0.25],
        'LCP': [2500, 4000],
        'INP': [200, 500],
        'FCP': [1800, 3000],
        'TTFB': [800, 1800]
    };

    const [good, poor] = thresholds[name] || [0, 0];

    if (value <= good) return 'good';
    if (value <= poor) return 'needs-improvement';
    return 'poor';
}

function getUnit(name: string): string {
    if (name === 'CLS') return '';
    return 'ms';
}

function formatValue(value: number, unit: string): string {
    if (unit === '') {
        return value.toFixed(3);
    }
    return `${Math.round(value)}${unit}`;
}

function getRatingColor(rating: string): string {
    switch (rating) {
        case 'good': return 'bg-green-500';
        case 'needs-improvement': return 'bg-yellow-500';
        case 'poor': return 'bg-red-500';
        default: return 'bg-gray-500';
    }
} 