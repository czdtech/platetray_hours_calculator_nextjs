'use client';

import CalculatorPageOptimized from '@/app/CalculatorPageOptimized';
import { ServerCurrentHourPayload } from '@/utils/planetaryHourHelpers';
import { PlanetaryHoursCalculationResult } from '@/services/PlanetaryHoursCalculator';
import dynamic from 'next/dynamic';

// 动态加载缓存监控组件（仅在客户端）
const CacheMonitorComponent = dynamic(
  () => import('@/components/Performance/CacheMonitor'),
  { ssr: false }
);

interface Props {
  precomputed?: PlanetaryHoursCalculationResult | null;
  initialHour?: ServerCurrentHourPayload | null;
  serverTime?: string;
}

export default function CalculatorClient({ precomputed, initialHour, serverTime }: Props) {
  return (
    <>
      <CalculatorPageOptimized
        precomputed={precomputed}
        initialHour={initialHour}
        serverTime={serverTime}
      />

      {/* 缓存监控组件（仅在开发模式显示） */}
      {process.env.NODE_ENV === 'development' && (
        <CacheMonitorComponent />
      )}
    </>
  );
}
