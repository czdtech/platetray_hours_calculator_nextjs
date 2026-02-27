import Link from "next/link";

interface CalculatorCTAProps {
  planet?: string;
  text?: string;
  calculatorPath?: string;
}

export function CalculatorCTA({ planet, text, calculatorPath = "/" }: CalculatorCTAProps) {
  const label = text
    ? text
    : planet
      ? `Find your next ${planet} hour`
      : "Calculate your planetary hours";

  return (
    <div className="my-8 rounded-xl bg-gradient-to-r from-purple-50 to-indigo-50 dark:from-purple-900/20 dark:to-indigo-900/20 border border-purple-200 dark:border-purple-700 p-6 text-center">
      <p className="text-gray-700 dark:text-gray-200 mb-4 text-lg font-medium">
        {label}
      </p>
      <Link
        href={calculatorPath}
        className="inline-block px-6 py-2.5 rounded-lg bg-purple-600 text-white font-medium hover:bg-purple-700 transition-colors"
      >
        Open Calculator →
      </Link>
    </div>
  );
}
