'use client';

interface TimeFormatToggleProps {
  format: '12h' | '24h';
  onFormatChange: (format: '12h' | '24h') => void;
  darkMode?: boolean;
}

export function TimeFormatToggle({ format, onFormatChange, darkMode = false }: TimeFormatToggleProps) {
  return (
    <div className={`${darkMode ? 'bg-indigo-800/50' : 'bg-gray-100'} rounded-lg overflow-hidden flex`}>
      <button
        onClick={() => onFormatChange('12h')}
        className={`px-3 py-1 text-sm ${format === '12h'
          ? `${darkMode ? 'bg-indigo-600 text-white' : 'bg-white text-purple-600'} font-medium shadow-sm`
          : `${darkMode ? 'text-indigo-200 hover:bg-indigo-700/50' : 'text-gray-600 hover:bg-gray-200'} transition-colors duration-200`
          }`}
      >
        12h
      </button>
      <button
        onClick={() => onFormatChange('24h')}
        className={`px-3 py-1 text-sm ${format === '24h'
          ? `${darkMode ? 'bg-indigo-600 text-white' : 'bg-white text-purple-600'} font-medium shadow-sm`
          : `${darkMode ? 'text-indigo-200 hover:bg-indigo-700/50' : 'text-gray-600 hover:bg-gray-200'} transition-colors duration-200`
          }`}
      >
        24h
      </button>
    </div>
  );
} 