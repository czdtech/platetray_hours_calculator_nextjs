import type { Metadata } from "next";
import { getSoftwareApplicationSchema } from "@/utils/seo/jsonld";
import CalculatorServer from "./CalculatorServer";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://planetaryhours.org";

// 🔧 关键修复：设置页面级别的revalidate时间
export const revalidate = 900; // 15分钟重新验证

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

/**
 * 主页面组件 - 实现动态缓存策略
 *
 * 第一阶段修复方案：
 * 1. 移除固定的revalidate时间
 * 2. 让CalculatorServer组件根据当前行星时状态动态计算缓存时间
 * 3. 通过服务端组件确保首次访问的准确性
 *
 * 缓存策略：
 * - 正常期：根据到下一个行星时切换点的时间设置TTL
 * - 敏感期（切换前5分钟）：30秒短缓存
 * - 错误情况：15分钟后备缓存
 */
export default function HomePage() {
  return <CalculatorServer />;
}
