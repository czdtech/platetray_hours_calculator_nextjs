/**
 * Schema.org 结构化数据类型定义
 * 提供类型安全的JSON-LD Schema生成
 */

// 基础Schema接口
export interface SchemaOrgBase {
  "@context": "https://schema.org";
  "@type": string;
  [key: string]: unknown;
}

// 组织Schema
export interface OrganizationSchema extends SchemaOrgBase {
  "@type": "Organization";
  name: string;
  logo?: ImageObjectSchema;
  url?: string;
  sameAs?: string[];
}

// 图片对象Schema
export interface ImageObjectSchema extends SchemaOrgBase {
  "@type": "ImageObject";
  url: string;
  width?: number;
  height?: number;
  alt?: string;
}

// 人员Schema
export interface PersonSchema extends SchemaOrgBase {
  "@type": "Person";
  name: string;
  url?: string;
  sameAs?: string[];
}

// 网站Schema
export interface WebSiteSchema extends SchemaOrgBase {
  "@type": "WebSite";
  url: string;
  name: string;
  description?: string;
  publisher?: OrganizationSchema;
  potentialAction?: SearchActionSchema;
}

// 搜索动作Schema
export interface SearchActionSchema extends SchemaOrgBase {
  "@type": "SearchAction";
  target: string;
  "query-input": string;
}

// 文章Schema
export interface ArticleSchema extends SchemaOrgBase {
  "@type": "BlogPosting" | "Article";
  headline: string;
  description: string;
  author: PersonSchema;
  datePublished: string;
  dateModified?: string;
  url: string;
  image?: string | ImageObjectSchema;
  publisher?: OrganizationSchema;
  mainEntityOfPage?: string;
}

// 面包屑列表Schema
export interface BreadcrumbListSchema extends SchemaOrgBase {
  "@type": "BreadcrumbList";
  itemListElement: ListItemSchema[];
}

// 列表项Schema
export interface ListItemSchema extends SchemaOrgBase {
  "@type": "ListItem";
  position: number;
  name: string;
  item: string;
}

// FAQ页面Schema
export interface FAQPageSchema extends SchemaOrgBase {
  "@type": "FAQPage";
  mainEntity: QuestionSchema[];
}

// 问题Schema
export interface QuestionSchema extends SchemaOrgBase {
  "@type": "Question";
  name: string;
  acceptedAnswer: AnswerSchema;
}

// 答案Schema
export interface AnswerSchema extends SchemaOrgBase {
  "@type": "Answer";
  text: string;
}

// 本地商业Schema
export interface LocalBusinessSchema extends SchemaOrgBase {
  "@type": "LocalBusiness";
  name: string;
  description?: string;
  url?: string;
  telephone?: string;
  address?: PostalAddressSchema;
  geo?: GeoCoordinatesSchema;
  openingHours?: string[];
  priceRange?: string;
}

// 邮政地址Schema
export interface PostalAddressSchema extends SchemaOrgBase {
  "@type": "PostalAddress";
  streetAddress?: string;
  addressLocality?: string;
  addressRegion?: string;
  postalCode?: string;
  addressCountry?: string;
}

// 地理坐标Schema
export interface GeoCoordinatesSchema extends SchemaOrgBase {
  "@type": "GeoCoordinates";
  latitude: number;
  longitude: number;
}

// 评价Schema
export interface ReviewSchema extends SchemaOrgBase {
  "@type": "Review";
  author: PersonSchema;
  datePublished: string;
  description?: string;
  name?: string;
  reviewBody: string;
  reviewRating: RatingSchema;
}

// 评分Schema
export interface RatingSchema extends SchemaOrgBase {
  "@type": "Rating";
  ratingValue: number;
  bestRating?: number;
  worstRating?: number;
}

// 聚合评分Schema
export interface AggregateRatingSchema extends SchemaOrgBase {
  "@type": "AggregateRating";
  ratingValue: number;
  reviewCount: number;
  bestRating?: number;
  worstRating?: number;
}

// 软件应用Schema
export interface SoftwareApplicationSchema extends SchemaOrgBase {
  "@type": "SoftwareApplication" | "WebApplication";
  name: string;
  description: string;
  url: string;
  applicationCategory: string;
  applicationSubCategory?: string;
  operatingSystem?: string;
  browserRequirements?: string;
  memoryRequirements?: string;
  processorRequirements?: string;
  storageRequirements?: string;
  softwareVersion?: string;
  releaseNotes?: string;
  screenshot?: string | ImageObjectSchema | ImageObjectSchema[];
  featureList?: string[];
  offers?: OfferSchema;
  aggregateRating?: AggregateRatingSchema;
  author?: PersonSchema | OrganizationSchema;
  creator?: PersonSchema | OrganizationSchema;
  publisher?: OrganizationSchema;
  dateCreated?: string;
  dateModified?: string;
  datePublished?: string;
  downloadUrl?: string;
  installUrl?: string;
  softwareHelp?: string;
  supportingData?: string;
  requirements?: string[];
  permissions?: string[];
}

// 报价Schema
export interface OfferSchema extends SchemaOrgBase {
  "@type": "Offer";
  price: string | number;
  priceCurrency: string;
  availability?: string;
  validFrom?: string;
  validThrough?: string;
  seller?: PersonSchema | OrganizationSchema;
  description?: string;
  category?: string;
}

// 更新联合类型定义
export type AnySchemaType =
  | WebSiteSchema
  | ArticleSchema
  | BreadcrumbListSchema
  | FAQPageSchema
  | LocalBusinessSchema
  | ReviewSchema
  | OrganizationSchema
  | PersonSchema
  | ImageObjectSchema
  | SoftwareApplicationSchema;

// 类型守卫函数
export function isValidSchema(data: unknown): data is SchemaOrgBase {
  return (
    typeof data === "object" &&
    data !== null &&
    "@context" in data &&
    "@type" in data &&
    (data as SchemaOrgBase)["@context"] === "https://schema.org"
  );
}

// Schema验证函数
export function validateSchemaArray(data: unknown[]): AnySchemaType[] {
  return data.filter(isValidSchema) as AnySchemaType[];
}
