"use client";

interface TimeFormatToggleProps {
  format: "12h" | "24h";
  onFormatChange: (format: "12h" | "24h") => void;
}

export function TimeFormatToggle({
  format,
  onFormatChange,
}: TimeFormatToggleProps) {
  return (
    <div className="bg-gray-100 dark:bg-gray-700 rounded-lg overflow-hidden flex shadow-inner">
      <button
        onClick={() => onFormatChange("12h")}
        className={`px-3 py-1.5 text-sm font-medium rounded-md m-0.5 transition-all duration-200 ease-in-out transform hover:scale-105 active:scale-95 focus:outline-none focus:ring-2 focus:ring-purple-500/30 ${format === "12h"
            ? "bg-white dark:bg-gray-800 text-purple-600 dark:text-purple-400 shadow-md ring-1 ring-purple-200 dark:ring-purple-600"
            : "text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 hover:text-gray-800 dark:hover:text-gray-100 hover:shadow-sm"
          }`}
      >
        12h
      </button>
      <button
        onClick={() => onFormatChange("24h")}
        className={`px-3 py-1.5 text-sm font-medium rounded-md m-0.5 transition-all duration-200 ease-in-out transform hover:scale-105 active:scale-95 focus:outline-none focus:ring-2 focus:ring-purple-500/30 ${format === "24h"
            ? "bg-white dark:bg-gray-800 text-purple-600 dark:text-purple-400 shadow-md ring-1 ring-purple-200 dark:ring-purple-600"
            : "text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 hover:text-gray-800 dark:hover:text-gray-100 hover:shadow-sm"
          }`}
      >
        24h
      </button>
    </div>
  );
}
