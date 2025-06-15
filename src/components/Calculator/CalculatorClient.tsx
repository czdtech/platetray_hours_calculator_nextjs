'use client';

import CalculatorPageOptimized from '@/app/CalculatorPageOptimized';
import { ServerCurrentHourPayload } from '@/utils/planetaryHourHelpers';

interface Props {
  precomputed?: any;
  initialHour?: ServerCurrentHourPayload | null;
}

export default function CalculatorClient({ precomputed, initialHour }: Props) {
  return <CalculatorPageOptimized precomputed={precomputed} initialHour={initialHour} />;
}
