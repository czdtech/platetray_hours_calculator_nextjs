'use client';

/**
 * 性能监控系统初始化组件
 * 统一管理所有性能监控功能
 */

import { useEffect } from 'react';
import { setupMonitoring, setupGlobalErrorHandling, setupPerformanceHints } from '@/utils/setup-monitoring';

export function SimpleMonitoringSetup() {
  useEffect(() => {
    // 初始化所有监控系统
    setupMonitoring();
    setupGlobalErrorHandling();
    setupPerformanceHints();
  }, []);

  // 此组件不渲染任何UI
  return null;
}
