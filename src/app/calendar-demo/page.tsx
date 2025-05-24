import { DatePickerDemo } from "@/components/Calculator/DatePickerDemo";
import { DateProvider } from "@/contexts/DateContext";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Calendar Component Demo | Planetary Hours Calculator",
  description: "Showcase of enhanced calendar component design and functionality",
};

export default function CalendarDemoPage() {
  const initialDate = new Date();
  const initialTimezone = "America/New_York";

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
      <DateProvider initialDate={initialDate} initialTimezone={initialTimezone}>
        <DatePickerDemo />
      </DateProvider>
    </div>
  );
}