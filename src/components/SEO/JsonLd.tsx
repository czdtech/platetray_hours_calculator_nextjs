'use client';
import React from "react";
import { AnySchemaType, isValidSchema } from "@/types/schema";
import { createLogger } from '@/utils/unified-logger';
// eslint-disable-next-line import/no-extraneous-dependencies, @typescript-eslint/ban-ts-comment
// @ts-ignore
import { useNonce as nextUseNonce } from 'next/script';

const logger = createLogger('JsonLd');

/**
 * JsonLd组件的属性接口
 */
export interface JsonLdProps {
  /**
   * Schema.org结构化数据对象或数组
   * 支持传入单个schema对象或多个schema对象的数组
   *
   * @example
   * // 单个schema
   * <JsonLd data={websiteSchema} />
   *
   * @example
   * // 多个schema
   * <JsonLd data={[websiteSchema, articleSchema]} />
   */
  data: AnySchemaType | AnySchemaType[];
}

/**
 * JsonLd组件 - 渲染JSON-LD结构化数据
 *
 * 这个组件用于在页面头部注入Schema.org格式的结构化数据，
 * 帮助搜索引擎更好地理解页面内容。
 *
 * ## 功能特性
 * - 类型安全的Schema.org数据验证
 * - 支持单个或多个schema对象
 * - 开发环境下格式化输出便于调试
 * - 自动过滤无效的schema对象
 *
 * ## 使用示例
 *
 * ### 基础用法
 * ```tsx
 * import { JsonLd } from '@/components/SEO/JsonLd';
 * import { getWebSiteSchema } from '@/utils/seo/jsonld';
 *
 * const websiteSchema = getWebSiteSchema({
 *   siteUrl: 'https://example.com',
 *   name: 'My Website',
 *   description: 'A great website'
 * });
 *
 * export default function Page() {
 *   return (
 *     <>
 *       <JsonLd data={websiteSchema} />
 *       <main>页面内容</main>
 *     </>
 *   );
 * }
 * ```
 *
 * ### 多个Schema
 * ```tsx
 * const schemas = [websiteSchema, articleSchema, breadcrumbSchema];
 * <JsonLd data={schemas} />
 * ```
 *
 * @param props - JsonLd组件的属性
 * @returns React组件，渲染JSON-LD脚本标签
 */
export const JsonLd: React.FC<JsonLdProps> = ({ data }) => {
  // 确保数据是数组格式
  const schemaArray = Array.isArray(data) ? data : [data];

  // 验证所有Schema对象的有效性
  const validSchemas = schemaArray.filter(isValidSchema);

  // 获取 CSP nonce；在旧版本 Next.js 中 useNonce 可能为 undefined
  const nonce: string | undefined = typeof nextUseNonce === 'function' ? nextUseNonce() : undefined;

  if (validSchemas.length === 0) {
    logger.error("JsonLd: No valid schema objects provided");
    return null;
  }

  return (
    <>
      {validSchemas.map((schema, idx) => (
        <script nonce={nonce || undefined}
          key={`schema-${schema["@type"]}-${idx}`}
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(
              schema,
              null,
              process.env.NODE_ENV === "development" ? 2 : 0,
            ),
          }}
        />
      ))}
    </>
  );
};
