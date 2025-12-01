import { getAnimationClass } from "@/utils/animation";

interface HoursListSkeletonProps {
  title: string;
  showTitle?: boolean; // 控制是否显示标题
  itemCount?: number; // 新增：控制骨架屏项目数量
}

export function HoursListSkeleton({
  title,
  showTitle = true,
  itemCount = 12 // 默认 12 个，但可以根据实际情况调整
}: HoursListSkeletonProps) {
  const animateClass = getAnimationClass("animate-pulse");
  return (
    <div
      aria-live="polite"
      aria-busy="true"
      style={{
        minHeight: '400px', // 与 LayoutStabilizer 保持一致
        contain: 'layout style paint'
      }}
    >
      <div className="sr-only">Loading {title.toLowerCase()}...</div>
      {/* 根据 showTitle 属性决定是否显示标题，移动端通过CSS隐藏 */}
      {showTitle && (
        <h3
          className={`hidden md:block text-base font-medium text-gray-300 dark:text-gray-600 mb-3 pb-2 border-b border-gray-200 dark:border-gray-700 text-center ${animateClass}`}
          style={{ height: '32px' }} // 固定标题高度
        >
          {title}
        </h3>
      )}
      <div className="space-y-3">
        {Array.from({ length: itemCount }).map((_, idx) => (
          <div
            key={idx}
            className={`rounded bg-gray-200 dark:bg-gray-700 ${animateClass}`}
            style={{
              height: '48px', // 更精确的高度匹配 HourItem
              minHeight: '48px'
            }}
          />
        ))}
      </div>
    </div>
  );
}
