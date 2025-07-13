/**
 * 高级行星时时钟Hook - 第三阶段完整实现
 *
 * 集成了前两个阶段的所有功能，并新增：
 * - 跨日边界无缝处理
 * - 多日数据缓存管理
 * - 智能数据预取
 * - 完整的错误和性能监控
 */

import { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { useCurrentLivePlanetaryHour } from './useCurrentLivePlanetaryHour';
import { useCrossDateTransition, useMergedCrossDateData } from './useCrossDateTransition';
import { PlanetaryHoursCalculationResult, PlanetaryHour } from '@/services/PlanetaryHoursCalculator';
import { createLogger } from '@/utils/unified-logger';

const logger = createLogger('AdvancedPlanetaryTimeClock');

export interface AdvancedClockConfig {
  /** 行星时数据 */
  data: PlanetaryHoursCalculationResult | null;
  /** 坐标信息 */
  coordinates: {
    latitude: number;
    longitude: number;
  } | null;
  /** 当前日期 */
  currentDate: Date | null;
  /** 是否启用跨日处理 */
  enableCrossDate?: boolean;
  /** 是否启用精确模式 */
  enablePreciseMode?: boolean;
  /** 预取阈值（毫秒） */
  prefetchThresholdMs?: number;
}

export interface AdvancedClockState {
  /** 当前行星时信息 */
  currentHour: PlanetaryHour | null;
  /** 下一个行星时信息 */
  nextHour: PlanetaryHour | null;
  /** 当前时间 */
  currentTime: Date;
  /** 到下一个行星时的剩余时间（毫秒） */
  timeUntilNext: number;
  /** 当前行星时的进度百分比（0-100） */
  progressPercent: number;
  /** 是否正在切换中 */
  isTransitioning: boolean;

  /** 跨日处理状态 */
  crossDateInfo: {
    /** 当前使用的数据源 */
    activeDataSource: 'today' | 'tomorrow' | 'yesterday';
    /** 是否处于跨日敏感期 */
    isCrossDateSensitive: boolean;
    /** 是否正在预取明日数据 */
    isPrefetchingTomorrow: boolean;
    /** 明日数据是否可用 */
    tomorrowDataAvailable: boolean;
    /** 昨日数据是否可用 */
    yesterdayDataAvailable: boolean;
    /** 缓存统计 */
    cacheStats: {
      totalDays: number;
      memoryUsage: number; // KB
      lastCleanup: Date | null;
    };
  };

  /** 系统状态 */
  systemInfo: {
    /** 工作模式 */
    mode: 'precise' | 'standard';
    /** 在线状态 */
    isOnline: boolean;
    /** 最后更新时间 */
    lastUpdate: Date;
    /** 错误信息 */
    errors: string[];
    /** 警告信息 */
    warnings: string[];
    /** 是否有活跃问题 */
    hasIssues: boolean;
  };
}

/**
 * 高级行星时时钟Hook
 */
export function useAdvancedPlanetaryTimeClock(config: AdvancedClockConfig): AdvancedClockState {
  const {
    data,
    coordinates,
    currentDate,
    enableCrossDate = true,
    enablePreciseMode = true,
    prefetchThresholdMs = 30 * 60 * 1000 // 30分钟
  } = config;

  // 状态管理
  const [errors, setErrors] = useState<string[]>([]);
  const [warnings, setWarnings] = useState<string[]>([]);
  const [isOnline, setIsOnline] = useState(typeof navigator !== 'undefined' ? navigator.onLine : true);

  // 上次更新时间
  const lastUpdateRef = useRef<Date>(new Date());

  // 跨日边界处理
  const crossDateTransition = useCrossDateTransition({
    currentData: data,
    coordinates,
    currentDate,
    enabled: enableCrossDate,
    prefetchThresholdMs
  });

  // 获取合并后的数据（包含跨日处理）
  const mergedData = useMergedCrossDateData(data, crossDateTransition);

    // 当前时间状态
  const [currentTime, setCurrentTime] = useState(new Date());
  const [currentHour, setCurrentHour] = useState<PlanetaryHour | null>(null);
  const [timeUntilNext, setTimeUntilNext] = useState<number>(0);

  // 定时器引用
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // 计算当前状态的核心逻辑
  const calculateCurrentState = useCallback(() => {
    if (!mergedData) return;

    const now = new Date();
    setCurrentTime(now);

    // 使用planetaryHoursCalculator直接计算当前行星时
    const current = mergedData.planetaryHours.find(
      hour => now >= hour.startTime && now < hour.endTime
    );

    if (current) {
      setCurrentHour(current);
      setTimeUntilNext(current.endTime.getTime() - now.getTime());
    } else {
      // 如果不在任何行星时内，找到下一个行星时
      const nextHour = mergedData.planetaryHours.find(
        hour => now < hour.startTime
      );

      if (nextHour) {
        setCurrentHour(null);
        setTimeUntilNext(nextHour.startTime.getTime() - now.getTime());
      } else {
        // 可能在最后一个行星时之后，需要明日数据
        setCurrentHour(null);
        setTimeUntilNext(0);
      }
    }
  }, [mergedData]);

  // 启动定时更新
  useEffect(() => {
    if (!mergedData) return;

    // 立即计算一次
    calculateCurrentState();

    // 设置定时器
    const updateInterval = enablePreciseMode ? 1000 : 60000; // 精确模式1秒，标准模式1分钟

    timerRef.current = setInterval(calculateCurrentState, updateInterval);

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    };
  }, [mergedData, calculateCurrentState, enablePreciseMode]);

  // 在线状态检测
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // 错误处理
  const addError = useCallback((error: string) => {
    setErrors(prev => {
      const newErrors = [...prev, error];
      return newErrors.slice(-5); // 最多保留5个错误
    });
    logger.error('系统错误', new Error(error));
  }, []);

  const addWarning = useCallback((warning: string) => {
    setWarnings(prev => {
      const newWarnings = [...prev, warning];
      return newWarnings.slice(-5); // 最多保留5个警告
    });
    logger.warn('系统警告', { warning });
  }, []);

  // 监控跨日处理错误
  useEffect(() => {
    if (crossDateTransition.error) {
      addError(`跨日处理错误: ${crossDateTransition.error}`);
    }
  }, [crossDateTransition.error, addError]);

  // 监控数据源切换
  const activeDataSource = useMemo((): 'today' | 'tomorrow' | 'yesterday' => {
    if (!data || !mergedData) return 'today';

    if (mergedData === crossDateTransition.tomorrowData) return 'tomorrow';
    if (mergedData === crossDateTransition.yesterdayData) return 'yesterday';
    return 'today';
  }, [data, mergedData, crossDateTransition.tomorrowData, crossDateTransition.yesterdayData]);

  // 记录数据源切换
  useEffect(() => {
    if (activeDataSource !== 'today') {
      logger.info('跨日数据源切换', {
        source: activeDataSource,
        time: new Date().toISOString()
      });
    }
  }, [activeDataSource]);

  // 计算进度百分比
  const progressPercent = useMemo(() => {
    if (!currentHour || timeUntilNext <= 0) return 0;

    const totalDuration = currentHour.endTime.getTime() - currentHour.startTime.getTime();
    const elapsed = totalDuration - timeUntilNext;

    return Math.max(0, Math.min(100, (elapsed / totalDuration) * 100));
  }, [currentHour, timeUntilNext]);

  // 检测切换状态
  const isTransitioning = useMemo(() => {
    return timeUntilNext > 0 && timeUntilNext <= 3000; // 切换前3秒
  }, [timeUntilNext]);

  // 获取下一个行星时
  const nextHour = useMemo((): PlanetaryHour | null => {
    if (!mergedData || !currentHour) return null;

    const currentIndex = mergedData.planetaryHours.findIndex(
      hour => hour.hourNumberOverall === currentHour.hourNumberOverall
    );

    if (currentIndex === -1 || currentIndex >= mergedData.planetaryHours.length - 1) {
      // 如果是最后一个行星时，尝试从明日数据获取第一个
      if (crossDateTransition.tomorrowData && crossDateTransition.tomorrowData.planetaryHours.length > 0) {
        return crossDateTransition.tomorrowData.planetaryHours[0];
      }
      return null;
    }

    return mergedData.planetaryHours[currentIndex + 1];
  }, [mergedData, currentHour, crossDateTransition.tomorrowData]);

  // 更新时间追踪
  useEffect(() => {
    lastUpdateRef.current = new Date();
  }, [currentHour, currentTime]);

  // 组装最终状态
  const advancedState: AdvancedClockState = useMemo(() => ({
    currentHour,
    nextHour,
    currentTime,
    timeUntilNext,
    progressPercent,
    isTransitioning,

    crossDateInfo: {
      activeDataSource,
      isCrossDateSensitive: crossDateTransition.isCrossDateSensitive,
      isPrefetchingTomorrow: crossDateTransition.isPrefetchingTomorrow,
      tomorrowDataAvailable: !!crossDateTransition.tomorrowData,
      yesterdayDataAvailable: !!crossDateTransition.yesterdayData,
      cacheStats: crossDateTransition.cacheStats
    },

    systemInfo: {
      mode: enablePreciseMode ? 'precise' : 'standard',
      isOnline,
      lastUpdate: lastUpdateRef.current,
      errors,
      warnings,
      hasIssues: errors.length > 0 || warnings.length > 0
    }
  }), [
    currentHour,
    nextHour,
    currentTime,
    timeUntilNext,
    progressPercent,
    isTransitioning,
    activeDataSource,
    crossDateTransition,
    enablePreciseMode,
    isOnline,
    errors,
    warnings
  ]);

  // 调试日志
  useEffect(() => {
    if (enablePreciseMode) {
      logger.info('高级时钟状态', {
        currentPlanet: advancedState.currentHour?.ruler,
        activeDataSource: advancedState.crossDateInfo.activeDataSource,
        mode: advancedState.systemInfo.mode,
        timeUntilNext: Math.round(advancedState.timeUntilNext / 1000),
        isCrossDateSensitive: advancedState.crossDateInfo.isCrossDateSensitive,
        cacheStats: advancedState.crossDateInfo.cacheStats
      });
    }
  }, [advancedState, enablePreciseMode]);

  return advancedState;
}

/**
 * 简化版Hook：仅启用基本的跨日处理
 */
export function useBasicCrossDateClock(
  data: PlanetaryHoursCalculationResult | null,
  coordinates: { latitude: number; longitude: number } | null,
  currentDate: Date | null
) {
  return useAdvancedPlanetaryTimeClock({
    data,
    coordinates,
    currentDate,
    enableCrossDate: true,
    enablePreciseMode: false
  });
}

/**
 * 完整版Hook：启用所有高级功能
 */
export function useFullFeaturedClock(
  data: PlanetaryHoursCalculationResult | null,
  coordinates: { latitude: number; longitude: number } | null,
  currentDate: Date | null
) {
  return useAdvancedPlanetaryTimeClock({
    data,
    coordinates,
    currentDate,
    enableCrossDate: true,
    enablePreciseMode: true,
    prefetchThresholdMs: 30 * 60 * 1000 // 30分钟预取
  });
}
