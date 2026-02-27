import Link from "next/link";

const PLANET_SLUGS: Record<string, string> = {
  Sun: "sun-hour-guide",
  Moon: "moon-hour-guide",
  Mercury: "mercury-hour-guide",
  Venus: "venus-hour-guide",
  Mars: "mars-hour-guide",
  Jupiter: "jupiter-hour-guide",
  Saturn: "saturn-hour-guide",
};

const PLANET_EMOJI: Record<string, string> = {
  Sun: "☉",
  Moon: "☽",
  Mercury: "☿",
  Venus: "♀",
  Mars: "♂",
  Jupiter: "♃",
  Saturn: "♄",
};

interface RelatedPlanetHoursProps {
  planets: string[];
  basePath?: string;
}

export function RelatedPlanetHours({ planets, basePath = "/blog" }: RelatedPlanetHoursProps) {
  const validPlanets = planets.filter((p) => PLANET_SLUGS[p]);

  if (validPlanets.length === 0) return null;

  return (
    <div className="my-8 rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 p-6">
      <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100 mb-4">
        Related Planet Hour Guides
      </h3>
      <div className="flex flex-wrap gap-3">
        {validPlanets.map((planet) => (
          <Link
            key={planet}
            href={`${basePath}/${PLANET_SLUGS[planet]}`}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 text-gray-700 dark:text-gray-200 hover:border-purple-400 hover:text-purple-600 dark:hover:text-purple-400 transition-colors text-sm font-medium"
          >
            <span>{PLANET_EMOJI[planet]}</span>
            {planet} Hour Guide
          </Link>
        ))}
      </div>
    </div>
  );
}
