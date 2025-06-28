'use client';

import CalculatorPageOptimized from '@/app/CalculatorPageOptimized';
import { ServerCurrentHourPayload } from '@/utils/planetaryHourHelpers';
import { PlanetaryHoursCalculationResult } from '@/services/PlanetaryHoursCalculator';

interface Props {
  precomputed?: PlanetaryHoursCalculationResult | null;
  initialHour?: ServerCurrentHourPayload | null;
  serverTime?: string;
}

export default function CalculatorClient({ precomputed, initialHour, serverTime }: Props) {
  return <CalculatorPageOptimized precomputed={precomputed} initialHour={initialHour} serverTime={serverTime} />;
}
