'use client';

import CalculatorPageOptimized from '@/app/CalculatorPageOptimized';
import { ServerCurrentHourPayload } from '@/utils/planetaryHourHelpers';
import { PlanetaryHoursCalculationResult } from '@/services/PlanetaryHoursCalculator';
import { TTLCalculationResult } from '@/utils/cache/dynamicTTL';

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
    <CalculatorPageOptimized
      precomputed={effectiveCalculationResult}
      initialHour={effectiveInitialHour}
      serverTime={serverTime}
      _cacheControl={cacheControl}
      _ttlInfo={ttlInfo}
      _error={error}
    />
  );
}
