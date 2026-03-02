# Review 报告：首页 FAQ 去耦 + metadata/schema 三语对齐

**日期**：2026-02-28  
**范围**：完成首页 i18n 内容层收尾——FAQ 去耦 + metadata/schema 三语对齐  
**结论**：✅ 通过，无阻塞项。上轮所有 P2/P3 遗留项全部关闭。

---

## 变更范围

| 文件 | 变更说明 |
|------|---------|
| `src/app/CalculatorPageOptimized.tsx` | 移除 `FAQ_DATA` 硬编码常量，改为 `useMemo` 从 `messages.home.faqItems` 派生；FAQ 标题改为 `messages.home.faqHeading` |
| `src/app/page.tsx` | keywords/og.alt/schema featureList/inLanguage/publisherName 全部接入 messages；canonical 改用 `siteConfig.url` |
| `src/app/es/page.tsx` | 补全 keywords、authors、robots、og.images、twitter 字段；schema 接入 messages.home.featureList、inLanguage、publisherName |
| `src/app/pt/page.tsx` | 同 ES，三语结构完全对称 |
| `src/utils/seo/jsonld.ts` | 新增 `inLanguage` 参数支持；新增 options 及必需参数校验 |
| `src/types/schema.ts` | `SoftwareApplicationSchema` 已含 `inLanguage?: string` 字段 |
| `src/i18n/messages/en.json` | 新增 `home.keywords`、`home.featureList`、`home.faqHeading`、`home.faqItems`（9 条） |
| `src/i18n/messages/es.json` | 同上，全部西班牙语翻译 |
| `src/i18n/messages/pt.json` | 同上，全部葡萄牙语翻译 |

---

## 验证门禁

| 检查项 | 结果 |
|--------|------|
| LSP diagnostics（改动文件） | ✅ 0 error |
| `npm run lint` | ✅（仅仓库既有 warnings） |
| `npm run typecheck` | ✅ |
| `npm run test` | ✅ 72/72 |
| `npm run build` | ✅ |
| i18n JSON 语法校验 | ✅ |

---

## 详细发现

### FINDING-1 [✅ 已修复] FAQ_DATA 去耦完成

原 `FAQ_DATA` 英文模块级常量已清除，替换为：

```typescript
// src/app/CalculatorPageOptimized.tsx L91-98
const faqItems = useMemo<HomeFaqItem[]>(
  () =>
    messages.home.faqItems.map((item: HomeFaqItem) => ({
      question: item.question,
      answer: item.answer,
    })),
  [messages],
);
```

`LazyFAQSection` 的 `title` 改为 `messages.home.faqHeading`。三语 FAQ 数据分别在各自 messages JSON 中，ES/PT 不再显示英文 FAQ。

### FINDING-2 [✅] 三语 faqItems 翻译完整

| 语言 | 条目数 | 备注 |
|------|--------|------|
| EN | 9/9 | 原文 |
| ES | 9/9 | 全部西班牙语，语义准确 |
| PT | 9/9 | 全部葡萄牙语，语义准确 |

### FINDING-3 [✅ 已修复] metadata 三语完全对称

EN/ES/PT 三语 `page.tsx` 现在包含相同的 metadata 字段集：

| 字段 | EN | ES | PT |
|------|----|----|-----|
| `keywords` | `messages.home.keywords` | `messages.home.keywords` | `messages.home.keywords` |
| `authors` | ✅ | ✅ | ✅ |
| `robots` | ✅ | ✅ | ✅ |
| `og.images[].alt` | `messages.home.metaTitle` | `messages.home.metaTitle` | `messages.home.metaTitle` |
| `og.locale` | `"en_US"` | `"es_ES"` | `"pt_BR"` |
| `twitter.images` | ✅ | ✅ | ✅ |
| `canonical` | `siteConfig.url` | `${siteConfig.url}/es` | `${siteConfig.url}/pt` |

OG alt 统一为 `messages.home.metaTitle`（不再硬编码英文字符串）。EN canonical 从 `process.env.NEXT_PUBLIC_SITE_URL || ...` 改为 `siteConfig.url`，与 ES/PT 来源一致。

### FINDING-4 [✅ 已修复] JSON-LD schema 三语统一

三语 `softwareAppSchema` 现在均使用：
- `featureList: messages.home.featureList`（三语各有本地化 6 条描述）
- `inLanguage: locale`（`"en"` / `"es"` / `"pt"`）
- `publisherName: messages.common.siteName`

### FINDING-5 [INFO] useMemo 依赖稳定性

`faqItems` 的 `useMemo` 依赖 `[messages]`，而 `messages = getMessagesSync(locale)` 在每次渲染时调用。若 `getMessagesSync` 不返回稳定引用，useMemo 会在每次渲染失效。由于 FAQ mapping 代价极低（9 条 plain object），实际无性能影响，可接受。

---

## 四维审查总结

| 维度 | 结论 |
|------|------|
| Quality | ✅ 三语 page.tsx 结构对称，可维护性高；HomeFaqItem 局部类型定义职责清晰 |
| Security | ✅ faqItems 来自构建时静态 JSON，无运行时风险 |
| Performance | ✅ FAQ mapping 代价可忽略；静态 JSON 数组无运行时开销 |
| Architecture | ✅ 首页内容层最后一公里完成，FAQ/featureList/keywords/schema 全部进入 i18n messages |

---

## 遗留项状态

| 上轮 Finding | 本轮状态 |
|-------------|---------|
| P2 FAQ 迁入 messages | ✅ 已完成 |
| P2 补全 ES/PT metadata | ✅ 已完成 |
| P3 featureList 策略统一 | ✅ 已完成 |

**当前无任何 P0/P1/P2 遗留项。**
