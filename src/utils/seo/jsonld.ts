import {
  WebSiteSchema,
  ArticleSchema,
  BreadcrumbListSchema,
  FAQPageSchema,
  PersonSchema,
  OrganizationSchema,
  ImageObjectSchema,
  ListItemSchema,
  QuestionSchema,
  AnswerSchema,
  SoftwareApplicationSchema,
  OfferSchema,
} from "@/types/schema";

// 网站Schema选项
export interface WebSiteSchemaOptions {
  siteUrl: string;
  /** 网站名称，例如 Planetary Hours Calculator */
  name: string;
  description?: string;
  /** 站点 logo 绝对 URL，可选 */
  logoUrl?: string;
}

/**
 * 生成网站Schema结构化数据
 */
export function getWebSiteSchema({
  siteUrl,
  name,
  description,
  logoUrl,
}: WebSiteSchemaOptions): WebSiteSchema {
  const schema: WebSiteSchema = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    url: siteUrl,
    name,
  };

  if (description) {
    schema.description = description;
  }

  if (logoUrl) {
    const logoSchema: ImageObjectSchema = {
      "@context": "https://schema.org",
      "@type": "ImageObject",
      url: logoUrl,
    };

    const publisherSchema: OrganizationSchema = {
      "@context": "https://schema.org",
      "@type": "Organization",
      name,
      logo: logoSchema,
    };

    schema.publisher = publisherSchema;
  }

  return schema;
}

// 面包屑项目类型
export interface BreadcrumbItem {
  name: string;
  url: string;
}

/**
 * 生成面包屑Schema结构化数据
 */
export function getBreadcrumbSchema(
  items: BreadcrumbItem[],
): BreadcrumbListSchema {
  const listItems: ListItemSchema[] = items.map((item, idx) => ({
    "@context": "https://schema.org",
    "@type": "ListItem",
    position: idx + 1,
    name: item.name,
    item: item.url,
  }));

  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: listItems,
  };
}

// 文章Schema选项
export interface ArticleSchemaOptions {
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
  /** 发布者信息，可选 */
  publisherName?: string;
  publisherLogoUrl?: string;
}

/**
 * 生成文章Schema结构化数据
 */
export function getArticleSchema({
  title,
  description,
  authorName,
  datePublished,
  dateModified,
  url,
  imageUrl,
  publisherName,
  publisherLogoUrl,
}: ArticleSchemaOptions): ArticleSchema {
  const authorSchema: PersonSchema = {
    "@context": "https://schema.org",
    "@type": "Person",
    name: authorName,
  };

  const schema: ArticleSchema = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: title,
    description,
    author: authorSchema,
    datePublished,
    url,
    mainEntityOfPage: url,
  };

  if (dateModified) {
    schema.dateModified = dateModified;
  }

  if (imageUrl) {
    schema.image = imageUrl;
  }

  if (publisherName) {
    const publisherSchema: OrganizationSchema = {
      "@context": "https://schema.org",
      "@type": "Organization",
      name: publisherName,
    };

    if (publisherLogoUrl) {
      publisherSchema.logo = {
        "@context": "https://schema.org",
        "@type": "ImageObject",
        url: publisherLogoUrl,
      };
    }

    schema.publisher = publisherSchema;
  }

  return schema;
}

// FAQ项目类型
export interface FAQItem {
  question: string;
  answer: string;
}

/**
 * 生成FAQ页面Schema结构化数据
 */
export function getFAQPageSchema(items: FAQItem[]): FAQPageSchema {
  const questions: QuestionSchema[] = items.map((faq) => {
    const answerSchema: AnswerSchema = {
      "@context": "https://schema.org",
      "@type": "Answer",
      text: faq.answer,
    };

    return {
      "@context": "https://schema.org",
      "@type": "Question",
      name: faq.question,
      acceptedAnswer: answerSchema,
    };
  });

  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: questions,
  };
}

// 软件应用Schema选项（简化版）
export interface SoftwareApplicationSchemaOptions {
  name: string;
  description: string;
  url: string;
  applicationCategory?: string;
  featureList?: string[];
  publisherName?: string;
}

/**
 * 生成软件应用Schema结构化数据（简化版）
 * 专门用于在线工具，不包含评分等复杂功能
 */
export function getSoftwareApplicationSchema(
  options: SoftwareApplicationSchemaOptions | undefined
): SoftwareApplicationSchema {
  // 如果 options 为 undefined，提供默认值
  if (!options) {
    throw new Error('SoftwareApplicationSchemaOptions is required');
  }

  const {
    name,
    description,
    url,
    applicationCategory = "UtilityApplication",
    featureList,
    publisherName,
  } = options;

  // 验证必需参数
  if (!name || !description || !url) {
    throw new Error('name, description, and url are required for SoftwareApplicationSchema');
  }

  const schema: SoftwareApplicationSchema = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name,
    description,
    url,
    applicationCategory,
    operatingSystem: "Web Browser",
    browserRequirements: "Requires JavaScript",
  };

  // 添加功能列表
  if (featureList && featureList.length > 0) {
    schema.featureList = featureList;
  }

  // 添加免费价格信息
  const offerSchema: OfferSchema = {
    "@context": "https://schema.org",
    "@type": "Offer",
    price: "0",
    priceCurrency: "USD",
    availability: "https://schema.org/InStock",
  };
  schema.offers = offerSchema;

  // 添加发布者信息
  if (publisherName) {
    const publisherSchema: OrganizationSchema = {
      "@context": "https://schema.org",
      "@type": "Organization",
      name: publisherName,
    };
    schema.publisher = publisherSchema;
  }

  return schema;
}
