import type { Metadata } from "next";
import { Header } from "@/components/Layout/Header";
import { Breadcrumb } from "@/components/SEO/Breadcrumb";
import { Article } from "@/components/semantic/Article";
import { getMessagesSync } from "@/i18n/getMessages";
import { siteConfig } from "@/config/seo";
import { getHreflangTags } from "@/utils/seo/hreflang";

const locale = "es";
const messages = getMessagesSync(locale);
const hreflang = getHreflangTags("/about");

export const metadata: Metadata = {
  title: messages.about.title,
  description: messages.about.description,
  alternates: {
    canonical: `${siteConfig.url}/es/about`,
    languages: hreflang,
  },
  openGraph: {
    title: `${messages.about.title} | ${siteConfig.name}`,
    description: messages.about.description,
    url: `${siteConfig.url}/es/about`,
    type: "website",
  },
};

export default function SpanishAboutPage() {
  const planetHourExamples = [
    messages.about.planetHourExamples.sun,
    messages.about.planetHourExamples.venus,
    messages.about.planetHourExamples.mercury,
    messages.about.planetHourExamples.moon,
    messages.about.planetHourExamples.saturn,
    messages.about.planetHourExamples.jupiter,
    messages.about.planetHourExamples.mars,
  ];

  const keyFeatureItems = [
    messages.about.keyFeaturesItems.locationInput,
    messages.about.keyFeaturesItems.timezoneHandling,
    messages.about.keyFeaturesItems.timeFormats,
    messages.about.keyFeaturesItems.weekNavigation,
    messages.about.keyFeaturesItems.contextualSuggestions,
  ];

  const breadcrumbItems = [
    { name: messages.common.home, url: "/es" },
    { name: messages.common.about, url: "/es/about" },
  ];

  return (
    <>
      <Header activePage="about" locale="es" />
      <div className="container mx-auto px-4 py-8 space-y-8">
        <div className="mb-4">
          <Breadcrumb items={breadcrumbItems} />
        </div>

        <Article className="bg-white rounded-xl shadow-lg p-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-6">
            {messages.about.title}
          </h2>

          <section className="mb-8">
            <h3 className="text-xl font-semibold text-gray-700 mb-4">
              {messages.about.whatArePH}
            </h3>
            <p className="text-gray-600 mb-4">
              {messages.about.whatArePHText}
            </p>
            <p className="text-gray-600 mb-4">
              {messages.about.chaldeanOrderText}
            </p>
          </section>

          <section className="mb-8">
            <h3 className="text-xl font-semibold text-gray-700 mb-4">
              {messages.about.howCanBeUsed}
            </h3>
            <p className="text-gray-600 mb-4">
              {messages.about.howCanBeUsedText} {messages.about.examplesIntro}
            </p>
            <ul className="list-disc pl-6 space-y-3 text-gray-600">
              {planetHourExamples.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </section>

          <section className="mb-8">
            <h3 className="text-xl font-semibold text-gray-700 mb-4">
              {messages.about.keyFeatures}
            </h3>
            <ul className="list-disc pl-6 space-y-3 text-gray-600">
              {keyFeatureItems.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </section>

          <section className="mb-8">
            <h3 className="text-xl font-semibold text-gray-700 mb-4">
              {messages.about.limitations}
            </h3>
            <p className="text-gray-600 mb-4">
              {messages.about.limitationsText}
            </p>
          </section>

          <p className="text-gray-600">
            {messages.about.closingText}
          </p>
        </Article>
      </div>
    </>
  );
}
