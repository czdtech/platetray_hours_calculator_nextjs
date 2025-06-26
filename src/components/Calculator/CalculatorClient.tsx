'use client';

import CalculatorPageOptimized from '@/app/CalculatorPageOptimized';
import { ServerCurrentHourPayload } from '@/utils/planetaryHourHelpers';
import { PlanetaryHoursCalculationResult } from '@/services/PlanetaryHoursCalculator';

interface Props {
  precomputed?: PlanetaryHoursCalculationResult | null;
  initialHour?: ServerCurrentHourPayload | null;
}

export default function CalculatorClient({ precomputed, initialHour }: Props) {
  return <CalculatorPageOptimized precomputed={precomputed} initialHour={initialHour} />;
}
