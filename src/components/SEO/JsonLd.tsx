'use client';
import React from "react";
import { AnySchemaType } from "@/types/schema";
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
   */
  data: AnySchemaType | AnySchemaType[];
}

/**
 * JsonLd组件 - 渲染JSON-LD结构化数据
 * 
 * 优化的轻量级实现，减少不必要的复杂性
 */
export const JsonLd: React.FC<JsonLdProps> = ({ data }) => {
  // 确保数据是数组格式
  const schemaArray = Array.isArray(data) ? data : [data];

  // 简化验证：只检查基本结构
  const validSchemas = schemaArray.filter(schema => 
    schema && typeof schema === 'object' && schema['@type'] && schema['@context']
  );

  // 获取 CSP nonce
  const nonce: string | undefined = typeof nextUseNonce === 'function' ? nextUseNonce() : undefined;

  if (validSchemas.length === 0) {
    logger.error("JsonLd: No valid schema objects provided");
    return null;
  }

  // 优化：将多个schema合并到单个script标签中
  const combinedSchema = validSchemas.length === 1 
    ? validSchemas[0] 
    : validSchemas;

  return (
    <script 
      nonce={nonce || undefined}
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(
          combinedSchema,
          null,
          process.env.NODE_ENV === "development" ? 2 : 0,
        ),
      }}
    />
  );
};
