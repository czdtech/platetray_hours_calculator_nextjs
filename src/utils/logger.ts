/**
 * 统一日志管理工具
 * 支持开发/生产环境的日志控制
 */

// 日志级别枚举
export enum LogLevel {
  DEBUG = 0,
  INFO = 1,
  WARN = 2,
  ERROR = 3,
  NONE = 4
}

// 日志配置接口
interface LoggerConfig {
  level: LogLevel;
  enableConsole: boolean;
  enablePerformance: boolean;
  enableDebug: boolean;
  prefix?: string;
}

// 环境变量读取函数（支持客户端和服务端）
function getEnvVar(name: string): string | undefined {
  // Next.js 会将 NEXT_PUBLIC_ 前缀的环境变量直接注入到 process.env 中
  // 无论是客户端还是服务端都可以直接通过 process.env 访问
  return process.env[name];
}

// 默认配置
const DEFAULT_CONFIG: LoggerConfig = {
  level: process.env.NODE_ENV === 'production' ? LogLevel.ERROR : LogLevel.DEBUG,
  enableConsole: process.env.NODE_ENV !== 'production',
  enablePerformance: process.env.NODE_ENV === 'development',
  enableDebug: process.env.NODE_ENV === 'development',
  prefix: ''
};

// 全局日志配置
let globalConfig: LoggerConfig = { ...DEFAULT_CONFIG };

// 环境变量控制（支持客户端和服务端）
function initializeConfig() {
  const envLogLevel = getEnvVar('NEXT_PUBLIC_LOG_LEVEL');
  const envEnableConsole = getEnvVar('NEXT_PUBLIC_ENABLE_CONSOLE_LOGS');
  const envEnablePerformance = getEnvVar('NEXT_PUBLIC_ENABLE_PERFORMANCE_LOGS');
  const envEnableDebug = getEnvVar('NEXT_PUBLIC_ENABLE_DEBUG_LOGS');
  
  if (envLogLevel) {
    globalConfig.level = parseInt(envLogLevel) as LogLevel;
  }
  if (envEnableConsole !== undefined) {
    globalConfig.enableConsole = envEnableConsole === 'true';
  }
  if (envEnablePerformance !== undefined) {
    globalConfig.enablePerformance = envEnablePerformance === 'true';
  }
  if (envEnableDebug !== undefined) {
    globalConfig.enableDebug = envEnableDebug === 'true';
  }
}

// 初始化配置
initializeConfig();

// 客户端环境下，在 DOM 加载后重新初始化（确保能读取到环境变量）
if (typeof window !== 'undefined') {
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeConfig);
  } else {
    // DOM 已经加载完成，立即初始化
    setTimeout(initializeConfig, 0);
  }
}

/**
 * 日志管理器类
 */
export class Logger {
  private config: LoggerConfig;
  private context: string;

  constructor(context: string = '', config?: Partial<LoggerConfig>) {
    this.context = context;
    this.config = { ...globalConfig, ...config };
  }

  /**
   * 设置全局日志配置
   */
  static setGlobalConfig(config: Partial<LoggerConfig>) {
    globalConfig = { ...globalConfig, ...config };
  }

  /**
   * 获取当前配置
   */
  static getGlobalConfig(): LoggerConfig {
    return { ...globalConfig };
  }

  /**
   * 一键禁用所有日志（生产环境）
   */
  static disableAll() {
    globalConfig = {
      level: LogLevel.NONE,
      enableConsole: false,
      enablePerformance: false,
      enableDebug: false,
      prefix: globalConfig.prefix
    };
  }

  /**
   * 一键启用所有日志（开发环境）
   */
  static enableAll() {
    globalConfig = {
      level: LogLevel.DEBUG,
      enableConsole: true,
      enablePerformance: true,
      enableDebug: true,
      prefix: globalConfig.prefix
    };
  }

  /**
   * 仅启用错误日志（生产环境推荐）
   */
  static enableErrorsOnly() {
    globalConfig = {
      level: LogLevel.ERROR,
      enableConsole: true,
      enablePerformance: false,
      enableDebug: false,
      prefix: globalConfig.prefix
    };
  }

  private formatMessage(level: string, message: string, ...args: any[]): [string, ...any[]] {
    const timestamp = new Date().toISOString().split('T')[1].split('.')[0];
    const prefix = this.config.prefix ? `[${this.config.prefix}] ` : '';
    const context = this.context ? `[${this.context}] ` : '';
    return [`${timestamp} ${prefix}${context}${message}`, ...args];
  }

  /**
   * 调试日志
   */
  debug(message: string, ...args: any[]) {
    if (globalConfig.enableConsole && LogLevel.DEBUG >= globalConfig.level && globalConfig.enableDebug) {
      console.log(...this.formatMessage('DEBUG', message, ...args));
    }
  }

  /**
   * 信息日志
   */
  info(message: string, ...args: any[]) {
    if (globalConfig.enableConsole && LogLevel.INFO >= globalConfig.level) {
      console.log(...this.formatMessage('INFO', message, ...args));
    }
  }

  /**
   * 警告日志
   */
  warn(message: string, ...args: any[]) {
    if (globalConfig.enableConsole && LogLevel.WARN >= globalConfig.level) {
      console.warn(...this.formatMessage('WARN', message, ...args));
    }
  }

  /**
   * 错误日志
   */
  error(message: string, ...args: any[]) {
    if (globalConfig.enableConsole && LogLevel.ERROR >= globalConfig.level) {
      console.error(...this.formatMessage('ERROR', message, ...args));
    }
  }

  /**
   * 性能日志
   */
  performance(message: string, ...args: any[]) {
    if (globalConfig.enablePerformance && globalConfig.enableConsole && LogLevel.INFO >= globalConfig.level) {
      console.log(...this.formatMessage('PERF', `⚡ ${message}`, ...args));
    }
  }

  /**
   * 计时开始
   */
  time(label: string) {
    if (this.config.enablePerformance) {
      console.time(`${this.context ? `[${this.context}] ` : ''}${label}`);
    }
  }

  /**
   * 计时结束
   */
  timeEnd(label: string) {
    if (this.config.enablePerformance) {
      console.timeEnd(`${this.context ? `[${this.context}] ` : ''}${label}`);
    }
  }

  /**
   * 分组开始
   */
  group(label: string) {
    if (globalConfig.enableConsole && LogLevel.DEBUG >= globalConfig.level && globalConfig.enableDebug) {
      console.group(label);
    }
  }

  /**
   * 分组结束
   */
  groupEnd() {
    if (globalConfig.enableConsole && LogLevel.DEBUG >= globalConfig.level && globalConfig.enableDebug) {
      console.groupEnd();
    }
  }
}

/**
 * 创建带上下文的日志器
 */
export function createLogger(context: string, config?: Partial<LoggerConfig>): Logger {
  return new Logger(context, config);
}

/**
 * 默认日志器实例
 */
export const logger = new Logger();

/**
 * 快捷方法 - 用于替换现有的 console.log
 */
export const log = {
  debug: (message: string, ...args: any[]) => logger.debug(message, ...args),
  info: (message: string, ...args: any[]) => logger.info(message, ...args),
  warn: (message: string, ...args: any[]) => logger.warn(message, ...args),
  error: (message: string, ...args: any[]) => logger.error(message, ...args),
  performance: (message: string, ...args: any[]) => logger.performance(message, ...args),
};

/**
 * 环境检测工具
 */
export const isDevelopment = process.env.NODE_ENV === 'development';
export const isProduction = process.env.NODE_ENV === 'production';

/**
 * 条件日志 - 仅在开发环境执行
 */
export function devLog(fn: () => void) {
  if (isDevelopment && globalConfig.enableDebug) {
    fn();
  }
}

/**
 * 条件日志 - 仅在生产环境执行
 */
export function prodLog(fn: () => void) {
  if (isProduction && globalConfig.enableConsole) {
    fn();
  }
}

// 在生产环境自动禁用所有日志
if (isProduction) {
  Logger.enableErrorsOnly();
}

// 开发环境下的全局日志控制
if (isDevelopment && typeof window !== 'undefined') {
  // 添加全局控制方法到 window 对象，方便调试
  (window as { loggerControl?: unknown }).loggerControl = {
    enableAll: () => Logger.enableAll(),
    disableAll: () => Logger.disableAll(),
    enableErrorsOnly: () => Logger.enableErrorsOnly(),
    getConfig: () => Logger.getGlobalConfig(),
    setConfig: (config: Partial<LoggerConfig>) => Logger.setGlobalConfig(config)
  };
}
