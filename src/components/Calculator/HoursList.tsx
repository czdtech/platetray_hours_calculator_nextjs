'use client';

import { useState } from 'react';
import { FormattedPlanetaryHour } from '@/utils/planetaryHourFormatters';
import { HourItem } from './HourItem';

interface HoursListProps {
  title: string;
  hours: FormattedPlanetaryHour[];
  planetColors: Record<string, string>;
  planetSymbols: Record<string, string>;
  titleColor: string;
}

export function HoursList({
  title,
  hours,
  planetColors,
  planetSymbols,
  titleColor
}: HoursListProps) {
  const [openMobileIndex, setOpenMobileIndex] = useState<number | null>(null);

  const handleToggleMobile = (index: number) => {
    setOpenMobileIndex(prev => (prev === index ? null : index));
  };

  return (
    <div>
      <h3 className={`text-base font-medium ${titleColor} mb-3 pb-2 border-b border-gray-200 text-center`}>
        {title}
      </h3>
      <div className="space-y-3">
        {hours.map((hour, index) => (
          <HourItem
            key={index}
            hour={hour}
            index={index}
            planetColors={planetColors}
            planetSymbols={planetSymbols}
            isOpen={openMobileIndex === index}
            onToggle={handleToggleMobile}
          />
        ))}
      </div>
    </div>
  );
} 