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
    debug: (message: string, ...args: unknown[]) => {
      if (isDev) {
        console.log(`🔍 ${prefix} ${message}`, ...args);
      }
    },

    // 重要信息 - 仅开发环境
    info: (message: string, ...args: unknown[]) => {
      if (isDev) {
        console.log(`ℹ️ ${prefix} ${message}`, ...args);
      }
    },

    // 警告信息 - 仅开发环境
    warn: (message: string, ...args: unknown[]) => {
      if (isDev) {
        console.warn(`⚠️ ${prefix} ${message}`, ...args);
      }
    },

    // 错误信息 - 所有环境（生产环境也需要错误日志）
    error: (message: string, error?: Error, ...args: unknown[]) => {
      console.error(`❌ ${prefix} ${message}`, error || '', ...args);
    },

    // 性能监控 - 仅开发环境
    performance: (message: string, duration?: number) => {
      if (isDev) {
        const durationStr = duration ? `: ${duration.toFixed(1)}ms` : '';
        console.log(`⚡ ${prefix} ${message}${durationStr}`);
      }
    },

    // 计算流程 - 仅开发环境
    process: (message: string, ...args: unknown[]) => {
      if (isDev) {
        console.log(`🔄 ${prefix} ${message}`, ...args);
      }
    },

    // 数据操作 - 仅开发环境
    data: (message: string, ...args: unknown[]) => {
      if (isDev) {
        console.log(`📋 ${prefix} ${message}`, ...args);
      }
    }
  };
}


/**
 * API路由专用日志器 - 简化版
 */
export const apiLogger = createLogger('API');
