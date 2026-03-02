import type { Metadata } from "next";
import Script from "next/script";
import { getSoftwareApplicationSchema } from "@/utils/seo/jsonld";
import { getHreflangTags } from "@/utils/seo/hreflang";
import { getMessagesSync } from "@/i18n/getMessages";
import { siteConfig } from "@/config/seo";
import CalculatorServer from "../CalculatorServer";

const locale = "pt";
const messages = getMessagesSync(locale);
const hreflang = getHreflangTags("/");

export const revalidate = 0;

export const metadata: Metadata = {
  title: messages.home.metaTitle,
  description: messages.home.metaDescription,
  keywords: messages.home.keywords,
  authors: [{ name: "Planetary Hours Team" }],
  creator: "Planetary Hours Calculator",
  publisher: "Planetary Hours",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
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
    locale: "pt_BR",
    images: [
      {
        url: `${siteConfig.url}/images/og-image.jpg`,
        width: 1200,
        height: 630,
        alt: messages.home.metaTitle,
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: messages.home.metaTitle,
    description: messages.home.metaDescription,
    images: [`${siteConfig.url}/images/og-image.jpg`],
    creator: "@planetaryhours",
  },
};

const softwareAppSchema = getSoftwareApplicationSchema({
  name: messages.home.title,
  description: messages.home.metaDescription,
  url: `${siteConfig.url}/pt`,
  applicationCategory: "UtilityApplication",
  featureList: messages.home.featureList,
  publisherName: messages.common.siteName,
  inLanguage: locale,
});

export default function PortugueseHomePage() {
  return (
    <>
      <Script id="software-ld-json-pt" type="application/ld+json" strategy="afterInteractive">
        {JSON.stringify(softwareAppSchema)}
      </Script>
      <CalculatorServer locale={locale} />
    </>
  );
}
