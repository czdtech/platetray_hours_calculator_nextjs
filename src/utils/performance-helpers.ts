/**
 * 性能监控帮助工具
 * 提供统一的性能监控接口，简化手动性能测量代码
 */

import { createLogger } from '@/utils/unified-logger';
import { getCodePerformanceThresholds, getPerformanceLevel } from '@/config/seo-monitoring';

const logger = createLogger('PerformanceHelper');

/**
 * 性能监控包装器 - 同步版本
 * 自动测量函数执行时间并记录日志
 */
export function withPerformanceMonitoring<T>(
  name: string,
  fn: () => T,
  options?: {
    context?: string;
    logLevel?: 'debug' | 'performance';
    customThresholds?: { warning: number; error: number };
  }
): T {
  const startTime = performance.now();
  const result = fn();
  const duration = performance.now() - startTime;

  logPerformanceResult(name, duration, false, options);
  return result;
}

/**
 * 性能监控包装器 - 异步版本
 * 自动测量异步函数执行时间并记录日志
 */
export async function withAsyncPerformanceMonitoring<T>(
  name: string,
  fn: () => Promise<T>,
  options?: {
    context?: string;
    logLevel?: 'debug' | 'performance';
    customThresholds?: { warning: number; error: number };
  }
): Promise<T> {
  const startTime = performance.now();
  const result = await fn();
  const duration = performance.now() - startTime;

  logPerformanceResult(name, duration, true, options);
  return result;
}

/**
 * 简单的性能计时器
 * 手动开始和结束计时
 */
export class PerformanceTimer {
  private startTime: number;
  private name: string;
  private isAsync: boolean;

  constructor(name: string, isAsync: boolean = false) {
    this.name = name;
    this.isAsync = isAsync;
    this.startTime = performance.now();
  }

  /**
   * 结束计时并记录结果
   */
  end(options?: {
    context?: string;
    logLevel?: 'debug' | 'performance';
  }): number {
    const duration = performance.now() - this.startTime;
    logPerformanceResult(this.name, duration, this.isAsync, options);
    return duration;
  }

  /**
   * 获取当前已消耗的时间（不结束计时）
   */
  elapsed(): number {
    return performance.now() - this.startTime;
  }
}

/**
 * 记录性能结果的内部函数
 */
function logPerformanceResult(
  name: string,
  duration: number,
  isAsync: boolean,
  options?: {
    context?: string;
    logLevel?: 'debug' | 'performance';
    customThresholds?: { warning: number; error: number };
  }
) {
  if (process.env.NODE_ENV !== 'development') return;

  const { emoji, level } = getPerformanceLevel(duration, isAsync);
  const context = options?.context || '';
  const contextStr = context ? ` [${context}]` : '';
  const operationType = isAsync ? '异步操作' : '同步操作';

  const message = `${emoji} [${operationType}]${contextStr} ${name}: ${duration.toFixed(2)}ms`;

  // 根据性能等级选择日志级别
  const logLevel = options?.logLevel || 'performance';

  if (level === 'error') {
    logger.warn(message);
  } else {
    logger[logLevel](message);
  }

  // 如果有自定义阈值，也进行检查
  if (options?.customThresholds) {
    const { warning, error } = options.customThresholds;
    if (duration > error) {
      logger.warn(`⚠️ [自定义阈值] ${name} 超过错误阈值 ${error}ms: ${duration.toFixed(2)}ms`);
    } else if (duration > warning) {
      logger.debug(`💡 [自定义阈值] ${name} 超过警告阈值 ${warning}ms: ${duration.toFixed(2)}ms`);
    }
  }
}

/**
 * 快速性能检查 - 用于已有计时代码的升级
 * 与现有的 performance.now() 代码兼容
 */
export function checkPerformance(
  name: string,
  duration: number,
  isAsync: boolean = false,
  context?: string
) {
  logPerformanceResult(name, duration, isAsync, { context });
}

/**
 * INP (Interaction to Next Paint) 性能检查
 * 专门用于用户交互性能监控
 */
export function checkINPPerformance(interactionName: string, duration: number) {
  const thresholds = getCodePerformanceThresholds();

  if (duration > thresholds.frameTime) {
    const message = `[INP Warning] ${interactionName} took ${duration.toFixed(2)}ms (>${thresholds.frameTime}ms frame budget)`;

    if (duration > thresholds.syncOperationError) {
      logger.warn(`❌ ${message}`);
    } else if (duration > thresholds.syncOperationWarning) {
      logger.performance(`⚠️ ${message}`);
    } else {
      logger.debug(`💡 ${message}`);
    }
  }
}

/**
 * API 性能检查 - 专门用于 API 调用
 */
export function checkAPIPerformance(
  route: string,
  duration: number,
  status: 'success' | 'error' = 'success'
) {
  const thresholds = getCodePerformanceThresholds();
  const { emoji } = getPerformanceLevel(duration, true); // API 调用视为异步操作

  const statusEmoji = status === 'success' ? '✅' : '❌';
  const message = `${emoji}${statusEmoji} [API] ${route} ${status} (${duration.toFixed(1)}ms)`;

  if (duration > thresholds.asyncOperationError) {
    logger.warn(message);
  } else {
    logger.performance(message);
  }
}
