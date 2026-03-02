import type { Metadata } from "next";
import Link from "next/link";
import { Header } from "@/components/Layout/Header";
import { Breadcrumb } from "@/components/SEO/Breadcrumb";
import { JsonLd } from "@/components/SEO/JsonLd";
import { getBreadcrumbSchema } from "@/utils/seo/jsonld";
import { siteConfig } from "@/config/seo";
import { cities } from "@/data/cities";
import { getMessagesSync } from "@/i18n/getMessages";
import { getLocalizedRegionName } from "@/i18n/regions";
import { getLocalizedCityDescription } from "@/i18n/cityDescription";
import { getHreflangTags } from "@/utils/seo/hreflang";

const locale = "es";
const messages = getMessagesSync(locale);

const hreflang = getHreflangTags("/planetary-hours");

export const metadata: Metadata = {
  title: "Horas Planetarias por Ciudad | Calculadora Gratuita para 100+ Ciudades",
  description:
    "Calcula las horas planetarias para ciudades de todo el mundo. Consulta las horas planetarias de hoy, amanecer, atardecer y regente del día para más de 100 ciudades.",
  keywords: [
    "horas planetarias por ciudad",
    "horas planetarias ciudades",
    "horas planetarias mundial",
    "calculadora horas planetarias",
  ],
  alternates: {
    canonical: `${siteConfig.url}/es/planetary-hours`,
    languages: hreflang,
  },
  openGraph: {
    title: "Horas Planetarias por Ciudad | Calculadora Gratuita",
    description:
      "Calcula las horas planetarias para ciudades de todo el mundo.",
    url: `${siteConfig.url}/es/planetary-hours`,
    type: "website",
    siteName: siteConfig.name,
  },
};

export default function SpanishCityIndex() {
  const breadcrumbItems = [
    { name: messages.common.home, url: "/es" },
    { name: messages.common.cities, url: "/es/planetary-hours" },
  ];
  const breadcrumbSchema = getBreadcrumbSchema(
    breadcrumbItems.map((item) => ({ name: item.name, url: `${siteConfig.url}${item.url}` })),
  );

  const regions = Array.from(new Set(cities.map((c) => c.region)));
  const citiesByRegion = regions.map((region) => ({
    region,
    cities: cities.filter((c) => c.region === region),
  }));

  return (
    <>
      <Header activePage="cities" locale="es" />
      <JsonLd data={breadcrumbSchema} />

      <div className="container mx-auto px-4 py-6 space-y-8">
        <div className="mb-2">
          <Breadcrumb items={breadcrumbItems} />
        </div>

        <div className="text-center max-w-2xl mx-auto">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-gray-100">
            {messages.cityIndex.title}
          </h1>
          <p className="mt-3 text-gray-600 dark:text-gray-300">
            {messages.cityIndex.description}
          </p>
        </div>

        {citiesByRegion.map(({ region, cities: regionCities }) => (
          <section key={region}>
            <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-4 border-b border-gray-200 dark:border-gray-700 pb-2">
              {getLocalizedRegionName(region, messages)}
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {regionCities.map((city) => (
                <Link
                  key={city.slug}
                  href={`/es/planetary-hours/${city.slug}`}
                  className="block bg-white dark:bg-gray-800 hover:bg-purple-50 dark:hover:bg-purple-900/20 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 hover:border-purple-300 dark:hover:border-purple-700 p-5 transition-colors"
                >
                  <h3 className="font-semibold text-gray-900 dark:text-gray-100">{city.name}</h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                    {city.country}
                  </p>
                  <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                    {city.timezone}
                  </p>
                  <p className="text-xs text-gray-400 dark:text-gray-500 mt-2 line-clamp-2">
                    {getLocalizedCityDescription(city, locale, messages)}
                  </p>
                </Link>
              ))}
            </div>
          </section>
        ))}

        <div className="text-center py-8">
          <p className="text-gray-600 dark:text-gray-300 mb-4">
            {messages.cityIndex.dontSeeCity}
          </p>
          <Link
            href="/es"
            className="inline-block bg-purple-600 hover:bg-purple-700 text-white font-medium px-6 py-3 rounded-lg transition-colors"
          >
            {messages.calculator.openCalculator}
          </Link>
        </div>
      </div>
    </>
  );
}
