/**
 * SEO配置中心
 * 统一管理网站的SEO相关配置信息
 */

// 站点基础信息
export const siteConfig = {
  name: "Planetary Hours Calculator",
  url: process.env.NEXT_PUBLIC_SITE_URL || "https://planetaryhours.org",
  description:
    "Calculate planetary hours based on your location and date. Discover the perfect time for your activities with ancient planetary wisdom.",
  author: "Planetary Hours Team",
  keywords: [
    "planetary hours",
    "astrology calculator",
    "planetary timing",
    "ancient wisdom",
    "astrological hours",
    "planetary magic",
    "timing calculator",
    "celestial hours",
  ] as string[],
  language: "en",
  locale: "en_US",
} as const;

// 默认元数据配置
export const defaultMetadata = {
  title: {
    default: siteConfig.name,
    template: `%s | ${siteConfig.name}`,
  },
  description: siteConfig.description,
  keywords: siteConfig.keywords,
  authors: [{ name: siteConfig.author }],
  creator: siteConfig.author,
  publisher: siteConfig.author,
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
    canonical: siteConfig.url,
  },
} as const;

// 社交媒体配置
export const socialConfig = {
  twitter: {
    card: "summary_large_image" as const,
    site: "@planetaryhours",
    creator: "@planetaryhours",
  },
  openGraph: {
    type: "website" as const,
    locale: siteConfig.locale,
    siteName: siteConfig.name,
    images: [
      {
        url: "/og-image.jpg",
        width: 1200,
        height: 630,
        alt: `${siteConfig.name} - ${siteConfig.description}`,
      },
    ],
  },
} as const;

// 图片配置
export const imageConfig = {
  defaultOgImage: "/og-image.jpg",
  defaultBlogImage: "/images/blog-default.jpg",
  logoUrl: "/logo.png",
  faviconUrl: "/favicon.ico",
  appleTouchIcon: "/apple-touch-icon.png",
} as const;

// Schema.org 配置
export const schemaConfig = {
  organization: {
    name: siteConfig.name,
    url: siteConfig.url,
    logo: `${siteConfig.url}${imageConfig.logoUrl}`,
    sameAs: [
      // 添加社交媒体链接
      "https://twitter.com/planetaryhours",
      "https://facebook.com/planetaryhours",
    ],
  },
  website: {
    name: siteConfig.name,
    url: siteConfig.url,
    description: siteConfig.description,
    inLanguage: siteConfig.language,
  },
  author: {
    name: siteConfig.author,
    url: siteConfig.url,
  },
} as const;

// 页面类型配置
export const pageTypes = {
  home: {
    title: "Planetary Hours Calculator | Find Your Planetary Hours Online",
    description:
      "Calculate planetary hours based on your location and date. Discover the perfect time for your activities with ancient planetary wisdom.",
    keywords: [
      "planetary hours calculator",
      "online calculator",
      "astrology timing",
    ] as string[],
  },
  blog: {
    title: "Blog | Planetary Hours Calculator",
    description:
      "Learn about planetary hours, astrological timing, and ancient wisdom through our comprehensive blog articles.",
    keywords: [
      "planetary hours blog",
      "astrology articles",
      "timing wisdom",
    ] as string[],
  },
  about: {
    title: "About | Planetary Hours Calculator",
    description:
      "Learn about our planetary hours calculator and the ancient wisdom behind astrological timing.",
    keywords: [
      "about planetary hours",
      "calculator information",
      "astrology background",
    ] as string[],
  },
  privacy: {
    title: "Privacy Policy | Planetary Hours Calculator",
    description:
      "Our privacy policy explains how we collect, use, and protect your personal information.",
    keywords: ["privacy policy", "data protection", "user privacy"] as string[],
  },
  terms: {
    title: "Terms of Service | Planetary Hours Calculator",
    description:
      "Terms and conditions for using our planetary hours calculator service.",
    keywords: [
      "terms of service",
      "usage terms",
      "service conditions",
    ] as string[],
  },
} as const;

// 结构化数据默认配置
export const structuredDataConfig = {
  enableWebSite: true,
  enableBreadcrumbs: true,
  enableArticle: true,
  enableFAQ: true,
  enableOrganization: true,
  enableLocalBusiness: false, // 如果是本地业务则启用
} as const;

// 获取完整的图片URL
export function getFullImageUrl(imagePath: string): string {
  if (imagePath.startsWith("http")) {
    return imagePath;
  }
  return `${siteConfig.url}${imagePath.startsWith("/") ? "" : "/"}${imagePath}`;
}

// 获取页面的完整URL
export function getFullPageUrl(path: string): string {
  const cleanPath = path.startsWith("/") ? path : `/${path}`;
  return `${siteConfig.url}${cleanPath}`;
}
