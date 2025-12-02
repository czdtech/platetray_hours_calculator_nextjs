"use client";

import { memo, useMemo } from "react";
import { ChevronRight } from "lucide-react";
import { FormattedPlanetaryHour } from "@/utils/planetaryHourFormatters";
// 导入全局行星颜色常量
import {
  PLANET_COLOR_CLASSES,
  PLANET_COLOR_HEX,
  PLANET_SYMBOLS,
} from "@/constants/planetColors";

interface HourItemProps {
  hour: FormattedPlanetaryHour;
  index: number;
  isOpen: boolean;
  onToggle: (index: number) => void;
}

function HourItemComponent({ hour, index, isOpen, onToggle }: HourItemProps) {
  // 为按钮和可折叠详情区域建立稳定的关联 id
  const detailsId = useMemo(() => `hour-details-${index}`, [index]);

  // 检查行星名称是否有效
  const isValidPlanet = hour.planet && hour.planet in PLANET_COLOR_CLASSES;
  // 获取行星对应的颜色值 - 安全访问
  const planetColor = isValidPlanet
    ? PLANET_COLOR_HEX[hour.planet as keyof typeof PLANET_COLOR_HEX]
    : "#6B7280"; // 默认灰色

  // 安全获取CSS类
  const planetColorClass = isValidPlanet
    ? PLANET_COLOR_CLASSES[hour.planet as keyof typeof PLANET_COLOR_CLASSES]
    : "text-gray-500"; // 默认灰色文本

  // 安全获取行星符号
  const planetSymbol = isValidPlanet
    ? PLANET_SYMBOLS[hour.planet as keyof typeof PLANET_SYMBOLS]
    : ""; // 空字符串作为后备
  return (
    <div className="relative group">
      <button
        type="button"
        className={`
          w-full text-left flex items-center p-3 rounded-lg border transition-all duration-200 cursor-pointer
          ${hour.current
            ? "border-l-4 border-purple-600 dark:border-purple-400 bg-purple-50 dark:bg-purple-900/30"
            : "border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 hover:shadow-sm hover:-translate-y-0.5 bg-white dark:bg-gray-800"
          }
        `}
        onClick={() => onToggle(index)}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            onToggle(index);
          }
        }}
        aria-expanded={isOpen}
        aria-controls={detailsId}
      >
        <span className="w-8 text-sm text-gray-500 dark:text-gray-400 font-medium">
          {String(index + 1).padStart(2, "0")}
        </span>
        {/* 使用双重方式应用颜色：CSS类 + 内联样式作为备选 */}
        <span
          className={`font-medium ${planetColorClass}`}
          style={{ color: planetColor }}
        >
          {hour.planet}
        </span>
        <div className="ml-auto flex items-center shrink-0">
          <span className="text-sm text-gray-600 dark:text-gray-400 truncate">
            {hour.timeRange}
          </span>
          <span
            className={`ml-3 text-lg ${planetColorClass}`}
            style={{ color: planetColor }}
          >
            {planetSymbol}
          </span>
          <ChevronRight
            size={16}
            className="chevron-mobile ml-2 text-gray-300 dark:text-gray-600 transition-colors duration-200 group-hover:text-gray-400 dark:group-hover:text-gray-500"
          />
        </div>
      </button>

      {/* Desktop tooltip */}
      <div className="hidden md:block absolute left-1/2 transform -translate-x-1/2 mt-2 w-72 z-20 pointer-events-none group-hover:pointer-events-auto group-hover:opacity-100 opacity-0 transition-opacity duration-200"
           style={{ top: 'calc(100% + 8px)' }}>
        <div className="p-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg text-xs leading-relaxed">
          <div className="font-semibold text-green-700 dark:text-green-400 mb-1">Good For</div>
          <div className="text-gray-700 dark:text-gray-300">{hour.goodFor}</div>
          <hr className="my-2 border-gray-100 dark:border-gray-600" />
          <div className="font-semibold text-red-600 dark:text-red-400 mb-1">Avoid</div>
          <div className="text-gray-700 dark:text-gray-300">{hour.avoid}</div>
        </div>
      </div>

      {isOpen && (
        <div
          id={detailsId}
          className="mt-2 p-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-xs leading-relaxed"
        >
          <div className="font-semibold text-green-700 dark:text-green-400 mb-1">Good For</div>
          <div className="text-gray-700 dark:text-gray-300">{hour.goodFor}</div>
          <hr className="my-2 border-gray-100 dark:border-gray-600" />
          <div className="font-semibold text-red-600 dark:text-red-400 mb-1">Avoid</div>
          <div className="text-gray-700 dark:text-gray-300">{hour.avoid}</div>
        </div>
      )}
    </div>
  );
}

// 使用 memo 优化组件，只在 props 真正改变时重新渲染
export const HourItem = memo(HourItemComponent, (prevProps, nextProps) => {
  return (
    prevProps.hour.planet === nextProps.hour.planet &&
    prevProps.hour.timeRange === nextProps.hour.timeRange &&
    prevProps.hour.current === nextProps.hour.current &&
    prevProps.index === nextProps.index &&
    prevProps.isOpen === nextProps.isOpen
  );
});
