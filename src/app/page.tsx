import type { Metadata } from "next";
import { getSoftwareApplicationSchema } from "@/utils/seo/jsonld";
import CalculatorServer from "./CalculatorServer";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://planetaryhours.org";

export const metadata: Metadata = {
  title: "Planetary Hours Calculator - Find Your Perfect Timing",
  description: "Discover the perfect timing with our planetary hours calculator. Calculate astrological planetary hours based on your location and date for optimal life decisions.",
  keywords: [
    "planetary hours",
    "astrological timing",
    "planetary calculator",
    "astrology hours",
    "timing calculator",
    "planetary influences",
    "astrological calculator",
    "magical hours",
    "planetary periods"
  ],
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
  openGraph: {
    title: "Planetary Hours Calculator - Find Your Perfect Timing",
    description: "Discover the perfect timing with our planetary hours calculator. Calculate astrological planetary hours based on your location and date for optimal life decisions.",
    url: SITE_URL,
    siteName: "Planetary Hours Calculator",
    locale: "en_US",
    type: "website",
    images: [
      {
        url: `${SITE_URL}/images/og-image.jpg`,
        width: 1200,
        height: 630,
        alt: "Planetary Hours Calculator - Astrological Timing Tool",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Planetary Hours Calculator - Find Your Perfect Timing",
    description: "Discover the perfect timing with our planetary hours calculator. Calculate astrological planetary hours based on your location and date for optimal life decisions.",
    images: [`${SITE_URL}/images/og-image.jpg`],
    creator: "@planetaryhours",
  },
  alternates: {
    canonical: SITE_URL,
  },
  verification: {
    google: "your-google-verification-code",
  },
  other: {
    "application-ld+json": JSON.stringify(getSoftwareApplicationSchema({
      name: "Planetary Hours Calculator",
      description: "Calculate planetary hours for any location with our advanced calculator. Discover optimal timing based on ancient wisdom. Free astronomical tool.",
      url: SITE_URL,
      applicationCategory: "UtilityApplication",
      featureList: [
        "Global location support with automatic timezone detection",
        "Accurate astronomical calculations for sunrise/sunset",
        "Real-time planetary hours display",
        "Interactive date and location selection",
        "Mobile-responsive design",
        "Free to use with no registration required"
      ],
      publisherName: "Planetary Hours Calculator"
    })),
  },
};

export const revalidate = 3600;

export default function HomePage() {
  return <CalculatorServer />;
}
