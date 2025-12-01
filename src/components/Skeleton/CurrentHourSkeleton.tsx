import { getAnimationClass } from "@/utils/animation";

export function CurrentHourSkeleton() {
  const animateClass = getAnimationClass("animate-pulse");
  return (
    <div
      className="space-y-2"
      aria-live="polite"
      aria-busy="true"
      style={{
        minHeight: '180px', // 与 LayoutStabilizer 保持一致
        contain: 'layout style paint'
      }}
    >
      <div className="sr-only">Loading current hour information...</div>

      {/* 标题骨架 */}
      <div className={`h-5 w-36 bg-gray-200 dark:bg-gray-700 rounded ${animateClass}`} />

      {/* 主要内容骨架 - 模拟 CurrentHourDisplay 的结构 */}
      <div className={`bg-gray-200 dark:bg-gray-700 rounded-lg border border-gray-300 dark:border-gray-600 ${animateClass}`} style={{ minHeight: '140px' }}>
        {/* Day Ruler Row 骨架 */}
        <div className="p-2.5 border-b border-gray-300 dark:border-gray-600">
          <div className="flex justify-between items-center">
            <div className={`h-4 w-16 bg-gray-300 dark:bg-gray-600 rounded ${animateClass}`} />
            <div className="flex items-center gap-2">
              <div className={`h-4 w-12 bg-gray-300 dark:bg-gray-600 rounded ${animateClass}`} />
              <div className={`h-5 w-5 bg-gray-300 dark:bg-gray-600 rounded ${animateClass}`} />
            </div>
          </div>
        </div>

        {/* Current Hour Row 骨架 */}
        <div className="p-2.5 border-b border-gray-300 dark:border-gray-600">
          <div className="flex items-center">
            <div className={`h-8 w-8 bg-gray-300 dark:bg-gray-600 rounded ${animateClass}`} />
            <div className="ml-3 flex-grow space-y-2">
              <div className={`h-4 w-20 bg-gray-300 dark:bg-gray-600 rounded ${animateClass}`} />
              <div className={`h-3 w-32 bg-gray-300 dark:bg-gray-600 rounded ${animateClass}`} />
            </div>
          </div>
        </div>

        {/* Good For / Avoid Row 骨架 */}
        <div className="flex flex-col md:flex-row">
          <div className="p-2.5 flex-1 border-b md:border-b-0 md:border-r border-gray-300 dark:border-gray-600">
            <div className={`h-3 w-12 bg-gray-300 dark:bg-gray-600 rounded mb-2 ${animateClass}`} />
            <div className={`h-4 w-full bg-gray-300 dark:bg-gray-600 rounded ${animateClass}`} />
          </div>
          <div className="p-2.5 flex-1">
            <div className={`h-3 w-8 bg-gray-300 dark:bg-gray-600 rounded mb-2 ${animateClass}`} />
            <div className={`h-4 w-full bg-gray-300 dark:bg-gray-600 rounded ${animateClass}`} />
          </div>
        </div>
      </div>
    </div>
  );
}
