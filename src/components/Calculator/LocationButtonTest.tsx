"use client";

import { POPULAR_CITIES } from "@/constants/popularCities";

import { createLogger } from '@/utils/logger';
export function LocationButtonTest() {
  const logger = createLogger('LocationButtonTest');

  logger.info("🔍 [Debug] POPULAR_CITIES:", POPULAR_CITIES);
  
  return (
    <div className="p-4 bg-gray-100 rounded-lg">
      <h3 className="font-semibold mb-2">Location Button Test</h3>
      <p className="text-sm text-gray-600 mb-4">
        这个组件用于测试城市按钮是否正确显示。应该显示 {POPULAR_CITIES.length} 个按钮。
      </p>
      
      <div className="flex items-center gap-1 mb-4">
        <span className="text-sm font-medium">按钮测试:</span>
        {POPULAR_CITIES.map((city) => (
          <button
            key={city.name}
            onClick={() => alert(`点击了 ${city.displayName}`)}
            className="px-2 py-1 text-xs font-medium text-purple-600 dark:text-purple-400 
                     hover:text-purple-700 dark:hover:text-purple-300 
                     hover:bg-purple-50 dark:hover:bg-purple-900/20 
                     rounded-md transition-all duration-200 
                     hover:scale-105 active:scale-95 
                     border border-transparent hover:border-purple-200 dark:hover:border-purple-700
                     focus:outline-none focus:ring-2 focus:ring-purple-500/30"
            type="button"
          >
            {city.name}
          </button>
        ))}
      </div>
      
      <div className="text-xs text-gray-500">
        <p>城市数据:</p>
        <pre className="mt-1 text-xs">
          {JSON.stringify(POPULAR_CITIES, null, 2)}
        </pre>
      </div>
    </div>
  );
}