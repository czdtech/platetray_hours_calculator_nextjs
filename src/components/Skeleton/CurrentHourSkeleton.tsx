import { getAnimationClass } from "@/utils/animation";
export function CurrentHourSkeleton() {
  const animateClass = getAnimationClass("animate-pulse");
  return (
    <div className="space-y-2" aria-live="polite" aria-busy="true">
      <div className="sr-only">Loading current hour information...</div>
      <div className={`h-4 w-36 bg-gray-200 rounded ${animateClass}`} />
      <div className={`h-32 w-full bg-gray-200 rounded ${animateClass}`} />
    </div>
  );
}
