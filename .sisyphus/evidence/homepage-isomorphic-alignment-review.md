# Review 报告：ES/PT 首页同构对齐

**日期**：2026-02-28  
**范围**：ES/PT 首页从静态着陆页升级为与 EN 完全同构的实时计算器渲染链路  
**结论**：✅ 通过，无阻塞项

---

## 变更范围

| 文件 | 变更说明 |
|------|---------|
| `src/app/CalculatorServer.tsx` | 新增 `locale` 入参，透传到 `CalculatorClient` |
| `src/components/Calculator/CalculatorClient.tsx` | 新增 `locale?: Locale` prop（默认 `"en"`，向后兼容） |
| `src/app/CalculatorPageOptimized.tsx` | 新增 `locale` 支持；关键 UI 文案改为 `messages` 驱动（标题、副标题、Day/Night 标签、列表标题、FAQ locale 透传） |
| `src/app/es/page.tsx` | 完全替换为 `CalculatorServer` 渲染模式，含本地化 metadata + JSON-LD |
| `src/app/pt/page.tsx` | 完全替换为 `CalculatorServer` 渲染模式，含本地化 metadata + JSON-LD |
| `src/app/page.tsx` | 显式传递 `locale="en"` 到 `CalculatorServer` |

---

## 验证门禁

| 检查项 | 结果 |
|--------|------|
| LSP diagnostics（改动文件） | ✅ 0 error |
| `npm run lint` | ✅（仅仓库既有 warnings） |
| `npm run typecheck` | ✅ |
| `npm run test` | ✅ 72/72 |
| `npm run build` | ✅ `/`、`/es`、`/pt` 均变为 `ƒ`（Dynamic） |

---

## 详细发现

### FINDING-1 [INFO] locale 透传链路完整

```
es/page.tsx (locale="es")
  └→ CalculatorServer(locale="es")
      └→ CalculatorClient(locale="es")
          └→ CalculatorPageOptimized(locale="es")
              └→ CalculatorCore → getMessagesSync(locale)
                  ├→ messages.home.title / subtitle
                  ├→ messages.calculator.daytime / nighttime
                  ├→ messages.calculator.daytimeHours / nighttimeHours
                  └→ LazyFAQSection(locale, messages)
```

每层均正确透传，无断链。`CalculatorClient` 新增 `locale?: Locale` prop，默认值 `"en"` 保持向后兼容。

---

### FINDING-2 [INFO] `revalidate = 0` 三语统一

EN/ES/PT 三语首页均设置 `export const revalidate = 0`，全部为全动态渲染，配合 `CalculatorServer` 内部的 TTL 策略。构建产物中三语首页均变为 `ƒ`（Dynamic），符合预期。

---

### FINDING-3 [INFO] ES/PT 页面结构对称，metadata 略有精简

ES/PT `page.tsx` 均包含：
- `revalidate = 0`（与 EN 对齐）
- `metadata` 使用 `messages.home.metaTitle/metaDescription`
- `alternates.canonical` 指向正确的本地化 URL
- `getSoftwareApplicationSchema` 使用本地化 `featureList`

**差异**：EN metadata 额外包含 `keywords`、`authors`、`creator`、`publisher`、`formatDetection`、`robots`、`openGraph.images`、`twitter.images` 等字段，ES/PT 相对精简。属于 SEO 内容差距，非代码缺陷，不阻塞功能。

---

### FINDING-4 [P2] FAQ_DATA 硬编码英文 — ES/PT 首页 FAQ 显示英文

```typescript
// src/app/CalculatorPageOptimized.tsx L56-102
const FAQ_DATA = [
  { question: "How are planetary hours calculated?", answer: "..." },
  // ... 8 more EN-only Q&A items
];
```

`LazyFAQSection` 已接收正确的 `locale` 和 `messages` 参数，但 `faqs={FAQ_DATA}` 为硬编码英文数组。`locale` 仅影响 FAQ 容器标题，不影响问答内容本身。

**影响**：ES/PT 首页 FAQ 内容全部以英文显示，体验不一致。属内容层问题，不影响计算器核心功能。

**修复方向**：将 FAQ 内容迁移到 `messages.home.faqItems`（数组结构），三语各维护翻译，在 `CalculatorCore` 中按 locale 动态注入 `faqs={messages.home.faqItems}`。

---

### FINDING-5 [P3] EN/ES/PT schema featureList 策略不统一

EN `page.tsx` 的 `softwareAppSchema.featureList` 和 `description` 为硬编码英文字符串；  
ES/PT `page.tsx` 在页面内内联本地化数组。双方策略不一致，维护成本略高。

**建议**：统一将 featureList 迁入 `messages.home.featureList`，三语一致。

---

## 四维审查总结

### Quality Auditor ✅

- 三语 `page.tsx` 职责清晰：仅负责 metadata + JSON-LD + `<CalculatorServer locale={locale} />`
- `CalculatorClient` 的 `locale?: Locale`（默认 `"en"`）向后兼容，无破坏性变更
- `messages = getMessagesSync(locale)` 在 `CalculatorCore` 内正确响应 locale prop
- 已接入 messages 的文案覆盖主要 UI：标题、副标题、Tab 标签（日/夜）、列表标题

**待改进**：FAQ_DATA 模块级硬编码英文（FINDING-4）

### Security Analyst ✅

无风险。`locale` 参数仅用于 messages 查找，不涉及路径拼接或动态执行。

### Performance Reviewer ✅

- `FAQ_DATA` 定义在模块顶层而非组件内，零重复创建开销，正确
- `getMessagesSync(locale)` 在 `CalculatorCore` 组件内调用（L134），每次渲染一次；当前影响可忽略
- `revalidate = 0` 三语对齐，首页实时渲染模式正确

### Architecture Assessor ✅

**重大改善**：ES/PT 首页从自定义静态着陆页变为与 EN 完全同构的 `CalculatorServer` 渲染模式，三语首页功能完全对齐，维护一套逻辑。

**遗留不对齐**：EN metadata 字段更丰富，ES/PT 精简。建议后续补全 ES/PT metadata 保证 SEO 对等。

---

## Action Plan

| 优先级 | 描述 | 工作量 |
|--------|------|--------|
| P2 | 将 FAQ_DATA（9 条 Q&A）迁移到 `messages.home.faqItems`，翻译 ES/PT | 中 |
| P2 | 补全 ES/PT metadata（keywords、robots、og.images、twitter.images） | 低 |
| P3 | 统一 EN/ES/PT `softwareAppSchema.featureList` 策略，迁入 messages | 低 |
