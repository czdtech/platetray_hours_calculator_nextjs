"use client";

interface TimeFormatToggleProps {
  format: "12h" | "24h";
  onFormatChange: (format: "12h" | "24h") => void;
  darkMode?: boolean;
}

export function TimeFormatToggle({
  format,
  onFormatChange,
  darkMode = false,
}: TimeFormatToggleProps) {
  return (
    <div
      className={`${darkMode ? "bg-indigo-800/50" : "bg-gray-100"} rounded-lg overflow-hidden flex shadow-inner`}
    >
      <button
        onClick={() => onFormatChange("12h")}
        className={`px-3 py-1.5 text-sm font-medium rounded-md m-0.5 transition-all duration-200 ease-in-out transform hover:scale-105 active:scale-95 focus:outline-none focus:ring-2 focus:ring-purple-500/30 ${format === "12h"
            ? `${darkMode ? "bg-indigo-600 text-white ring-2 ring-indigo-400 shadow-lg" : "bg-white text-purple-600 shadow-md ring-1 ring-purple-200"}`
            : `${darkMode ? "text-indigo-200 hover:bg-indigo-700/50 hover:text-white hover:shadow-sm" : "text-gray-600 hover:bg-gray-200 hover:text-gray-800 hover:shadow-sm"}`
          }`}
      >
        12h
      </button>
      <button
        onClick={() => onFormatChange("24h")}
        className={`px-3 py-1.5 text-sm font-medium rounded-md m-0.5 transition-all duration-200 ease-in-out transform hover:scale-105 active:scale-95 focus:outline-none focus:ring-2 focus:ring-purple-500/30 ${format === "24h"
            ? `${darkMode ? "bg-indigo-600 text-white ring-2 ring-indigo-400 shadow-lg" : "bg-white text-purple-600 shadow-md ring-1 ring-purple-200"}`
            : `${darkMode ? "text-indigo-200 hover:bg-indigo-700/50 hover:text-white hover:shadow-sm" : "text-gray-600 hover:bg-gray-200 hover:text-gray-800 hover:shadow-sm"}`
          }`}
      >
        24h
      </button>
    </div>
  );
}
