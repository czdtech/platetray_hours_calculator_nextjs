import type { Metadata } from "next";
import Script from "next/script";
import { getSoftwareApplicationSchema } from "@/utils/seo/jsonld";
import { getHreflangTags } from "@/utils/seo/hreflang";
import { getMessagesSync } from "@/i18n/getMessages";
import { siteConfig } from "@/config/seo";
import CalculatorServer from "./CalculatorServer";

const locale = "en";
const messages = getMessagesSync(locale);
const hreflang = getHreflangTags("/");

// 页面完全动态渲染，配合 CalculatorServer 的实时 TTL 策略
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
  openGraph: {
    title: messages.home.metaTitle,
    description: messages.home.metaDescription,
    url: siteConfig.url,
    siteName: siteConfig.name,
    locale: "en_US",
    type: "website",
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
  alternates: {
    canonical: siteConfig.url,
    languages: hreflang,
  },
};

const softwareAppSchema = getSoftwareApplicationSchema({
  name: messages.home.title,
  description: messages.home.metaDescription,
  url: siteConfig.url,
  applicationCategory: "UtilityApplication",
  featureList: messages.home.featureList,
  publisherName: messages.common.siteName,
  inLanguage: locale,
});

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
  return (
    <>
      <Script
        id="software-ld-json"
        type="application/ld+json"
        strategy="afterInteractive"
      >
        {JSON.stringify(softwareAppSchema)}
      </Script>
      <CalculatorServer locale={locale} />
    </>
  );
}
