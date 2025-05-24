"use client";

import { useState } from "react";
import { DateTimeInput } from "./DateTimeInput";
import { EnhancedDatePicker } from "../UI/EnhancedDatePicker";
import { format } from "date-fns";

export function DatePickerDemo() {
  const [selectedDate1, setSelectedDate1] = useState(new Date());
  const [selectedDate2, setSelectedDate2] = useState(new Date());

  const handleDateChange1 = (date: Date) => {
    setSelectedDate1(date);
  };

  const handleDateChange2 = (date: Date) => {
    setSelectedDate2(date);
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-8">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2">
          Enhanced Calendar Components
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Redesigned date pickers using the project's design language
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-8">
        {/* 原始改进版 */}
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg border border-gray-200 dark:border-gray-700">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-4">
            Enhanced DateTimeInput
          </h2>
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
            Improved version based on react-datepicker with enhanced visual effects while maintaining original functionality.
            <span className="block mt-1 text-xs text-purple-600 dark:text-purple-400 font-medium">
              💡 Quick buttons (Today/Yesterday/Tomorrow) only appear when today is selected
            </span>
          </p>
          
          <DateTimeInput
            defaultDate={format(selectedDate1, "MMMM d, yyyy")}
            onDateChange={handleDateChange1}
            selectedDate={selectedDate1}
          />
          
          <div className="mt-4 p-3 bg-gray-50 dark:bg-gray-900 rounded-lg">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Selected date: <span className="font-medium text-purple-600 dark:text-purple-400">
                {format(selectedDate1, "MMMM d, yyyy")}
              </span>
            </p>
          </div>
        </div>

        {/* 全新增强版 */}
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg border border-gray-200 dark:border-gray-700">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-4">
            Enhanced DatePicker
          </h2>
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
            Fully custom calendar component with keyboard navigation, quick selection, and richer interactions.
            <span className="block mt-1 text-xs text-purple-600 dark:text-purple-400 font-medium">
              💡 Quick buttons only appear when today is selected
            </span>
          </p>
          
          <EnhancedDatePicker
            selectedDate={selectedDate2}
            onDateChange={handleDateChange2}
            timezone="Asia/Shanghai"
            label="Select Date"
            placeholder="Click to select date..."
          />
          
          <div className="mt-4 p-3 bg-gray-50 dark:bg-gray-900 rounded-lg">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Selected date: <span className="font-medium text-purple-600 dark:text-purple-400">
                {format(selectedDate2, "MMMM d, yyyy")}
              </span>
            </p>
          </div>
        </div>
      </div>

      {/* 特性说明 */}
      <div className="bg-gradient-to-r from-purple-50 to-indigo-50 dark:from-purple-900/20 dark:to-indigo-900/20 rounded-xl p-6 border border-purple-200 dark:border-purple-800">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
          ✨ New Features
        </h3>
        
        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <h4 className="font-medium text-gray-900 dark:text-gray-100 mb-2">Visual Enhancements</h4>
            <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
              <li>• Modern rounded design</li>
              <li>• Soft shadow effects</li>
              <li>• Smooth transition animations</li>
              <li>• Purple theme colors</li>
              <li>• Dark mode support</li>
            </ul>
          </div>
          
          <div>
            <h4 className="font-medium text-gray-900 dark:text-gray-100 mb-2">Interaction Improvements</h4>
            <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
              <li>• Keyboard navigation support</li>
              <li>• Smart quick selection (only when today is selected)</li>
              <li>• Hover state feedback</li>
              <li>• Focus state indicators</li>
              <li>• Click outside to close</li>
            </ul>
          </div>
        </div>
      </div>

      {/* 使用说明 */}
      <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg border border-gray-200 dark:border-gray-700">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
          🎯 Usage Guide
        </h3>
        
        <div className="prose dark:prose-dark max-w-none">
          <div className="grid md:grid-cols-2 gap-6 text-sm">
            <div>
              <h4 className="font-medium text-gray-900 dark:text-gray-100 mb-2">Keyboard Shortcuts</h4>
              <ul className="text-gray-600 dark:text-gray-400 space-y-1">
                <li><kbd className="px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded text-xs">←</kbd> Previous day</li>
                <li><kbd className="px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded text-xs">→</kbd> Next day</li>
                <li><kbd className="px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded text-xs">↑</kbd> Previous week</li>
                <li><kbd className="px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded text-xs">↓</kbd> Next week</li>
                <li><kbd className="px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded text-xs">Esc</kbd> Close calendar</li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-medium text-gray-900 dark:text-gray-100 mb-2">Quick Selection</h4>
              <ul className="text-gray-600 dark:text-gray-400 space-y-1">
                <li>• Today - Quick select current date (only visible when today is selected)</li>
                <li>• Yesterday - Select yesterday's date (only visible when today is selected)</li>
                <li>• Tomorrow - Select tomorrow's date (only visible when today is selected)</li>
                <li>• Weekend dates shown in red</li>
                <li>• Today's date has special indicator</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}