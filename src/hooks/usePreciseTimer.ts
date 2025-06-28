/**
 * 精确定时器Hook
 *
 * 用于精确计算到下一个行星时切换点的时间，
 * 实现毫秒级准确的定时器，替代粗糙的轮询机制
 */

import { useEffect, useRef, useCallback, useState } from 'react';
import { PlanetaryHoursCalculationResult } from '@/services/PlanetaryHoursCalculator';
import { createLogger } from '@/utils/unified-logger';

const logger = createLogger('PreciseTimer');

export interface PreciseTimerConfig {
  /** 行星时数据 */
  planetaryData: PlanetaryHoursCalculationResult | null;
  /** 是否启用定时器 */
  enabled: boolean;
  /** 切换前多少毫秒开始预加载 (默认30秒) */
  preloadMs?: number;
  /** 时间同步校正间隔 (默认5分钟) */
  syncIntervalMs?: number;
  /** 最小定时器间隔，防止过于频繁的更新 (默认100ms) */
  minIntervalMs?: number;
}

export interface PreciseTimerResult {
  /** 到下一次切换的剩余毫秒数 */
  remainingMs: number;
  /** 当前行星时索引 */
  currentHourIndex: number;
  /** 下一个行星时的开始时间 */
  nextSwitchTime: Date | null;
  /** 是否处于预加载期 */
  isPreloadPeriod: boolean;
  /** 当前时间（用于调试） */
  currentTime: Date;
  /** 定时器是否运行中 */
  isRunning: boolean;
}

const DEFAULT_CONFIG = {
  preloadMs: 30 * 1000, // 30秒预加载
  syncIntervalMs: 5 * 60 * 1000, // 5分钟时间同步
  minIntervalMs: 100, // 最小100ms间隔
} as const;

/**
 * 精确定时器Hook
 *
 * 使用动态计算的方式，精确到毫秒级别跟踪行星时切换
 */
export function usePreciseTimer(config: PreciseTimerConfig): PreciseTimerResult {
  const {
    planetaryData,
    enabled,
    preloadMs = DEFAULT_CONFIG.preloadMs,
    syncIntervalMs = DEFAULT_CONFIG.syncIntervalMs,
    minIntervalMs = DEFAULT_CONFIG.minIntervalMs
  } = config;

  const [result, setResult] = useState<PreciseTimerResult>({
    remainingMs: 0,
    currentHourIndex: -1,
    nextSwitchTime: null,
    isPreloadPeriod: false,
    currentTime: new Date(),
    isRunning: false
  });

  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const syncTimerRef = useRef<NodeJS.Timeout | null>(null);
  const lastSyncTimeRef = useRef<number>(0);
  const expectedTickTimeRef = useRef<number>(0);

  /**
   * 计算当前状态
   */
  const calculateCurrentState = useCallback((currentTime?: Date): PreciseTimerResult => {
    const now = currentTime || new Date();
    const nowMs = now.getTime();

    if (!planetaryData || !planetaryData.planetaryHours.length) {
      return {
        remainingMs: 0,
        currentHourIndex: -1,
        nextSwitchTime: null,
        isPreloadPeriod: false,
        currentTime: now,
        isRunning: false
      };
    }

    const { planetaryHours } = planetaryData;

    // 找到当前行星时
    const currentHourIndex = planetaryHours.findIndex(
      hour => nowMs >= hour.startTime.getTime() && nowMs < hour.endTime.getTime()
    );

    let nextSwitchTime: Date | null = null;
    let remainingMs = 0;

    if (currentHourIndex !== -1) {
      // 在某个行星时内
      if (currentHourIndex < planetaryHours.length - 1) {
        // 还有下一个行星时
        nextSwitchTime = planetaryHours[currentHourIndex + 1].startTime;
      } else {
        // 当前是最后一个行星时，下一次切换是明天第一个行星时
        // 估算：24小时后（这是个近似值，实际应该预取明天的数据）
        nextSwitchTime = new Date(nowMs + 24 * 60 * 60 * 1000);
      }
      remainingMs = nextSwitchTime.getTime() - nowMs;
    } else {
      // 不在任何行星时内（可能在第一个行星时之前）
      const firstHour = planetaryHours[0];
      if (firstHour && nowMs < firstHour.startTime.getTime()) {
        nextSwitchTime = firstHour.startTime;
        remainingMs = nextSwitchTime.getTime() - nowMs;
      } else {
        // 在最后一个行星时之后
        nextSwitchTime = new Date(nowMs + 24 * 60 * 60 * 1000);
        remainingMs = nextSwitchTime.getTime() - nowMs;
      }
    }

    const isPreloadPeriod = remainingMs <= preloadMs && remainingMs > 0;

    return {
      remainingMs: Math.max(0, remainingMs),
      currentHourIndex,
      nextSwitchTime,
      isPreloadPeriod,
      currentTime: now,
      isRunning: enabled
    };
  }, [planetaryData, preloadMs, enabled]);

  /**
   * 清理定时器
   */
  const clearTimers = useCallback(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
    if (syncTimerRef.current) {
      clearTimeout(syncTimerRef.current);
      syncTimerRef.current = null;
    }
  }, []);

  /**
   * 设置下一次定时器
   */
  const scheduleNextTick = useCallback((currentState: PreciseTimerResult) => {
    if (!enabled || !currentState.nextSwitchTime) {
      return;
    }

    const now = Date.now();
    const remainingMs = currentState.remainingMs;

    let nextTickDelay: number;

    if (remainingMs <= 0) {
      // 已经切换，立即更新
      nextTickDelay = 0;
    } else if (remainingMs <= 1000) {
      // 最后1秒，每100ms更新一次
      nextTickDelay = Math.max(minIntervalMs, 100);
    } else if (remainingMs <= 10000) {
      // 最后10秒，每500ms更新一次
      nextTickDelay = Math.max(minIntervalMs, 500);
    } else if (remainingMs <= 60000) {
      // 最后1分钟，每5秒更新一次
      nextTickDelay = Math.max(minIntervalMs, 5000);
    } else if (remainingMs <= 300000) {
      // 最后5分钟，每30秒更新一次
      nextTickDelay = Math.max(minIntervalMs, 30000);
    } else {
      // 超过5分钟，每分钟更新一次
      nextTickDelay = Math.max(minIntervalMs, 60000);
    }

    // 时间漂移补正
    if (expectedTickTimeRef.current > 0) {
      const actualDelay = now - expectedTickTimeRef.current;
      const drift = actualDelay - nextTickDelay;
      if (Math.abs(drift) > 50) { // 如果漂移超过50ms
        nextTickDelay = Math.max(minIntervalMs, nextTickDelay - drift);
        logger.info('定时器漂移补正', { drift, adjustedDelay: nextTickDelay });
      }
    }

    expectedTickTimeRef.current = now + nextTickDelay;

    timerRef.current = setTimeout(() => {
      const newState = calculateCurrentState();
      setResult(newState);

      // 递归调度下一次
      scheduleNextTick(newState);
    }, nextTickDelay);

    logger.info('调度下一次定时器', {
      remainingMs,
      nextTickDelay,
      nextTickTime: new Date(now + nextTickDelay).toISOString()
    });
  }, [enabled, calculateCurrentState, minIntervalMs]);

  /**
   * 时间同步校正
   */
  const performTimeSync = useCallback(() => {
    const now = Date.now();

    // 避免过于频繁的同步
    if (now - lastSyncTimeRef.current < syncIntervalMs) {
      return;
    }

    lastSyncTimeRef.current = now;

    logger.info('执行时间同步校正');

    // 重新计算当前状态
    const syncedState = calculateCurrentState();
    setResult(syncedState);

    // 清除现有定时器并重新调度
    clearTimers();
    scheduleNextTick(syncedState);

    // 设置下一次同步
    syncTimerRef.current = setTimeout(performTimeSync, syncIntervalMs);
  }, [syncIntervalMs, calculateCurrentState, clearTimers, scheduleNextTick]);

  /**
   * 启动定时器
   */
  const startTimer = useCallback(() => {
    if (!enabled || !planetaryData) {
      return;
    }

    logger.info('启动精确定时器', {
      preloadMs,
      syncIntervalMs,
      minIntervalMs
    });

    // 立即计算初始状态
    const initialState = calculateCurrentState();
    setResult(initialState);

    // 开始定时器循环
    scheduleNextTick(initialState);

    // 启动时间同步
    lastSyncTimeRef.current = Date.now();
    syncTimerRef.current = setTimeout(performTimeSync, syncIntervalMs);
  }, [enabled, planetaryData, calculateCurrentState, scheduleNextTick, performTimeSync, preloadMs, syncIntervalMs, minIntervalMs]);

  /**
   * 停止定时器
   */
  const stopTimer = useCallback(() => {
    logger.info('停止精确定时器');
    clearTimers();
    setResult(prev => ({ ...prev, isRunning: false }));
  }, [clearTimers]);

  // 主效果：启动/停止定时器
  useEffect(() => {
    if (enabled && planetaryData) {
      startTimer();
    } else {
      stopTimer();
    }

    return () => {
      stopTimer();
    };
  }, [enabled, planetaryData, startTimer, stopTimer]);

  // 清理效果
  useEffect(() => {
    return () => {
      clearTimers();
    };
  }, [clearTimers]);

  return result;
}
