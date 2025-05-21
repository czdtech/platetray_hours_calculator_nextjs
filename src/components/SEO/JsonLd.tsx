export interface JsonLdProps {
  /** 可以传入单个 schema 对象或数组 */
  data: Record<string, any> | Record<string, any>[];
}

/**
 * 直接渲染 JSON-LD 结构化数据脚本。
 */
export const JsonLd: React.FC<JsonLdProps> = ({ data }) => {
  const json = Array.isArray(data) ? data : [data];
  return (
    <>
      {json.map((item, idx) => (
        <script
          key={idx}
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(item) }}
        />
      ))}
    </>
  );
};
