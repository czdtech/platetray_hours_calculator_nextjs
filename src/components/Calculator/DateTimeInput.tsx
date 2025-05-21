'use client';

import { useRef, useId } from 'react';
import { Calendar } from 'lucide-react';
import DatePicker from 'react-datepicker';
import "react-datepicker/dist/react-datepicker.css"; // This will be handled globally
import { useDateContext } from '@/contexts/DateContext'; // Updated import path
// import type { Modifier } from '@popperjs/core'; // Temporarily remove or adjust if causing issues

interface DateTimeInputProps {
  defaultDate: string; // This might need to be derived from selectedDate + timezone or be a direct string representation
  onDateChange: (date: Date) => void;
  selectedDate: Date; // Assumed to be UTC date
}

// Removed DatePickerRefType as we'll use DatePicker type directly if possible
// type OffsetOptions = { offset: [number, number] }; 
// type PreventOverflowOptions = { boundary: string; padding: number; altAxis: boolean };

export function DateTimeInput({
  defaultDate, // This prop seems to be for display, ensure it's correctly formatted in the parent
  onDateChange,
  selectedDate
}: DateTimeInputProps) {
  const { utcToZonedTime, zonedTimeToUtc, formatDateWithPattern } = useDateContext();

  const datePickerRef = useRef<DatePicker>(null); // Changed ref type to DatePicker
  const inputRef = useRef<HTMLInputElement>(null);
  const inputId = useId();

  // Convert UTC date to zoned date for DatePicker internal state
  const zonedDate = utcToZonedTime(selectedDate);

  // Format the selectedDate (UTC) into a localized string for the input field display
  // The `defaultDate` prop might be redundant if we derive the display value directly from `selectedDate` and context
  const displayDate = formatDateWithPattern(selectedDate, "MMMM d, yyyy");

  const handleDateChange = (date: Date | null) => {
    if (date) {
      // `date` from react-datepicker is already in local time zone of the browser.
      // We need to convert this local time to a UTC Date object for our app's state.
      const utcDate = zonedTimeToUtc(date);
      onDateChange(utcDate);
    }
  };

  return (
    <div className="space-y-2">
      <p className="block text-sm font-medium text-gray-700">
        Date
      </p>
      <div
        className="relative"
        // Removed onClick to open DatePicker, default behavior of DatePicker customInput should handle this
      >
        <DatePicker
          ref={datePickerRef} // Keep ref if needed for external control, though often not necessary
          id={inputId} // For label association
          name="date" // For form semantics
          selected={zonedDate} // DatePicker uses local time, so zonedDate is correct here
          onChange={handleDateChange} // Receives local date, correctly converted to UTC in handler
          dateFormat="MMMM d, yyyy" // How the date is displayed inside DatePicker input if not using customInput
          className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-purple-500/30 focus:border-purple-500 transition-all duration-200 pl-4 pr-10 cursor-pointer"
          wrapperClassName="w-full"
          popperClassName="z-[100] relative" 
          // popperPlacement="auto" // Removed to use default placement
          popperModifiers={[
            {
              name: "offset",
              options: { offset: [0, 8] }
            },
            {
              name: "preventOverflow",
              options: { boundary: "viewport", padding: 8, altAxis: true }
            }
          ] as any} // Temporarily using 'as any' to bypass complex popper type issues
          customInput={ // Using customInput for better control over styling and readOnly behavior
            <input
              ref={inputRef} // Ref for potential focus management
              id={inputId + "-display"} // Ensure unique ID if main id is on DatePicker itself
              name="date-display" // Ensure unique name
              type="text"
              aria-label="Date"
              value={displayDate} // Display formatted UTC date
              placeholder="Select date..."
              readOnly // Important: make it readOnly so user must use picker
              onClick={() => datePickerRef.current?.setOpen(true)} // Open picker on click
              className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-purple-500/30 focus:border-purple-500 transition-all duration-200 pl-4 pr-10 cursor-pointer"
            />
          }
        />
        <div
          className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none"
          aria-hidden="true"
        >
          <Calendar size={18} />
        </div>
      </div>
    </div>
  );
} 