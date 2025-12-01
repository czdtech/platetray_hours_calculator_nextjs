"use client";

import { useState, memo, useCallback } from "react";
import { FormattedPlanetaryHour } from "@/utils/planetaryHourFormatters";
import { HourItem } from "./HourItem";

interface HoursListProps {
  title: string;
  hours: FormattedPlanetaryHour[];
  titleColor: string;
  showTitle?: boolean; // 控制是否显示标题
}

function HoursListComponent({ title, hours, titleColor, showTitle = true }: HoursListProps) {
  const [openMobileIndex, setOpenMobileIndex] = useState<number | null>(null);

  const handleToggleMobile = useCallback((index: number) => {
    setOpenMobileIndex((prev) => (prev === index ? null : index));
  }, []);

  return (
    <div>
      {/* 根据 showTitle 属性决定是否显示标题，移动端通过CSS隐藏 */}
      {showTitle && (
        <h3
          className={`hidden md:block text-base font-medium ${titleColor} mb-3 pb-2 border-b border-gray-200 dark:border-gray-700 text-center`}
        >
          {title}
        </h3>
      )}
      <div className="space-y-3">
        {hours.map((hour, index) => (
          <HourItem
            key={index}
            hour={hour}
            index={index}
            isOpen={openMobileIndex === index}
            onToggle={handleToggleMobile}
          />
        ))}
      </div>
    </div>
  );
}

// 使用 memo 优化组件，避免不必要的重渲染
export const HoursList = memo(HoursListComponent, (prevProps, nextProps) => {
  return (
    prevProps.title === nextProps.title &&
    prevProps.titleColor === nextProps.titleColor &&
    prevProps.showTitle === nextProps.showTitle &&
    prevProps.hours.length === nextProps.hours.length &&
    prevProps.hours.every((hour, index) => {
      const nextHour = nextProps.hours[index];
      return (
        hour.planet === nextHour.planet &&
        hour.timeRange === nextHour.timeRange &&
        hour.current === nextHour.current
      );
    })
  );
});
