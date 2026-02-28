import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { formatInTimeZone } from "date-fns-tz";
import { ptBR } from "date-fns/locale/pt-BR";
import { Header } from "@/components/Layout/Header";
import { Breadcrumb } from "@/components/SEO/Breadcrumb";
import { JsonLd } from "@/components/SEO/JsonLd";
import { getBreadcrumbSchema } from "@/utils/seo/jsonld";
import { siteConfig } from "@/config/seo";
import { planetaryHoursCalculator } from "@/services/PlanetaryHoursCalculator";
import { getCityBySlug, getAllCitySlugs, getNearbyCities } from "@/data/cities";
import { PLANET_COLOR_CLASSES, PLANET_SYMBOLS } from "@/constants/planetColors";
import { getMessagesSync, t } from "@/i18n/getMessages";
import { getLocalizedCityDescription } from "@/i18n/cityDescription";
import { buildCityFaqItems } from "@/i18n/cityFaq";
import { FAQSection } from "@/components/FAQ/FAQSection";
import { getHreflangTags } from "@/utils/seo/hreflang";

const locale = "pt";
const messages = getMessagesSync(locale);
const planets = messages.planets as Record<string, string>;

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

  const today = formatInTimeZone(new Date(), city.timezone, "d 'de' MMMM, yyyy", { locale: ptBR });
  const title = `${t(messages.cityPage.title, { city: city.name })} – ${today}`;
  const description = t(messages.cityPage.description, { city: city.name, country: city.country });
  const hreflang = getHreflangTags(`/planetary-hours/${city.slug}`);

  return {
    title,
    description,
    keywords: [
      `horas planetárias ${city.name}`,
      `horas planetárias ${city.country}`,
      `${city.name} astrologia`,
      "calculadora horas planetárias",
    ],
    alternates: {
      canonical: `${siteConfig.url}/pt/planetary-hours/${city.slug}`,
      languages: hreflang,
    },
    openGraph: {
      title,
      description,
      url: `${siteConfig.url}/pt/planetary-hours/${city.slug}`,
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

function LocalizedHourRow({
  hour,
  timezone,
  now,
}: {
  hour: { hourNumberOverall: number; startTime: Date; endTime: Date; ruler: string; type: string; durationMinutes: number; goodFor: string; avoid: string };
  timezone: string;
  now: Date;
}) {
  const start = formatInTimeZone(hour.startTime, timezone, "h:mm a");
  const end = formatInTimeZone(hour.endTime, timezone, "h:mm a");
  const isCurrent = now.getTime() >= hour.startTime.getTime() && now.getTime() < hour.endTime.getTime();
  const colorClass = PLANET_COLOR_CLASSES[hour.ruler as keyof typeof PLANET_COLOR_CLASSES] || "text-gray-500";
  const symbol = PLANET_SYMBOLS[hour.ruler as keyof typeof PLANET_SYMBOLS] || "";
  const localizedPlanet = planets[hour.ruler] || hour.ruler;

  return (
    <tr className={`border-b border-gray-100 dark:border-gray-700 ${isCurrent ? "bg-purple-50 dark:bg-purple-900/20 font-semibold" : ""}`}>
      <td className="py-2 px-3 text-sm text-gray-500 dark:text-gray-400">{hour.hourNumberOverall <= 12 ? hour.hourNumberOverall : hour.hourNumberOverall - 12}</td>
      <td className={`py-2 px-3 text-sm font-medium ${colorClass}`}>
        <span className="mr-1">{symbol}</span>
        {localizedPlanet}
        {isCurrent && <span className="ml-2 text-xs bg-purple-600 text-white px-2 py-0.5 rounded-full">{messages.calculator.now}</span>}
      </td>
      <td className="py-2 px-3 text-sm text-gray-600 dark:text-gray-300">{start} – {end}</td>
      <td className="py-2 px-3 text-sm text-gray-500 dark:text-gray-400 hidden sm:table-cell">{hour.durationMinutes} min</td>
    </tr>
  );
}

export default async function PortugueseCityPage({ params }: CityPageProps) {
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
        <Header activePage="cities" locale="pt" />
        <div className="container mx-auto px-4 py-16 text-center">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
            {messages.calculator.calculationError}
          </h1>
          <p className="text-gray-600 dark:text-gray-300 mt-4">
            {t(messages.calculator.calculationErrorMessage, { city: city.name })}
          </p>
          <Link href="/pt/planetary-hours" className="inline-block mt-6 text-purple-600 hover:text-purple-700 font-medium">
            ← {messages.calculator.backToAllCities}
          </Link>
        </div>
      </>
    );
  }

  const breadcrumbItems = [
    { name: messages.common.home, url: "/pt" },
    { name: messages.common.cities, url: "/pt/planetary-hours" },
    { name: city.name, url: `/pt/planetary-hours/${city.slug}` },
  ];
  const breadcrumbSchema = getBreadcrumbSchema(
    breadcrumbItems.map((item) => ({ name: item.name, url: `${siteConfig.url}${item.url}` })),
  );

  const currentHour = planetaryHoursCalculator.getCurrentHour(result, now);
  const dayHours = result.planetaryHours.filter((h) => h.type === "day");
  const nightHours = result.planetaryHours.filter((h) => h.type === "night");
  const daytimeHourDuration = dayHours.length > 0 ? dayHours[0].durationMinutes : 60;
  const nearbyCities = getNearbyCities(city.slug, 5);

  const currentHourColor = currentHour
    ? PLANET_COLOR_CLASSES[currentHour.ruler as keyof typeof PLANET_COLOR_CLASSES] || "text-gray-600"
    : "";
  const currentHourSymbol = currentHour
    ? PLANET_SYMBOLS[currentHour.ruler as keyof typeof PLANET_SYMBOLS] || ""
    : "";

  const sunriseFormatted = formatInTimeZone(result.sunrise, city.timezone, "h:mm a");
  const sunsetFormatted = formatInTimeZone(result.sunset, city.timezone, "h:mm a");
  const dateFormatted = formatInTimeZone(new Date(), city.timezone, "EEEE, MMMM d, yyyy", { locale: ptBR });

  const dayRulerColor = PLANET_COLOR_CLASSES[result.dayRuler as keyof typeof PLANET_COLOR_CLASSES] || "text-gray-600";
  const dayRulerSymbol = PLANET_SYMBOLS[result.dayRuler as keyof typeof PLANET_SYMBOLS] || "";
  const dayRulerLabel = planets[result.dayRuler] || result.dayRuler;

  const latDir = city.latitude >= 0 ? "N" : "S";
  const lonDir = city.longitude >= 0 ? "E" : "W";

  const nighttimeHourDuration = Math.round(((24 * 60 - daytimeHourDuration * 12) / 12) * 100) / 100;

  const faqItems = buildCityFaqItems(
    {
      city,
      sunriseFormatted,
      dayRulerLabel,
      daytimeHourDuration,
      nighttimeHourDuration,
    },
    messages,
  );

  return (
    <>
      <Header activePage="cities" locale="pt" />
      <JsonLd data={breadcrumbSchema} />

      <div className="container mx-auto px-4 py-6 space-y-6">
        <div className="mb-2">
          <Breadcrumb items={breadcrumbItems} />
        </div>

        {/* City Info */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-gray-100">
                {t(messages.cityPage.title, { city: city.name })}
              </h1>
              <p className="text-gray-500 dark:text-gray-400 mt-1">{dateFormatted}</p>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                {city.country} · {Math.abs(city.latitude).toFixed(4)}°{latDir}, {Math.abs(city.longitude).toFixed(4)}°{lonDir}
              </p>
            </div>

            <div className="flex flex-wrap gap-4">
              <div className="bg-amber-50 dark:bg-amber-900/20 rounded-lg px-4 py-3 text-center min-w-[100px]">
                <p className="text-xs text-amber-600 dark:text-amber-400 font-medium uppercase">{messages.calculator.sunrise}</p>
                <p className="text-lg font-semibold text-amber-800 dark:text-amber-200">☀️ {sunriseFormatted}</p>
              </div>
              <div className="bg-indigo-50 dark:bg-indigo-900/20 rounded-lg px-4 py-3 text-center min-w-[100px]">
                <p className="text-xs text-indigo-600 dark:text-indigo-400 font-medium uppercase">{messages.calculator.sunset}</p>
                <p className="text-lg font-semibold text-indigo-800 dark:text-indigo-200">🌅 {sunsetFormatted}</p>
              </div>
              <div className="bg-purple-50 dark:bg-purple-900/20 rounded-lg px-4 py-3 text-center min-w-[100px]">
                <p className="text-xs text-purple-600 dark:text-purple-400 font-medium uppercase">{messages.calculator.dayRuler}</p>
                <p className={`text-lg font-semibold ${dayRulerColor}`}>{dayRulerSymbol} {dayRulerLabel}</p>
              </div>
            </div>
          </div>

          <div className="mt-4 text-sm text-gray-600 dark:text-gray-300">
            <p>{messages.cityPage.timezone}: <span className="font-medium">{city.timezone}</span></p>
          </div>

          <p className="mt-3 text-gray-600 dark:text-gray-300 text-sm">
            {getLocalizedCityDescription(city, locale, messages)}
          </p>
        </div>

        {/* Current Hour */}
        {currentHour && (
          <div className="bg-gradient-to-r from-purple-50 to-indigo-50 dark:from-purple-900/20 dark:to-indigo-900/20 rounded-xl shadow-sm border border-purple-200 dark:border-purple-800 p-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">{messages.calculator.currentHour}</h2>
            <div className="flex items-center gap-3">
              <span className={`text-3xl font-bold ${currentHourColor}`}>
                {currentHourSymbol} {planets[currentHour.ruler] || currentHour.ruler}
              </span>
              <span className="text-gray-500 dark:text-gray-400">·</span>
              <span className="text-gray-600 dark:text-gray-300">
                {formatInTimeZone(currentHour.startTime, city.timezone, "h:mm a")} – {formatInTimeZone(currentHour.endTime, city.timezone, "h:mm a")}
              </span>
              <span className="text-xs bg-purple-100 dark:bg-purple-800 text-purple-700 dark:text-purple-200 px-2 py-1 rounded-full">
                {currentHour.type === "day" ? messages.calculator.daytime : messages.calculator.nighttime}
              </span>
            </div>
            <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm">
              <div>
                <span className="font-medium text-green-700 dark:text-green-400">{messages.calculator.goodFor}:</span>{" "}
                <span className="text-gray-600 dark:text-gray-300">{currentHour.goodFor}</span>
              </div>
              <div>
                <span className="font-medium text-red-700 dark:text-red-400">{messages.calculator.avoid}:</span>{" "}
                <span className="text-gray-600 dark:text-gray-300">{currentHour.avoid}</span>
              </div>
            </div>
          </div>
        )}

        {/* Hours List */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
            <div className="bg-amber-50 dark:bg-amber-900/20 px-4 py-3 border-b border-amber-100 dark:border-amber-800">
              <h3 className="text-lg font-semibold text-amber-800 dark:text-amber-200 flex items-center gap-2">
                <span>☀️</span> {messages.calculator.daytimeHours}
              </h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-gray-50 dark:bg-gray-750 text-left">
                    <th className="py-2 px-3 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">#</th>
                    <th className="py-2 px-3 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">{messages.calculator.planet}</th>
                    <th className="py-2 px-3 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">{messages.calculator.time}</th>
                    <th className="py-2 px-3 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase hidden sm:table-cell">{messages.calculator.duration}</th>
                  </tr>
                </thead>
                <tbody>
                  {dayHours.map((hour) => (
                    <LocalizedHourRow key={hour.hourNumberOverall} hour={hour} timezone={city.timezone} now={now} />
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
            <div className="bg-indigo-50 dark:bg-indigo-900/20 px-4 py-3 border-b border-indigo-100 dark:border-indigo-800">
              <h3 className="text-lg font-semibold text-indigo-800 dark:text-indigo-200 flex items-center gap-2">
                <span>🌙</span> {messages.calculator.nighttimeHours}
              </h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-gray-50 dark:bg-gray-750 text-left">
                    <th className="py-2 px-3 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">#</th>
                    <th className="py-2 px-3 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">{messages.calculator.planet}</th>
                    <th className="py-2 px-3 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">{messages.calculator.time}</th>
                    <th className="py-2 px-3 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase hidden sm:table-cell">{messages.calculator.duration}</th>
                  </tr>
                </thead>
                <tbody>
                  {nightHours.map((hour) => (
                    <LocalizedHourRow key={hour.hourNumberOverall} hour={hour} timezone={city.timezone} now={now} />
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* FAQ */}
        <FAQSection
          faqs={faqItems}
          includeSchema
          locale={locale}
          messages={messages}
          title={messages.cityPage.faq}
        />

        {/* Related Cities */}
        {nearbyCities.length > 0 && (
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-4">
              {messages.cityPage.otherCities}
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
              {nearbyCities.filter((c) => c.slug !== city.slug).slice(0, 5).map((nearbyCity) => (
                <Link
                  key={nearbyCity.slug}
                  href={`/pt/planetary-hours/${nearbyCity.slug}`}
                  className="block bg-gray-50 dark:bg-gray-750 hover:bg-purple-50 dark:hover:bg-purple-900/20 rounded-lg p-4 transition-colors border border-gray-100 dark:border-gray-700 hover:border-purple-200 dark:hover:border-purple-700"
                >
                  <p className="font-medium text-gray-900 dark:text-gray-100">{nearbyCity.name}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{nearbyCity.country}</p>
                  <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">{nearbyCity.timezone}</p>
                </Link>
              ))}
            </div>
          </div>
        )}

        <div className="text-center py-8">
          <p className="text-gray-600 dark:text-gray-300 mb-4">
            {messages.cityPage.customLocation}
          </p>
          <Link
            href="/pt"
            className="inline-block bg-purple-600 hover:bg-purple-700 text-white font-medium px-6 py-3 rounded-lg transition-colors"
          >
            {messages.calculator.openCalculator}
          </Link>
        </div>
      </div>
    </>
  );
}
