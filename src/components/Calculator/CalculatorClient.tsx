'use client';

import CalculatorPageOptimized from '@/app/CalculatorPageOptimized';
import { ServerCurrentHourPayload } from '@/utils/planetaryHourHelpers';
import { PlanetaryHoursCalculationResult } from '@/services/PlanetaryHoursCalculator';
import { TTLCalculationResult } from '@/utils/cache/dynamicTTL';
import type { Locale } from '@/i18n/config';

interface Props {
  precomputed?: PlanetaryHoursCalculationResult | null;
  calculationResult?: PlanetaryHoursCalculationResult | null;
  initialHour?: ServerCurrentHourPayload | null;
  initialHourPayload?: ServerCurrentHourPayload | null;
  serverTime?: string;
  cacheControl?: string;
  ttlInfo?: TTLCalculationResult;
  error?: string;
  locale?: Locale;
}

export default function CalculatorClient({
  precomputed,
  calculationResult,
  initialHour,
  initialHourPayload,
  serverTime,
  cacheControl,
  ttlInfo,
  error,
  locale = 'en',
}: Props) {
  // 优先使用新的参数，保持向后兼容
  const effectiveCalculationResult = calculationResult || precomputed;
  const effectiveInitialHour = initialHourPayload || initialHour;

  return (
    <CalculatorPageOptimized
      precomputed={effectiveCalculationResult}
      initialHour={effectiveInitialHour}
      serverTime={serverTime}
      cacheControl={cacheControl}
      ttlInfo={ttlInfo}
      error={error}
      locale={locale}
    />
  );
}
