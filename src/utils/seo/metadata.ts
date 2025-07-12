import type { Metadata } from "next";
import {
  siteConfig,
  defaultMetadata,
  socialConfig,
  imageConfig,
  getFullImageUrl,
  getFullPageUrl,
} from "@/config/seo";

// 页面元数据选项
export interface PageMetadataOptions {
  title?: string;
  description?: string;
  keywords?: string[];
  image?: string;
  path?: string;
  type?: "website" | "article";
  publishedTime?: string;
  modifiedTime?: string;
  authors?: string[];
  noIndex?: boolean;
}

/**
 * 生成页面元数据 - 简化版
 */
export function generatePageMetadata(
  options: PageMetadataOptions = {},
): Metadata {
  const {
    title,
    description = defaultMetadata.description,
    keywords = defaultMetadata.keywords,
    image = imageConfig.defaultOgImage,
    path = "/",
    type = "website",
    publishedTime,
    modifiedTime,
    authors,
    noIndex = false,
  } = options;

  const fullUrl = getFullPageUrl(path);
  const fullImageUrl = getFullImageUrl(image);
  const pageTitle = title || defaultMetadata.title.default;

  const metadata: Metadata = {
    title: pageTitle,
    description,
    keywords,
    authors: authors?.map((name) => ({ name })) || [...defaultMetadata.authors],
    creator: defaultMetadata.creator,
    publisher: defaultMetadata.publisher,
    robots: noIndex ? { index: false, follow: false } : defaultMetadata.robots,
    alternates: { canonical: fullUrl },
    openGraph: {
      title: pageTitle,
      description,
      url: fullUrl,
      siteName: socialConfig.openGraph.siteName,
      locale: socialConfig.openGraph.locale,
      type,
      images: [{
        url: fullImageUrl,
        width: 1200,
        height: 630,
        alt: pageTitle,
      }],
    },
    twitter: {
      card: socialConfig.twitter.card,
      site: socialConfig.twitter.site,
      creator: socialConfig.twitter.creator,
      title: pageTitle,
      description,
      images: [fullImageUrl],
    },
  };

  // 添加文章特定的元数据
  if (type === "article" && metadata.openGraph) {
    const openGraphWithArticle = metadata.openGraph as Record<string, unknown>;
    openGraphWithArticle.type = "article";
    if (publishedTime) openGraphWithArticle.publishedTime = publishedTime;
    if (modifiedTime) openGraphWithArticle.modifiedTime = modifiedTime;
    if (authors) openGraphWithArticle.authors = authors;
  }

  return metadata;
}

// 博客文章元数据选项
export interface BlogMetadataOptions {
  title: string;
  description: string;
  slug: string;
  publishedTime: string;
  modifiedTime?: string;
  author: string;
  image?: string;
  keywords?: string[];
}

/**
 * 生成博客文章元数据
 */
export function generateBlogMetadata(options: BlogMetadataOptions): Metadata {
  const {
    title,
    description,
    slug,
    publishedTime,
    modifiedTime,
    author,
    image = imageConfig.defaultBlogImage,
    keywords = [],
  } = options;

  const blogKeywords = [
    ...keywords,
    "planetary hours",
    "astrology",
    "blog",
    "article",
  ];

  return generatePageMetadata({
    title,
    description,
    keywords: blogKeywords,
    image,
    path: `/blog/${slug}`,
    type: "article",
    publishedTime,
    modifiedTime,
    authors: [author],
  });
}

// 获取默认的网站元数据
export function getDefaultSiteMetadata(): Metadata {
  return {
    metadataBase: new URL(siteConfig.url),
    ...defaultMetadata,
    authors: [...defaultMetadata.authors],
    manifest: '/manifest.json',
    icons: {
      icon: [
        { url: "/favicon.ico", type: "image/x-icon" },
        { url: "/favicon-16x16.png", sizes: "16x16", type: "image/png" },
        { url: "/favicon-32x32.png", sizes: "32x32", type: "image/png" },
        { url: "/android-chrome-192x192.png", sizes: "192x192", type: "image/png" },
        { url: "/android-chrome-512x512.png", sizes: "512x512", type: "image/png" },
      ],
      apple: [
        { url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" },
      ],
    },
    other: {
      "theme-color": "#ffffff",
    },
  };
}
