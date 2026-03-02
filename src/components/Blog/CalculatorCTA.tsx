import Link from "next/link";
import type { Locale } from "@/i18n/config";
import { getMessagesSync, t, type Messages } from "@/i18n/getMessages";

interface CalculatorCTAProps {
  planet?: string;
  text?: string;
  calculatorPath?: string;
  locale?: Locale;
  messages?: Messages;
}

export function CalculatorCTA({
  planet,
  text,
  calculatorPath = "/",
  locale = "en",
  messages,
}: CalculatorCTAProps) {
  const resolvedMessages = messages ?? getMessagesSync(locale);
  const label = text
    ? text
    : planet
      ? t(resolvedMessages.calculator.findNextPlanetHour, { planet })
      : resolvedMessages.calculator.calculatePlanetaryHours;

  return (
    <div className="my-8 rounded-xl bg-gradient-to-r from-purple-50 to-indigo-50 dark:from-purple-900/20 dark:to-indigo-900/20 border border-purple-200 dark:border-purple-700 p-6 text-center">
      <p className="text-gray-700 dark:text-gray-200 mb-4 text-lg font-medium">
        {label}
      </p>
      <Link
        href={calculatorPath}
        className="inline-block px-6 py-2.5 rounded-lg bg-purple-600 text-white font-medium hover:bg-purple-700 transition-colors"
      >
        {resolvedMessages.calculator.openCalculator}
      </Link>
    </div>
  );
}
