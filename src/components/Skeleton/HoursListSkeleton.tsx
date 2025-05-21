export function HoursListSkeleton({ title }: { title: string }) {
    return (
        <div>
            <h3 className="text-base font-medium text-gray-300 mb-3 pb-2 border-b border-gray-200 text-center animate-pulse">
                {title}
            </h3>
            <div className="space-y-3">
                {Array.from({ length: 12 }).map((_, idx) => (
                    <div key={idx} className="h-6 rounded bg-gray-200 animate-pulse" />
                ))}
            </div>
        </div>
    );
} 