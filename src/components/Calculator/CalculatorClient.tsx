'use client';

import CalculatorPageOptimized from '@/app/CalculatorPageOptimized';
import { ServerCurrentHourPayload } from '@/utils/planetaryHourHelpers';
import { PlanetaryHoursCalculationResult } from '@/services/PlanetaryHoursCalculator';
import { TTLCalculationResult } from '@/utils/cache/dynamicTTL';
import dynamic from 'next/dynamic';

// 动态加载缓存监控组件（仅在客户端）
const CacheMonitorComponent = dynamic(
  () => import('@/components/Performance/CacheMonitor'),
  { ssr: false }
);

interface Props {
  precomputed?: PlanetaryHoursCalculationResult | null;
  calculationResult?: PlanetaryHoursCalculationResult | null;
  initialHour?: ServerCurrentHourPayload | null;
  initialHourPayload?: ServerCurrentHourPayload | null;
  serverTime?: string;
  cacheControl?: string;
  ttlInfo?: TTLCalculationResult;
  error?: string;
}

export default function CalculatorClient({
  precomputed,
  calculationResult,
  initialHour,
  initialHourPayload,
  serverTime,
  cacheControl,
  ttlInfo,
  error
}: Props) {
  // 优先使用新的参数，保持向后兼容
  const effectiveCalculationResult = calculationResult || precomputed;
  const effectiveInitialHour = initialHourPayload || initialHour;

  return (
    <>
      <CalculatorPageOptimized
        precomputed={effectiveCalculationResult}
        initialHour={effectiveInitialHour}
        serverTime={serverTime}
        cacheControl={cacheControl}
        ttlInfo={ttlInfo}
        error={error}
      />

      {/* 缓存监控组件（仅在开发模式显示） */}
      {process.env.NODE_ENV === 'development' && (
        <CacheMonitorComponent />
      )}
    </>
  );
}
