/**
 * 统一日志系统 - 简洁实用版
 * 开发环境显示详细日志，生产环境自动优化
 */

const isDev = process.env.NODE_ENV === 'development';

/**
 * 创建带上下文的日志器
 * @param context 组件或模块名称
 */
export function createLogger(context: string) {
  const prefix = `[${context}]`;

  return {
    // 调试信息 - 仅开发环境
    debug: (message: string, ...args: any[]) => {
      if (isDev) {
        console.log(`🔍 ${prefix} ${message}`, ...args);
      }
    },

    // 重要信息 - 仅开发环境
    info: (message: string, ...args: any[]) => {
      if (isDev) {
        console.log(`ℹ️ ${prefix} ${message}`, ...args);
      }
    },

    // 警告信息 - 仅开发环境
    warn: (message: string, ...args: any[]) => {
      if (isDev) {
        console.warn(`⚠️ ${prefix} ${message}`, ...args);
      }
    },

    // 错误信息 - 所有环境（生产环境也需要错误日志）
    error: (message: string, error?: Error, ...args: any[]) => {
      console.error(`❌ ${prefix} ${message}`, error || '', ...args);
    },

    // 性能监控 - 仅开发环境
    performance: (message: string, duration?: number) => {
      if (isDev) {
        const durationStr = duration ? `: ${duration.toFixed(1)}ms` : '';
        console.log(`⚡ ${prefix} ${message}${durationStr}`);
      }
    },

    // 缓存操作 - 仅开发环境
    cache: (message: string, ...args: any[]) => {
      if (isDev) {
        console.log(`💾 ${prefix} ${message}`, ...args);
      }
    },

    // 网络请求 - 仅开发环境
    network: (message: string, ...args: any[]) => {
      if (isDev) {
        console.log(`🌐 ${prefix} ${message}`, ...args);
      }
    },

    // 计算流程 - 仅开发环境
    process: (message: string, ...args: any[]) => {
      if (isDev) {
        console.log(`🔄 ${prefix} ${message}`, ...args);
      }
    },

    // 数据操作 - 仅开发环境
    data: (message: string, ...args: any[]) => {
      if (isDev) {
        console.log(`📋 ${prefix} ${message}`, ...args);
      }
    },

    // 密钥/安全 - 仅开发环境
    key: (message: string, ...args: any[]) => {
      if (isDev) {
        console.log(`🔑 ${prefix} ${message}`, ...args);
      }
    }
  };
}

/**
 * 全局快捷日志方法（无上下文）
 */
export const log = {
  debug: (message: string, ...args: any[]) => {
    if (isDev) console.log(`🔍 ${message}`, ...args);
  },

  info: (message: string, ...args: any[]) => {
    if (isDev) console.log(`ℹ️ ${message}`, ...args);
  },

  warn: (message: string, ...args: any[]) => {
    if (isDev) console.warn(`⚠️ ${message}`, ...args);
  },

  error: (message: string, error?: Error, ...args: any[]) => {
    console.error(`❌ ${message}`, error || '', ...args);
  },

  performance: (message: string, duration?: number) => {
    if (isDev) {
      const durationStr = duration ? `: ${duration.toFixed(1)}ms` : '';
      console.log(`⚡ ${message}${durationStr}`);
    }
  }
};

/**
 * API路由专用日志器
 */
export const apiLogger = {
  request: (route: string, method: string, params?: any) => {
    if (isDev) {
      console.log(`🌐 [API] ${method} ${route}`, params || '');
    }
  },

  success: (route: string, duration: number, data?: any) => {
    if (isDev) {
      console.log(`✅ [API] ${route} 成功 (${duration.toFixed(1)}ms)`, data || '');
    }
  },

  error: (route: string, error: Error, duration?: number) => {
    const durationStr = duration ? ` (${duration.toFixed(1)}ms)` : '';
    console.error(`❌ [API] ${route} 失败${durationStr}`, error);
  }
};

/**
 * 性能测试工具
 * 使用统一的性能阈值配置
 */
export const perfTest = {
  // 测试函数执行时间
  measure: <T>(name: string, fn: () => T): T => {
    if (!isDev) return fn();

    const start = performance.now();
    const result = fn();
    const duration = performance.now() - start;

    // 动态导入配置以避免循环依赖
    import('@/config/seo-monitoring').then(({ getPerformanceLevel }) => {
      const { emoji } = getPerformanceLevel(duration, false);
      console.log(`${emoji} [性能测试] ${name}: ${duration.toFixed(1)}ms`);
    }).catch(() => {
      // 降级处理：使用固定阈值
      const emoji = duration < 50 ? '✅' : duration < 100 ? '⚠️' : '❌';
      console.log(`${emoji} [性能测试] ${name}: ${duration.toFixed(1)}ms`);
    });

    return result;
  },

  // 测试异步函数执行时间
  measureAsync: async <T>(name: string, fn: () => Promise<T>): Promise<T> => {
    if (!isDev) return await fn();

    const start = performance.now();
    const result = await fn();
    const duration = performance.now() - start;

    // 动态导入配置以避免循环依赖
    try {
      const { getPerformanceLevel } = await import('@/config/seo-monitoring');
      const { emoji } = getPerformanceLevel(duration, true);
      console.log(`${emoji} [异步性能测试] ${name}: ${duration.toFixed(1)}ms`);
    } catch {
      // 降级处理：使用固定阈值
      const emoji = duration < 100 ? '✅' : duration < 500 ? '⚠️' : '❌';
      console.log(`${emoji} [异步性能测试] ${name}: ${duration.toFixed(1)}ms`);
    }

    return result;
  },

  // 新增：快速性能检查工具
  check: (name: string, duration: number, isAsync: boolean = false) => {
    if (!isDev) return;

    import('@/config/seo-monitoring').then(({ getPerformanceLevel }) => {
      const { emoji, level } = getPerformanceLevel(duration, isAsync);
      const levelText = level === 'good' ? '良好' : level === 'warning' ? '警告' : '错误';
      console.log(`${emoji} [性能检查] ${name}: ${duration.toFixed(1)}ms (${levelText})`);
    }).catch(() => {
      // 降级处理
      const warningThreshold = isAsync ? 100 : 50;
      const errorThreshold = isAsync ? 500 : 100;
      const emoji = duration <= warningThreshold ? '✅' : duration <= errorThreshold ? '⚠️' : '❌';
      console.log(`${emoji} [性能检查] ${name}: ${duration.toFixed(1)}ms`);
    });
  }
};
