import type { Metadata } from "next";
import Link from "next/link";
import { Header } from "@/components/Layout/Header";
import { Section } from "@/components/semantic/Section";
import { getMessagesSync } from "@/i18n/getMessages";
import { siteConfig } from "@/config/seo";
import { getHreflangTags } from "@/utils/seo/hreflang";

const locale = "pt";
const messages = getMessagesSync(locale);
const hreflang = getHreflangTags("/");

export const metadata: Metadata = {
  title: messages.home.metaTitle,
  description: messages.home.metaDescription,
  alternates: {
    canonical: `${siteConfig.url}/pt`,
    languages: hreflang,
  },
  openGraph: {
    title: messages.home.metaTitle,
    description: messages.home.metaDescription,
    url: `${siteConfig.url}/pt`,
    type: "website",
    siteName: siteConfig.name,
  },
};

export default function PortugueseHomePage() {
  return (
    <>
      <Header activePage="calculator" locale="pt" />
      <div className="container mx-auto px-4 py-8">
        <Section className="py-12 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-6 bg-gradient-to-r from-purple-500 to-indigo-400 bg-clip-text text-transparent">
            {messages.home.title}
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto mb-10">
            {messages.home.subtitle}
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
            <Link
              href="/"
              className="inline-block bg-purple-600 hover:bg-purple-700 text-white font-medium px-8 py-4 rounded-lg transition-colors text-lg shadow-md hover:shadow-lg"
            >
              {messages.calculator.openCalculator}
            </Link>
            <Link
              href="/pt/planetary-hours"
              className="inline-block bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-800 dark:text-gray-200 font-medium px-8 py-4 rounded-lg transition-colors text-lg border border-gray-200 dark:border-gray-600"
            >
              {messages.common.cities}
            </Link>
          </div>
        </Section>

        <Section className="py-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            <Link
              href="/pt/blog"
              className="block bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-8 hover:shadow-md transition-shadow text-center"
            >
              <div className="text-4xl mb-4">📖</div>
              <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-100 mb-2">
                {messages.common.blog}
              </h2>
              <p className="text-gray-600 dark:text-gray-300 text-sm">
                {messages.blog.description}
              </p>
            </Link>

            <Link
              href="/pt/planetary-hours"
              className="block bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-8 hover:shadow-md transition-shadow text-center"
            >
              <div className="text-4xl mb-4">🌍</div>
              <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-100 mb-2">
                {messages.common.cities}
              </h2>
              <p className="text-gray-600 dark:text-gray-300 text-sm">
                {messages.cityIndex.description}
              </p>
            </Link>

            <Link
              href="/pt/about"
              className="block bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-8 hover:shadow-md transition-shadow text-center"
            >
              <div className="text-4xl mb-4">ℹ️</div>
              <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-100 mb-2">
                {messages.common.about}
              </h2>
              <p className="text-gray-600 dark:text-gray-300 text-sm">
                {messages.about.description}
              </p>
            </Link>
          </div>
        </Section>
      </div>
    </>
  );
}
