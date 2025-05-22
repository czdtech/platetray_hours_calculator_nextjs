'use client';

import { FormattedPlanetaryHour } from '@/utils/planetaryHourFormatters';
// 导入全局行星颜色常量
import { PLANET_COLOR_CLASSES, PLANET_COLOR_HEX, PLANET_SYMBOLS } from '@/constants/planetColors';

interface HourItemProps {
  hour: FormattedPlanetaryHour;
  index: number;
  isOpen: boolean;
  onToggle: (index: number) => void;
}

export function HourItem({ hour, index, isOpen, onToggle }: HourItemProps) {
  const handleClick = () => {
    const isCoarse = window.matchMedia('(pointer: coarse)').matches;
    if (isCoarse) {
      onToggle(index);
    }
  };

  // 检查行星名称是否有效
  const isValidPlanet = hour.planet && hour.planet in PLANET_COLOR_CLASSES;
  // 获取行星对应的颜色值 - 安全访问
  const planetColor = isValidPlanet 
    ? PLANET_COLOR_HEX[hour.planet as keyof typeof PLANET_COLOR_HEX] 
    : '#6B7280'; // 默认灰色

  // 安全获取CSS类
  const planetColorClass = isValidPlanet 
    ? PLANET_COLOR_CLASSES[hour.planet as keyof typeof PLANET_COLOR_CLASSES] 
    : 'text-gray-500'; // 默认灰色文本
    
  // 安全获取行星符号
  const planetSymbol = isValidPlanet 
    ? PLANET_SYMBOLS[hour.planet as keyof typeof PLANET_SYMBOLS] 
    : ''; // 空字符串作为后备
  return (
    <div className="relative group">
      <button
        type="button"
        className={`
          w-full text-left flex items-center p-3 rounded-lg border transition-all duration-200 cursor-pointer
          ${hour.current
            ? 'border-l-4 border-purple-600 bg-purple-50'
            : 'border-gray-200 hover:border-gray-300 hover:shadow-sm hover:-translate-y-0.5'}
        `}
        onClick={handleClick}
        tabIndex={0}
        onKeyDown={e => {
          if (e.key === 'Enter' || e.key === ' ') {
            handleClick();
          }
        }}
        aria-expanded={isOpen}
        role="button"
      >
        <span className="w-8 text-sm text-gray-500 font-medium">
          {String(index + 1).padStart(2, '0')}
        </span>
        {/* 使用双重方式应用颜色：CSS类 + 内联样式作为备选 */}
        <span 
          className={`font-medium ${planetColorClass}`}
          style={{ color: planetColor }}
        >
          {hour.planet}
        </span>
        <div className="ml-auto flex items-center shrink-0">
          <span className="text-sm text-gray-600 truncate">{hour.timeRange}</span>
          <span 
            className={`ml-3 text-lg ${planetColorClass}`} 
            style={{ color: planetColor }}
          >
            {planetSymbol}
          </span>
        </div>
      </button>

      <div
        className="hidden md:block absolute left-1/2 top-full transform -translate-x-1/2 mt-2 w-72 z-20 pointer-events-none group-hover:pointer-events-auto group-hover:opacity-100 opacity-0 transition-opacity duration-200"
      >
        <div className="p-3 bg-white border border-gray-200 rounded-lg shadow-lg text-xs leading-relaxed">
          <div className="font-semibold text-green-700 mb-1">Good For</div>
          <div className="text-gray-700">{hour.goodFor}</div>
          <hr className="my-2 border-gray-100" />
          <div className="font-semibold text-red-600 mb-1">Avoid</div>
          <div className="text-gray-700">{hour.avoid}</div>
        </div>
      </div>

      {isOpen && (
        <div className="md:hidden mt-2 p-3 bg-gray-50 border border-gray-200 rounded-lg text-xs leading-relaxed">
          <div className="font-semibold text-green-700 mb-1">Good For</div>
          <div className="text-gray-700">{hour.goodFor}</div>
          <hr className="my-2 border-gray-100" />
          <div className="font-semibold text-red-600 mb-1">Avoid</div>
          <div className="text-gray-700">{hour.avoid}</div>
        </div>
      )}
    </div>
  );
}
