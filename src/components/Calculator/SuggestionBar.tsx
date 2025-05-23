interface SuggestionBarProps {
  goodFor: string;
  avoid: string;
}

export function SuggestionBar({ goodFor, avoid }: SuggestionBarProps) {
  return (
    <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="flex items-start">
          <span className="font-medium text-gray-800 mr-2">Good for:</span>
          <span className="text-green-700 text-sm">{goodFor}</span>
        </div>
        <div className="flex items-start">
          <span className="font-medium text-gray-800 mr-2">Avoid:</span>
          <span className="text-red-600 text-sm">{avoid}</span>
        </div>
      </div>
    </div>
  );
}
