'use client';

import { useRef, useId } from 'react';
import { Calendar } from 'lucide-react';
import DatePicker from 'react-datepicker';
import "react-datepicker/dist/react-datepicker.css"; // 确保这行没有被注释
import { useDateContext } from '@/contexts/DateContext';

interface DateTimeInputProps {
  defaultDate: string;
  onDateChange: (date: Date) => void;
  selectedDate: Date;
}

// 定义一个包含 setOpen 方法的接口
interface DatePickerRefType {
  setOpen: (open: boolean) => void;
}

type OffsetOptions = { offset: [number, number] };
type PreventOverflowOptions = { boundary: string; padding: number; altAxis: boolean };

export function DateTimeInput({
  defaultDate,
  onDateChange,
  selectedDate
}: DateTimeInputProps) {
  const { utcToZonedTime, zonedTimeToUtc } = useDateContext();

  const datePickerRef = useRef<DatePickerRefType>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const inputId = useId();

  // Convert UTC date to zoned date for DatePicker
  const zonedDate = utcToZonedTime(selectedDate);

  const handleDateChange = (date: Date | null) => {
    if (date) {
      // Convert selected date to UTC date
      const utcDate = zonedTimeToUtc(date);
      // Call the callback function
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
        onClick={() => inputRef.current?.focus()}
      >
        <DatePicker
          ref={datePickerRef}
          id={inputId}
          name="date"
          selected={zonedDate}
          onChange={handleDateChange}
          dateFormat="MMMM d, yyyy"
          className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-purple-500/30 focus:border-purple-500 transition-all duration-200 pl-4 pr-10 cursor-pointer"
          wrapperClassName="w-full"
          popperClassName="z-[100] relative"
          popperPlacement="auto"
          popperModifiers={[
            {
              name: "offset",
              options: {
                offset: [0, 8]
              }
            },
            {
              name: "preventOverflow",
              options: {
                boundary: "viewport",
                padding: 8,
                altAxis: true
              }
            }
          ] as any}
          customInput={
            <input
              ref={inputRef}
              id={inputId}
              name="date"
              type="text"
              aria-label="Date"
              value={defaultDate}
              placeholder="Select date..."
              readOnly
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