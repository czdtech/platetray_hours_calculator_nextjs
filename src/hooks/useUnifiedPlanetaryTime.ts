/**
 * 统一行星时状态管理Hook
 *
 * 整合精确定时器、预加载机制和多组件状态同步，
 * 实现第二阶段的核心功能：精确实时同步机制
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { PlanetaryHoursCalculationResult, PlanetaryHour } from '@/services/PlanetaryHoursCalculator';
import { FormattedPlanetaryHour, formatSingleHour } from '@/utils/planetaryHourFormatters';
import { usePreciseTimer, PreciseTimerConfig } from './usePreciseTimer';
import { createLogger } from '@/utils/unified-logger';

const logger = createLogger('UnifiedPlanetaryTime');

export interface UnifiedPlanetaryTimeConfig {
  /** 行星时数据 */
  planetaryData: PlanetaryHoursCalculationResult | null;
  /** 时区 */
  timezone: string;
  /** 时间格式 */
  timeFormat: '12h' | '24h';
  /** 是否启用精确同步 */
  enablePreciseSync?: boolean;
  /** 精确定时器配置 */
  timerConfig?: Partial<PreciseTimerConfig>;
}

export interface UnifiedPlanetaryTimeState {
  /** 当前行星时信息（格式化后） */
  currentHour: FormattedPlanetaryHour | null;
  /** 当前行星时原始数据 */
  currentHourRaw: PlanetaryHour | null;
  /** 当前行星时索引 */
  currentHourIndex: number;
  /** 到下一次切换的剩余毫秒数 */
  remainingMs: number;
  /** 下一个行星时信息（预加载） */
  nextHour: FormattedPlanetaryHour | null;
  /** 是否处于切换预备期 */
  isPreloadPeriod: boolean;
  /** 切换动画状态 */
  isSwitching: boolean;
  /** 当前时间 */
  currentTime: Date;
  /** 同步状态 */
  syncStatus: 'synced' | 'syncing' | 'drift' | 'error';
  /** 调试信息 */
  debug: {
    timerRunning: boolean;
    lastSwitchTime: Date | null;
    switchCount: number;
    averageDrift: number;
  };
}

/**
 * 统一行星时状态管理Hook
 *
 * 提供完整的行星时状态管理，包括：
 * - 精确的切换时机计算
 * - 预加载下一个行星时
 * - 多组件状态同步
 * - 切换动画协调
 * - 性能监控和调试
 */
export function useUnifiedPlanetaryTime(config: UnifiedPlanetaryTimeConfig): UnifiedPlanetaryTimeState {
  const {
    planetaryData,
    timezone,
    timeFormat,
    enablePreciseSync = true,
    timerConfig = {}
  } = config;

  // 状态管理
  const [state, setState] = useState<UnifiedPlanetaryTimeState>({
    currentHour: null,
    currentHourRaw: null,
    currentHourIndex: -1,
    remainingMs: 0,
    nextHour: null,
    isPreloadPeriod: false,
    isSwitching: false,
    currentTime: new Date(),
    syncStatus: 'synced',
    debug: {
      timerRunning: false,
      lastSwitchTime: null,
      switchCount: 0,
      averageDrift: 0
    }
  });

  // 引用状态（避免重新渲染）
  const driftHistoryRef = useRef<number[]>([]);
  const lastIndexRef = useRef<number>(-1);
  const switchCountRef = useRef<number>(0);
  const preloadCacheRef = useRef<Map<number, FormattedPlanetaryHour>>(new Map());

  // 精确定时器
  const timerResult = usePreciseTimer({
    planetaryData,
    enabled: enablePreciseSync,
    ...timerConfig
  });

  /**
   * 格式化行星时信息
   */
  const formatHour = useCallback((hour: PlanetaryHour | null, isCurrent: boolean = false): FormattedPlanetaryHour | null => {
    if (!hour || !timezone) return null;

    return formatSingleHour(hour, timezone, timeFormat, isCurrent);
  }, [timezone, timeFormat]);

  /**
   * 预加载下一个行星时
   */
  const preloadNextHour = useCallback((currentIndex: number): FormattedPlanetaryHour | null => {
    if (!planetaryData || currentIndex < 0) return null;

    const nextIndex = currentIndex + 1;

    // 检查缓存
    if (preloadCacheRef.current.has(nextIndex)) {
      return preloadCacheRef.current.get(nextIndex)!;
    }

    // 计算下一个行星时
    let nextHour: PlanetaryHour | null = null;

    if (nextIndex < planetaryData.planetaryHours.length) {
      nextHour = planetaryData.planetaryHours[nextIndex];
    } else {
      // 如果是最后一个行星时，下一个应该是明天的第一个
      // 这里暂时返回null，实际项目中可能需要预取明天的数据
      logger.info('到达最后一个行星时，需要预取明天数据');
      return null;
    }

    const formatted = formatHour(nextHour, false);

    // 缓存结果
    if (formatted) {
      preloadCacheRef.current.set(nextIndex, formatted);
    }

    return formatted;
  }, [planetaryData, formatHour]);

  /**
   * 计算当前状态
   */
  const calculateCurrentState = useCallback((): Partial<UnifiedPlanetaryTimeState> => {
    if (!planetaryData || !timerResult) {
      return {
        currentHour: null,
        currentHourRaw: null,
        currentHourIndex: -1,
        remainingMs: 0,
        nextHour: null,
        isPreloadPeriod: false,
        syncStatus: 'error'
      };
    }

    const { currentHourIndex, remainingMs, isPreloadPeriod, currentTime } = timerResult;

    // 获取当前行星时
    let currentHourRaw: PlanetaryHour | null = null;
    if (currentHourIndex >= 0 && currentHourIndex < planetaryData.planetaryHours.length) {
      currentHourRaw = planetaryData.planetaryHours[currentHourIndex];
    }

    const currentHour = formatHour(currentHourRaw, true);

    // 预加载下一个行星时
    const nextHour = isPreloadPeriod ? preloadNextHour(currentHourIndex) : null;

    // 检测是否发生了切换
    const isSwitching = lastIndexRef.current !== -1 &&
                       lastIndexRef.current !== currentHourIndex &&
                       currentHourIndex !== -1;

    if (isSwitching) {
      switchCountRef.current++;
      logger.info('行星时切换检测', {
        from: lastIndexRef.current,
        to: currentHourIndex,
        planet: currentHourRaw?.ruler,
        switchCount: switchCountRef.current
      });
    }

    lastIndexRef.current = currentHourIndex;

    // 计算时间漂移
    const expectedTime = currentTime.getTime();
    const actualTime = Date.now();
    const drift = Math.abs(actualTime - expectedTime);

    // 记录漂移历史
    if (drift > 100) { // 只记录超过100ms的漂移
      driftHistoryRef.current.push(drift);
      if (driftHistoryRef.current.length > 10) {
        driftHistoryRef.current.shift(); // 保持最近10次记录
      }
    }

    const averageDrift = driftHistoryRef.current.length > 0
      ? driftHistoryRef.current.reduce((a, b) => a + b, 0) / driftHistoryRef.current.length
      : 0;

    // 确定同步状态
    let syncStatus: UnifiedPlanetaryTimeState['syncStatus'] = 'synced';
    if (drift > 5000) {
      syncStatus = 'error';
    } else if (drift > 1000) {
      syncStatus = 'drift';
    } else if (isSwitching) {
      syncStatus = 'syncing';
    }

    return {
      currentHour,
      currentHourRaw,
      currentHourIndex,
      remainingMs,
      nextHour,
      isPreloadPeriod,
      isSwitching,
      currentTime,
      syncStatus,
      debug: {
        timerRunning: timerResult.isRunning,
        lastSwitchTime: isSwitching ? currentTime : state.debug.lastSwitchTime,
        switchCount: switchCountRef.current,
        averageDrift
      }
    };
  }, [planetaryData, timerResult, formatHour, preloadNextHour, state.debug.lastSwitchTime]);

  /**
   * 清理预加载缓存
   */
  const clearPreloadCache = useCallback(() => {
    preloadCacheRef.current.clear();
    logger.info('清理预加载缓存');
  }, []);

  // 响应定时器状态变化
  useEffect(() => {
    const newState = calculateCurrentState();
    setState(prev => ({ ...prev, ...newState }));
  }, [timerResult, calculateCurrentState]);

  // 数据变化时清理缓存
  useEffect(() => {
    clearPreloadCache();
    lastIndexRef.current = -1;
    switchCountRef.current = 0;
    driftHistoryRef.current = [];
  }, [planetaryData, clearPreloadCache]);

  // 切换动画的自动重置
  useEffect(() => {
    if (state.isSwitching) {
      // 切换动画持续1秒后自动重置
      const timer = setTimeout(() => {
        setState(prev => ({ ...prev, isSwitching: false }));
      }, 1000);

      return () => clearTimeout(timer);
    }
  }, [state.isSwitching]);

  // 性能监控日志
  useEffect(() => {
    if (enablePreciseSync) {
      const logInterval = setInterval(() => {
        logger.info('行星时状态监控', {
          currentPlanet: state.currentHour?.planet,
          remainingMs: state.remainingMs,
          syncStatus: state.syncStatus,
          switchCount: state.debug.switchCount,
          averageDrift: Math.round(state.debug.averageDrift),
          preloadCacheSize: preloadCacheRef.current.size
        });
      }, 60000); // 每分钟记录一次

      return () => clearInterval(logInterval);
    }
  }, [enablePreciseSync, state]);

  return state;
}
