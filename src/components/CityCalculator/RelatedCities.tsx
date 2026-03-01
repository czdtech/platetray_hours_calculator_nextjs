import Link from "next/link";
import { City } from "@/data/cities";
import type { Locale } from "@/i18n/config";
import type { Messages } from "@/i18n/getMessages";
import { toLocalizedPath } from "@/i18n/routePolicy";

interface RelatedCitiesProps {
  cities: City[];
  currentSlug: string;
  locale: Locale;
  messages: Messages;
}

export function RelatedCities({
  cities,
  currentSlug,
  locale,
  messages,
}: RelatedCitiesProps) {
  const related = cities.filter((c) => c.slug !== currentSlug).slice(0, 5);

  if (related.length === 0) return null;

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
      <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-4">
        {messages.cityPage.otherCities}
      </h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
        {related.map((city) => (
          <Link
            key={city.slug}
            href={toLocalizedPath(`/planetary-hours/${city.slug}`, locale)}
            className="block bg-gray-50 dark:bg-gray-750 hover:bg-purple-50 dark:hover:bg-purple-900/20 rounded-lg p-4 transition-colors border border-gray-100 dark:border-gray-700 hover:border-purple-200 dark:hover:border-purple-700"
          >
            <p className="font-medium text-gray-900 dark:text-gray-100">{city.name}</p>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{city.country}</p>
            <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">{city.timezone}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
