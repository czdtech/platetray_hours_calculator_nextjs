import { Metadata } from "next";
import { getSoftwareApplicationSchema } from "@/utils/seo/jsonld";
import CalculatorPageOptimized from "./CalculatorPageOptimized";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://planetaryhours.org";

export const metadata: Metadata = {
  title: "Planetary Hours Calculator - Find Your Perfect Timing",
  description:
    "Calculate planetary hours for any location with our advanced calculator. Discover optimal timing based on ancient wisdom. Free astronomical tool.",
  keywords: [
    "planetary hours",
    "astrological timing",
    "magical hours",
    "astrology calculator",
    "planetary timing",
    "ancient wisdom",
    "astronomical calculations",
  ],
  openGraph: {
    title: "Planetary Hours Calculator - Find Your Perfect Timing",
    description:
      "Calculate planetary hours for any location with our advanced calculator. Discover optimal timing based on ancient wisdom.",
    type: "website",
    url: SITE_URL,
    images: [
      {
        url: "/images/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "Planetary Hours Calculator",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Planetary Hours Calculator - Find Your Perfect Timing",
    description:
      "Calculate planetary hours for any location with our advanced calculator. Discover optimal timing based on ancient wisdom.",
    images: ["/images/og-image.jpg"],
  },
  alternates: {
    canonical: SITE_URL,
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

export default function HomePage() {
  return <CalculatorPageOptimized />;
}
