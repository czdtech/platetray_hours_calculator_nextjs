import { getAnimationClass } from '@/utils/animation';
export function HoursListSkeleton({ title }: { title: string }) {
    const animateClass = getAnimationClass('animate-pulse');
    return (
        <div aria-live="polite" aria-busy="true">
            <div className="sr-only">Loading {title.toLowerCase()}...</div>
            <h3 className={`text-base font-medium text-gray-300 mb-3 pb-2 border-b border-gray-200 text-center ${animateClass}`}>
                {title}
            </h3>
            <div className="space-y-3">
                {Array.from({ length: 12 }).map((_, idx) => (
                    <div key={idx} className={`h-6 rounded bg-gray-200 ${animateClass}`} />
                ))}
            </div>
        </div>
    );
}
