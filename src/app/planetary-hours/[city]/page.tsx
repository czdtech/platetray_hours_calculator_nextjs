import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { formatInTimeZone } from "date-fns-tz";
import { Header } from "@/components/Layout/Header";
import { Breadcrumb } from "@/components/SEO/Breadcrumb";
import { JsonLd } from "@/components/SEO/JsonLd";
import { getBreadcrumbSchema } from "@/utils/seo/jsonld";
import { siteConfig } from "@/config/seo";
import { planetaryHoursCalculator } from "@/services/PlanetaryHoursCalculator";
import { getCityBySlug, getAllCitySlugs, getNearbyCities } from "@/data/cities";
import { CityInfo } from "@/components/CityCalculator/CityInfo";
import { CityHoursList } from "@/components/CityCalculator/CityHoursList";
import { CityFAQ } from "@/components/CityCalculator/CityFAQ";
import { RelatedCities } from "@/components/CityCalculator/RelatedCities";
import { PLANET_COLOR_CLASSES, PLANET_SYMBOLS } from "@/constants/planetColors";

export const revalidate = 3600;

export async function generateStaticParams() {
  return getAllCitySlugs().map((slug) => ({ city: slug }));
}

interface CityPageProps {
  params: Promise<{ city: string }>;
}

export async function generateMetadata({ params }: CityPageProps): Promise<Metadata> {
  const { city: slug } = await params;
  const city = getCityBySlug(slug);
  if (!city) return {};

  const today = formatInTimeZone(new Date(), city.timezone, "MMMM d, yyyy");
  const title = `Planetary Hours in ${city.name} Today – ${today}`;
  const description = `Calculate today's planetary hours for ${city.name}, ${city.country}. See sunrise, sunset, day ruler, and all 24 planetary hours in ${city.timezone}. Free and accurate.`;

  return {
    title,
    description,
    keywords: [
      `planetary hours ${city.name}`,
      `planetary hours ${city.country}`,
      `${city.name} astrology`,
      `${city.name} sunrise sunset`,
      "planetary hours calculator",
      "planetary timing",
    ],
    alternates: {
      canonical: `${siteConfig.url}/planetary-hours/${city.slug}`,
    },
    openGraph: {
      title,
      description,
      url: `${siteConfig.url}/planetary-hours/${city.slug}`,
      type: "website",
      siteName: siteConfig.name,
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
    },
  };
}

export default async function CityPage({ params }: CityPageProps) {
  const { city: slug } = await params;
  const city = getCityBySlug(slug);
  if (!city) notFound();

  const now = new Date();
  const result = await planetaryHoursCalculator.calculate(
    now,
    city.latitude,
    city.longitude,
    city.timezone,
  );

  if (!result) {
    return (
      <>
        <Header activePage="cities" />
        <div className="container mx-auto px-4 py-16 text-center">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
            Calculation Error
          </h1>
          <p className="text-gray-600 dark:text-gray-300 mt-4">
            Unable to calculate planetary hours for {city.name} at this time. Please try again later.
          </p>
          <Link href="/planetary-hours" className="inline-block mt-6 text-purple-600 hover:text-purple-700 font-medium">
            ← Back to all cities
          </Link>
        </div>
      </>
    );
  }

  const breadcrumbItems = [
    { name: "Home", url: "/" },
    { name: "Cities", url: "/planetary-hours" },
    { name: city.name, url: `/planetary-hours/${city.slug}` },
  ];
  const breadcrumbSchema = getBreadcrumbSchema(
    breadcrumbItems.map((item) => ({ name: item.name, url: `${siteConfig.url}${item.url}` })),
  );

  const currentHour = planetaryHoursCalculator.getCurrentHour(result, now);
  const dayHours = result.planetaryHours.filter((h) => h.type === "day");
  const daytimeHourDuration = dayHours.length > 0 ? dayHours[0].durationMinutes : 60;
  const nearbyCities = getNearbyCities(city.slug, 5);

  const currentHourColor = currentHour
    ? PLANET_COLOR_CLASSES[currentHour.ruler as keyof typeof PLANET_COLOR_CLASSES] || "text-gray-600"
    : "";
  const currentHourSymbol = currentHour
    ? PLANET_SYMBOLS[currentHour.ruler as keyof typeof PLANET_SYMBOLS] || ""
    : "";

  return (
    <>
      <Header activePage="cities" />
      <JsonLd data={breadcrumbSchema} />

      <div className="container mx-auto px-4 py-6 space-y-6">
        <div className="mb-2">
          <Breadcrumb items={breadcrumbItems} />
        </div>

        <CityInfo
          city={city}
          sunrise={result.sunrise}
          sunset={result.sunset}
          timezone={city.timezone}
          dayRuler={result.dayRuler}
        />

        {currentHour && (
          <div className="bg-gradient-to-r from-purple-50 to-indigo-50 dark:from-purple-900/20 dark:to-indigo-900/20 rounded-xl shadow-sm border border-purple-200 dark:border-purple-800 p-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">Current Planetary Hour</h2>
            <div className="flex items-center gap-3">
              <span className={`text-3xl font-bold ${currentHourColor}`}>
                {currentHourSymbol} {currentHour.ruler}
              </span>
              <span className="text-gray-500 dark:text-gray-400">·</span>
              <span className="text-gray-600 dark:text-gray-300">
                {formatInTimeZone(currentHour.startTime, city.timezone, "h:mm a")} – {formatInTimeZone(currentHour.endTime, city.timezone, "h:mm a")}
              </span>
              <span className="text-xs bg-purple-100 dark:bg-purple-800 text-purple-700 dark:text-purple-200 px-2 py-1 rounded-full">
                {currentHour.type === "day" ? "Daytime" : "Nighttime"}
              </span>
            </div>
            <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm">
              <div>
                <span className="font-medium text-green-700 dark:text-green-400">Good for:</span>{" "}
                <span className="text-gray-600 dark:text-gray-300">{currentHour.goodFor}</span>
              </div>
              <div>
                <span className="font-medium text-red-700 dark:text-red-400">Avoid:</span>{" "}
                <span className="text-gray-600 dark:text-gray-300">{currentHour.avoid}</span>
              </div>
            </div>
          </div>
        )}

        <CityHoursList hours={result.planetaryHours} timezone={city.timezone} />

        <CityFAQ
          city={city}
          sunrise={result.sunrise}
          sunset={result.sunset}
          dayRuler={result.dayRuler}
          timezone={city.timezone}
          daytimeHourDuration={daytimeHourDuration}
        />

        <RelatedCities cities={nearbyCities} currentSlug={city.slug} />

        <div className="text-center py-8">
          <p className="text-gray-600 dark:text-gray-300 mb-4">
            Want to calculate planetary hours for a custom location?
          </p>
          <Link
            href="/"
            className="inline-block bg-purple-600 hover:bg-purple-700 text-white font-medium px-6 py-3 rounded-lg transition-colors"
          >
            Open Full Calculator
          </Link>
        </div>
      </div>
    </>
  );
}
