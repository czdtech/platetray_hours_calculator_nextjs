import { getAnimationClass } from "@/utils/animation";

interface HoursListSkeletonProps {
  title: string;
  showTitle?: boolean; // 控制是否显示标题
}

export function HoursListSkeleton({ title, showTitle = true }: HoursListSkeletonProps) {
  const animateClass = getAnimationClass("animate-pulse");
  return (
    <div aria-live="polite" aria-busy="true">
      <div className="sr-only">Loading {title.toLowerCase()}...</div>
      {/* 根据 showTitle 属性决定是否显示标题 */}
      {showTitle && (
        <h3
          className={`text-base font-medium text-gray-300 mb-3 pb-2 border-b border-gray-200 text-center ${animateClass}`}
        >
          {title}
        </h3>
      )}
      <div className="space-y-3">
        {Array.from({ length: 12 }).map((_, idx) => (
          <div
            key={idx}
            className={`h-6 rounded bg-gray-200 ${animateClass}`}
          />
        ))}
      </div>
    </div>
  );
}
