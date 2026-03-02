import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { formatInTimeZone } from "date-fns-tz";
import { ptBR } from "date-fns/locale/pt-BR";
import { Header } from "@/components/Layout/Header";
import { CityInfo } from "@/components/CityCalculator/CityInfo";
import { CityCurrentHourCard } from "@/components/CityCalculator/CityCurrentHourCard";
import { CityHoursList } from "@/components/CityCalculator/CityHoursList";
import { CityFAQ } from "@/components/CityCalculator/CityFAQ";
import { RelatedCities } from "@/components/CityCalculator/RelatedCities";
import { Breadcrumb } from "@/components/SEO/Breadcrumb";
import { JsonLd } from "@/components/SEO/JsonLd";
import { getBreadcrumbSchema } from "@/utils/seo/jsonld";
import { siteConfig } from "@/config/seo";
import { planetaryHoursCalculator } from "@/services/PlanetaryHoursCalculator";
import { getCityBySlug, getAllCitySlugs, getNearbyCities } from "@/data/cities";
import { getMessagesSync, t } from "@/i18n/getMessages";
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

export default async function PortugueseCityPage({ params }: CityPageProps) {
  const { city: slug } = await params;
  const city = getCityBySlug(slug);
  if (!city) notFound();

  const calculationDate = new Date();
  const result = await planetaryHoursCalculator.calculate(
    calculationDate,
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

  const dayHours = result.planetaryHours.filter((h) => h.type === "day");
  const daytimeHourDuration = dayHours.length > 0 ? dayHours[0].durationMinutes : 60;
  const nearbyCities = getNearbyCities(city.slug, 5);

  return (
    <>
      <Header activePage="cities" locale="pt" />
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
          locale={locale}
          messages={messages}
        />

        <CityCurrentHourCard
          hours={result.planetaryHours}
          timezone={city.timezone}
          locale={locale}
          labels={{
            currentHour: messages.calculator.currentHour,
            daytime: messages.calculator.daytime,
            nighttime: messages.calculator.nighttime,
            goodFor: messages.calculator.goodFor,
            avoid: messages.calculator.avoid,
          }}
          localizedPlanets={planets}
        />

        <CityHoursList
          hours={result.planetaryHours}
          timezone={city.timezone}
          labels={{
            daytimeHours: messages.calculator.daytimeHours,
            nighttimeHours: messages.calculator.nighttimeHours,
            planet: messages.calculator.planet,
            time: messages.calculator.time,
            duration: messages.calculator.duration,
            now: messages.calculator.now,
          }}
          localizedPlanets={planets}
        />

        <CityFAQ
          city={city}
          sunrise={result.sunrise}
          dayRuler={result.dayRuler}
          timezone={city.timezone}
          daytimeHourDuration={daytimeHourDuration}
          locale={locale}
          messages={messages}
        />

        <RelatedCities
          cities={nearbyCities}
          currentSlug={city.slug}
          locale={locale}
          messages={messages}
        />

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
