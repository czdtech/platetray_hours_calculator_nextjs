export type WebSiteSchemaOptions = {
  siteUrl: string;
  /** 网站名称，例如 Planetary Hours Calculator */
  name: string;
  description?: string;
  /** 站点 logo 绝对 URL，可选 */
  logoUrl?: string;
};

export function getWebSiteSchema({ siteUrl, name, description, logoUrl }: WebSiteSchemaOptions) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const schema: Record<string, any> = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    url: siteUrl,
    name,
  };
  if (description) schema.description = description;
  if (logoUrl) schema.publisher = {
    '@type': 'Organization',
    name,
    logo: {
      '@type': 'ImageObject',
      url: logoUrl,
    },
  };
  return schema;
}

export type BreadcrumbItem = {
  name: string;
  url: string;
};

export function getBreadcrumbSchema(items: BreadcrumbItem[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, idx) => ({
      '@type': 'ListItem',
      position: idx + 1,
      name: item.name,
      item: item.url,
    })),
  };
}

export type ArticleSchemaOptions = {
  title: string;
  description: string;
  authorName: string;
  /** 文章发布时间 (ISO 字符串) */
  datePublished: string;
  /** 最后更新日期 (ISO) 可选 */
  dateModified?: string;
  /** 文章 URL */
  url: string;
  /** 缩略图绝对 URL，可选 */
  imageUrl?: string;
};

export function getArticleSchema({
  title,
  description,
  authorName,
  datePublished,
  dateModified,
  url,
  imageUrl,
}: ArticleSchemaOptions) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const schema: Record<string, any> = {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: title,
    description,
    author: {
      '@type': 'Person',
      name: authorName,
    },
    datePublished,
    url,
  };
  if (dateModified) schema.dateModified = dateModified;
  if (imageUrl) schema.image = imageUrl;
  return schema;
}

export type FAQItem = {
  question: string;
  answer: string;
};

export function getFAQPageSchema(items: FAQItem[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: items.map((faq) => ({
      '@type': 'Question',
      name: faq.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: faq.answer,
      },
    })),
  };
} 