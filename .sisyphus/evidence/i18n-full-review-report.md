# i18n 全量 Code Review 报告

**Generated:** 2026-02-28  
**Reviewer:** AI Code Review (4-dimensional: Quality / Security / Performance / Architecture)  
**Scope:** 从初始审计到全部修复的完整 i18n 生命周期  
**Base commit:** `7f93b46` (fix(i18n): Wave 1+2 locale routing, navigation, alternates, city date fixes)  
**Latest commit:** `ceb72c9` (feat(i18n-blog): complete ES/PT localization and locale-safe internal links)  
**Uncommitted changes:** 城市页组件重构 + 博客配图升级（15 files changed, +236/-292 lines）

---

## 0. Executive Summary

| 维度       | 评分  | 说明                                            |
| ---------- | ----- | ----------------------------------------------- |
| 功能完整性 | ★★★★☆ | P0-P3 工程任务全部闭环，博客翻译 100%，1 项回归 |
| 代码质量   | ★★★★☆ | 组件接口设计合理，i18n 架构一致，少量重复代码   |
| 安全性     | ★★★★★ | 无安全风险                                      |
| 性能       | ★★★★☆ | 客户端组件合理 memo 化，图片多格式优化          |
| 架构一致性 | ★★★☆☆ | EN 与 ES/PT 城市页实现方式分裂                  |

**关键发现：1 项 P0 回归（Footer 从 ES/PT layout 中移除），需立即修复。**

---

## 1. 项目 i18n 演进时间线

### Phase 0: 初始状态

- 路由层面 EN/ES/PT 三语齐全（首页、关于、博客、城市）
- SEO 标签（hreflang、canonical、alternates）基本完整
- **UI 层面**：所有共享组件（Header、Footer、Blog 组件等）硬编码英文
- **翻译文件**：`en/es/pt.json` 结构对齐（88 key），但页面/组件未接入
- **博客翻译覆盖**：ES/PT 各 13/33 篇（39.4%）

### Phase 1: 初始审计

- 产出 `.sisyphus/evidence/i18n-completeness-audit.md`（421 行）
- 识别 P0（14 项）、P1（6 项）、P2（1 项）、P3（5 项）共 26 个问题

### Phase 2: P0 修复（共享组件 i18n 接入）

修复的 14 个共享组件全部接入 `locale` + `messages` props：

| 组件                     | 修复内容                                                          | 状态 |
| ------------------------ | ----------------------------------------------------------------- | ---- |
| `Header.tsx`             | 导航文本 → `messages.common.*`                                    | ✅   |
| `Footer.tsx`             | 版权、链接文本 → `messages.common.*`                              | ✅   |
| `LanguageSwitcher.tsx`   | aria-label → `messages.common.selectLanguage`                     | ✅   |
| `BlogPostCard.tsx`       | "Read more" → `messages.blog.readMore`；日期 → `getDateFnsLocale` | ✅   |
| `BlogCategoryFilter.tsx` | "All"/"min read"/分类标签 → `messages.*`                          | ✅   |
| `RelatedArticles.tsx`    | "Related Articles" → `messages.blog.relatedArticles`              | ✅   |
| `CalculatorCTA.tsx`      | CTA 文案 → `messages.calculator.*`                                | ✅   |
| `ArticleShare.tsx`       | 分享文案 + 中文修复 → `messages.blog.*`；`useRef` 重构            | ✅   |
| `ArticleMeta.tsx`        | "min read"/作者/日期 → `messages.blog.*` + `getDateFnsLocale`     | ✅   |
| `TableOfContents.tsx`    | "Table of Contents" → `messages.blog.tableOfContents`             | ✅   |
| `BlogBackToTop.tsx`      | 中文 aria-label → `messages.common.backToTop`                     | ✅   |
| `FAQSection.tsx`         | "FAQ" 标题 → `messages.blog.faq`；接受 `title` prop               | ✅   |
| `BackToTop.tsx`          | aria-label 本地化                                                 | ✅   |
| `ArticleLayout.tsx`      | 传递 locale/messages 到子组件                                     | ✅   |

**新增工具文件：**

- `src/utils/dateLocale.ts` — 集中 `date-fns` locale 映射

**验证结果：** lint ✅ | typecheck ✅ | 68/68 tests ✅ | build ✅ (391 pages)

### Phase 3: P1 + P2 + P3-1 修复

| 任务 | 修复内容                                                                   | 状态 |
| ---- | -------------------------------------------------------------------------- | ---- |
| P1   | EN 关键页面接入 `getMessagesSync("en")`（6 页）                            | ✅   |
| P2   | 新增 `/es/blog/category/[category]` 和 `/pt/blog/category/[category]` 路由 | ✅   |
| P2   | `routePolicy` 语言切换保留分类路径                                         | ✅   |
| P3-1 | 城市索引页 region 名称本地化 (`src/i18n/regions.ts`)                       | ✅   |

**新增文件：**

- `src/app/es/blog/category/[category]/page.tsx`
- `src/app/pt/blog/category/[category]/page.tsx`
- `src/i18n/regions.ts`

**验证结果：** lint ✅ | typecheck ✅ | 68/68 tests ✅ | build ✅ (401 pages, +10)

### Phase 4: P3-2 + P3-3 + P3-4 + P3-5 修复

| 任务 | 修复内容                                                        | 状态 |
| ---- | --------------------------------------------------------------- | ---- |
| P3-2 | 城市描述本地化数据层 (`src/i18n/cityDescription.ts`)            | ✅   |
| P3-3 | About 正文硬编码迁移到 i18n JSON 结构化 key                     | ✅   |
| P3-4 | 城市 FAQ 内容源统一 (`src/i18n/cityFaq.ts`)                     | ✅   |
| P3-5 | 翻译覆盖审计脚本 (`scripts/audit-blog-translation-coverage.ts`) | ✅   |

**新增文件：**

- `src/i18n/cityDescription.ts`
- `src/i18n/cityFaq.ts`
- `scripts/audit-blog-translation-coverage.ts`

**新增 i18n keys（三语各新增）：**

- `about.chaldeanOrderText` / `planetHourExamples` / `keyFeaturesItems` / `limitationsText` / `closingText`
- `cityPage.faqTemplates.*`（3 组问答模板）
- `cityPage.descriptionTemplate`
- `blog.translationFallbackNotice`

**验证结果：** lint ✅ | typecheck ✅ | 68/68 tests ✅ | build ✅ (401 pages) | blog audit: ES/PT 各 13/33 (39.4%)

### Phase 5: 博客翻译 100% 覆盖

| 维度                            | Before | After    |
| ------------------------------- | ------ | -------- |
| `SHARED_TRANSLATED_BLOG_SLUGS`  | 13 条  | 33 条    |
| ES markdown 文件                | 13 个  | 33 个    |
| PT markdown 文件                | 13 个  | 33 个    |
| `blogPosts-es.ts` override 条目 | 13 个  | 33 个    |
| `blogPosts-pt.ts` override 条目 | 13 个  | 33 个    |
| 覆盖率                          | 39.4%  | **100%** |
| slug parity (ES vs PT 差集)     | 0      | 0        |

**验证结果：** lint ✅ | typecheck ✅ | 72/72 tests ✅ | build ✅ (441 pages, +40) | blog audit: 100%

### Phase 6: Markdown 内部链接自动本地化

**问题：** ES/PT markdown 文章中的交叉引用使用 `/blog/...`（英文路径），用户点击后跳转到英文版。

**修复方案：** 在 `src/utils/markdown.ts` 渲染管线中新增 `localizeBlogHrefs` 后处理函数：

```typescript
function localizeBlogHrefs(contentHtml: string, locale: ContentLocale): string {
  if (locale === "en") return contentHtml;
  return contentHtml.replace(/href=(["'])\/blog\//g, `href=$1/${locale}/blog/`);
}
```

**优势：**

- 零维护成本——新增文章无需手动处理
- 单一职责——集中在渲染管线，不侵入内容层
- Fallback 友好——即使读英文原文也正确重写

**新增测试：** `tests/unit/markdownLinksLocalization.spec.ts`（4 用例）

**验证结果：** lint ✅ | typecheck ✅ | 72/72 tests ✅ (含新增 4 用例)

### Phase 7: 城市页组件重构 + 博客配图升级（当前未提交）

详见下方 Section 2。

---

## 2. 当前未提交变更 Review（Phase 7）

### 2.1 变更清单

```
Modified (code):
  src/app/es/layout.tsx               (-2 lines: 移除 Footer)
  src/app/pt/layout.tsx               (-2 lines: 移除 Footer)
  src/app/es/planetary-hours/[city]/page.tsx   (重构: 150 +++----)
  src/app/pt/planetary-hours/[city]/page.tsx   (重构: 150 +++----)
  src/components/CityCalculator/CityHoursList.tsx  (升级: 162 +++++)
  src/components/Layout/Footer.tsx              (14 +--)
  src/data/blogPosts.ts                         (48 +++---)

New (code):
  src/components/CityCalculator/CityCurrentHourCard.tsx

Modified (images):
  8 existing blog images replaced with higher quality versions

New (images):
  ~80 files: 20+ articles × 4 formats (jpg/avif/webp/blur.jpg)
```

### 2.2 Review Findings

---

#### FINDING-1 [P0] Footer 从 ES/PT Layout 移除 — 回归

**严重性：** P0（阻塞发布）  
**文件：** `src/app/es/layout.tsx`, `src/app/pt/layout.tsx`

ES 和 PT 的 layout 中删除了 `<Footer locale="..." />` 的导入和渲染行：

```diff
- import { Footer } from "@/components/Layout/Footer";
  ...
- <Footer locale="es" />
```

由于 ES/PT layout 各自声明了 `<html lang="...">` + `<body>`（完全替换根 layout 而非嵌套），**所有 `/es/...` 和 `/pt/...` 页面将没有底部导航**。根 layout 的 `<Footer />` 仅对 EN 路由生效。

**影响范围：**

- 全部 ES/PT 页面（约 280+ 静态页面）缺失底部导航
- 用户无法从 ES/PT 页面访问 About / Privacy / Terms 链接
- 缺失版权声明

**修复方式：** 将以下行恢复到 `src/app/es/layout.tsx` 和 `src/app/pt/layout.tsx`：

```typescript
import { Footer } from "@/components/Layout/Footer";
// ... 在 </main> 之后添加：
<Footer locale="es" />  // 或 "pt"
```

**预估工作量：** 5 分钟

---

#### FINDING-2 [P1] CityCurrentHourCard 的 goodFor/avoid 内容未本地化

**严重性：** P1（UX 不一致）  
**文件：** `src/components/CityCalculator/CityCurrentHourCard.tsx` (L93, L97)

标签文字 `labels.goodFor` / `labels.avoid` 已通过 i18n 正确本地化为 "Bueno para" / "Evitar"（ES）和 "Bom para" / "Evitar"（PT），但**值内容**来自 `PlanetaryHoursCalculator` 服务的硬编码英文数据（如 "Leadership, success, vitality, authority"）。

在 ES/PT 页面上呈现为：

> **Bueno para:** Leadership, success, vitality, authority  
> **Evitar:** Humility, staying in the background, passive activities

**影响：** 标签是目标语言但描述是英文，UX 体验割裂。

**修复方式（二选一）：**

1. 在 `messages.planets` 下为每个行星添加 `goodFor` / `avoid` 翻译 key，通过 `localizedPlanets` 传入
2. 短期方案：当 `locale !== "en"` 时不显示 goodFor/avoid 区块

**预估工作量：** 30-60 分钟（方案 1）| 10 分钟（方案 2）

---

#### FINDING-3 [P2] normalizeHours 函数重复定义

**严重性：** P2（代码卫生）  
**文件：** `CityCurrentHourCard.tsx` (L23-29), `CityHoursList.tsx` (L33-39)

完全相同的函数在两个文件中独立定义：

```typescript
function normalizeHours(hours: PlanetaryHour[]): PlanetaryHour[] {
  return hours.map((hour) => ({
    ...hour,
    startTime: new Date(hour.startTime),
    endTime: new Date(hour.endTime),
  }));
}
```

**修复方式：** 提取到 `src/utils/planetaryHours.ts` 或 `src/components/CityCalculator/utils.ts` 共享。

**预估工作量：** 10 分钟

---

#### FINDING-4 [P2] EN 与 ES/PT 城市详情页架构不对称

**严重性：** P2（维护成本）  
**文件：** `src/app/planetary-hours/[city]/page.tsx` vs `src/app/es/planetary-hours/[city]/page.tsx`

| 特性       | EN 页面                                   | ES/PT 页面                                         |
| ---------- | ----------------------------------------- | -------------------------------------------------- |
| 城市信息   | `<CityInfo>` 组件                         | 内联 JSX                                           |
| 当前行星时 | 服务端计算 + 内联渲染（SSG 快照，不更新） | `<CityCurrentHourCard>` 客户端组件（30s 自动刷新） |
| 行星时列表 | `<CityHoursList>` 无 labels               | `<CityHoursList>` 带 labels + localizedPlanets     |
| 行星名     | 英文（"Venus", "Mars"）                   | 本地化（"Venus" → "Venus", "Mars" → "Marte"）      |
| FAQ        | `<CityFAQ>` 组件                          | `<FAQSection>` + `buildCityFaqItems`               |
| 相关城市   | `<RelatedCities>` 组件                    | 内联 JSX                                           |

**架构影响：**

- EN 页面的当前行星时在 SSG/ISR 时固定，用户访问时可能已过时
- ES/PT 使用 `CityCurrentHourCard` 客户端组件更优——30s 自动更新
- 修改城市页 UI 需要同时维护三份不同实现

**建议：** 后续统一 EN 页面也使用 `CityCurrentHourCard` + i18n labels 模式，消除架构分裂。

**预估工作量：** 30-60 分钟

---

#### FINDING-5 [INFO] CityCurrentHourCard 组件设计良好

**严重性：** 信息（正面评价）  
**文件：** `src/components/CityCalculator/CityCurrentHourCard.tsx`

新组件设计干净：

- 通过 `CurrentHourLabels` 接口实现完全与语言无关
- `localizedPlanets` 可选 prop 向后兼容
- `useMemo` 避免重复计算（normalizedHours 依赖 `[hours]`，currentHour 依赖 `[normalizedHours, now]`）
- 30s `setInterval` 刷新间隔合理（行星时通常 48-70 分钟）
- 无匹配时 `return null`，优雅降级

---

#### FINDING-6 [INFO] CityHoursList 升级设计良好

**严重性：** 信息（正面评价）  
**文件：** `src/components/CityCalculator/CityHoursList.tsx`

- `defaultLabels` 回退机制确保不传 labels 时 EN 正常工作
- `HourRow` 子组件封装减少列表渲染重复
- `localizedPlanets` 可选 prop 保持向后兼容
- Day/Night 分组正确使用 `useMemo`

---

#### FINDING-7 [INFO] 博客配图全面升级

**严重性：** 信息（正面评价）  
**文件：** `public/images/blog/`

新增 20+ 组博客文章配图，每组 4 个格式：

- `.jpg` — 通用格式
- `.avif` — 现代浏览器最优压缩
- `.webp` — 广泛兼容的现代格式
- `.blur.jpg` — 低分辨率占位图（优化 LCP）

`blogPosts.ts` 中已更新对应的静态导入引用。

---

#### FINDING-8 [INFO] Footer 组件本身设计合理

**严重性：** 信息  
**文件：** `src/components/Layout/Footer.tsx`

Footer 组件通过 `getCurrentLocale(pathname)` 自动检测语言，`toLocalizedPath` 生成正确的 About 链接，Privacy/Terms 有意使用固定 EN 路径。设计合理，唯一问题是被从 layout 中移除（见 FINDING-1）。

---

## 3. 四维审查总结

### 3.1 Quality Auditor — 代码质量

**良好：**

- 组件接口设计统一：`labels` + `localizedPlanets` 模式可复用
- i18n 架构一致：`getMessagesSync(locale)` → 传入组件 → 渲染
- 翻译文件 key 完全对齐（EN/ES/PT），无缺失
- `localizeBlogHrefs` 渲染层方案优于手动修改 markdown
- 新增工具文件（`dateLocale.ts`、`regions.ts`、`cityDescription.ts`、`cityFaq.ts`）职责单一
- 测试从 67 → 72 用例，覆盖新增逻辑

**需改进：**

- `normalizeHours` 重复定义（FINDING-3）
- EN/ES/PT 城市页三套实现难以维护（FINDING-4）
- Footer 移除回归（FINDING-1）

### 3.2 Security Analyst — 安全性

**结论：无安全风险。**

所有变更涉及：

- Server Component 静态渲染 + Client Component UI 展示
- 图片资源替换
- i18n 字符串替换

不涉及用户输入处理、API 端点、认证逻辑、数据库操作或外部服务调用。翻译字符串通过 `t()` 函数模板插值，无 XSS 注入风险。

### 3.3 Performance Reviewer — 性能

**正面：**

- `CityCurrentHourCard` 和 `CityHoursList` 使用 `useMemo` 避免重复计算
- 30s 刷新间隔在精度和性能之间取得合理平衡
- 博客图片提供 `.avif` / `.webp` / `.blur.jpg` 多格式，现代浏览器自动选择最优格式
- Next.js `StaticImageData` 静态导入支持构建时生成各尺寸/占位图

**观察：**

- `CityCurrentHourCard` 和 `CityHoursList` 各维护独立 `now` state + `setInterval`，同一页面存在两个 30s 定时器。性能开销可忽略，但可合并为共享时钟上下文
- `normalizeHours` 在两个组件中各执行一次（对同一 `hours` 数据），可通过提前在父级序列化避免重复

### 3.4 Architecture Assessor — 架构

**正面：**

- i18n 架构遵循 "Server Component 调用 `getMessagesSync` → 向下传递 messages" 的统一模式
- `localizeBlogHrefs` 在渲染管线统一处理链接，而非侵入内容层，是正确的关注点分离
- `CityCurrentHourCard` 的提取方向正确，为跨语言复用奠定基础
- `buildCityFaqItems` / `getLocalizedCityDescription` 统一三语 FAQ/描述生成逻辑

**需改进：**

- EN 城市页仍使用旧架构（CityInfo + 内联当前小时 + CityFAQ + RelatedCities），ES/PT 已重构。应在 EN 侧完成统一
- ES/PT 城市页渲染 goodFor/avoid 英文内容，与本地化标签形成割裂

---

## 4. 完整 Action Plan

### 4.1 必须修复（阻塞发布）

| ID     | Finding                       | 工作量 | 文件                             |
| ------ | ----------------------------- | ------ | -------------------------------- |
| **F1** | 恢复 ES/PT layout 中的 Footer | 5 min  | `es/layout.tsx`, `pt/layout.tsx` |

### 4.2 建议修复（下一迭代）

| ID     | Finding                            | 工作量    | 文件                                  |
| ------ | ---------------------------------- | --------- | ------------------------------------- |
| **F2** | goodFor/avoid 内容本地化或条件隐藏 | 30-60 min | `CityCurrentHourCard.tsx`, i18n JSONs |
| **F3** | 提取共享 normalizeHours            | 10 min    | 新建 utils, 更新两个组件              |
| **F4** | 统一 EN 城市页使用新组件架构       | 30-60 min | `planetary-hours/[city]/page.tsx`     |

### 4.3 长期优化

| ID  | 内容                                         | 备注                 |
| --- | -------------------------------------------- | -------------------- |
| L1  | 合并两个 30s setInterval 为共享时钟 Context  | 性能微优化           |
| L2  | 提取 ES/PT 城市页重复 JSX 为共享 Layout 组件 | 减少三语页面维护成本 |

---

## 5. 全量验证门禁记录

### Phase 2-4 验证（已提交）

| 检查项                              | 结果                       |
| ----------------------------------- | -------------------------- |
| `npm run lint`                      | ✅ 通过（仅既有 warnings） |
| `npm run typecheck`                 | ✅ 0 error                 |
| `npm run test`                      | ✅ 68/68 → 72/72           |
| `npm run build`                     | ✅ 391 → 401 → 441 pages   |
| `npm run audit:blog-translations`   | ✅ ES/PT 100% (33/33)      |
| SEO parity (`verify-seo-parity.ts`) | ✅ 177 checks, 0 blockers  |

### Phase 7 验证（当前未提交）

| 检查项              | 结果                         |
| ------------------- | ---------------------------- |
| `npm run lint`      | ✅ 通过（仅既有 warnings）   |
| `npm run typecheck` | ✅ 0 error                   |
| `npm run test`      | ✅ 13 files, 72/72           |
| Footer 渲染         | ❌ ES/PT 页面缺失（P0 回归） |

---

## 6. i18n 覆盖率终态矩阵

### 6.1 翻译文件 Key 覆盖

| 模块       | Key 数 | EN  | ES  | PT  |
| ---------- | ------ | --- | --- | --- |
| common     | 12     | ✅  | ✅  | ✅  |
| planets    | 7      | ✅  | ✅  | ✅  |
| calculator | 22     | ✅  | ✅  | ✅  |
| cityPage   | 10     | ✅  | ✅  | ✅  |
| cityIndex  | 10     | ✅  | ✅  | ✅  |
| blog       | 16     | ✅  | ✅  | ✅  |
| about      | 13     | ✅  | ✅  | ✅  |
| home       | 4      | ✅  | ✅  | ✅  |
| categories | 5      | ✅  | ✅  | ✅  |

### 6.2 路由覆盖

| 路由                | EN      | ES          | PT          |
| ------------------- | ------- | ----------- | ----------- |
| 首页                | ✅      | ✅          | ✅          |
| 关于                | ✅      | ✅          | ✅          |
| 博客列表            | ✅      | ✅          | ✅          |
| 博客文章 (33 篇)    | ✅      | ✅ 33/33    | ✅ 33/33    |
| 博客分类 (5 分类)   | ✅      | ✅          | ✅          |
| 城市索引            | ✅      | ✅          | ✅          |
| 城市详情 (101 城市) | ✅      | ✅          | ✅          |
| Privacy / Terms     | ✅      | — (EN-only) | — (EN-only) |
| **静态页面总计**    | ~141    | ~141        | ~141        |
| **三语合计**        | **441** |             |             |

### 6.3 组件 i18n 接入

| 组件                | locale prop | messages 使用       | 日期本地化 | 状态                              |
| ------------------- | ----------- | ------------------- | ---------- | --------------------------------- |
| Header              | ✅          | ✅                  | N/A        | ✅                                |
| Footer              | ✅          | ✅                  | N/A        | ✅ (组件本身；但被从 layout 移除) |
| LanguageSwitcher    | ✅          | ✅                  | N/A        | ✅                                |
| BlogPostCard        | ✅          | ✅                  | ✅         | ✅                                |
| BlogCategoryFilter  | ✅          | ✅                  | ✅         | ✅                                |
| RelatedArticles     | ✅          | ✅                  | N/A        | ✅                                |
| CalculatorCTA       | ✅          | ✅                  | N/A        | ✅                                |
| ArticleShare        | ✅          | ✅                  | N/A        | ✅                                |
| ArticleMeta         | ✅          | ✅                  | ✅         | ✅                                |
| TableOfContents     | ✅          | ✅                  | N/A        | ✅                                |
| BlogBackToTop       | ✅          | ✅                  | N/A        | ✅                                |
| FAQSection          | ✅          | ✅                  | N/A        | ✅                                |
| BackToTop           | ✅          | ✅                  | N/A        | ✅                                |
| CityCurrentHourCard | ✅          | ✅ labels           | N/A        | ✅ (goodFor/avoid 未本地化)       |
| CityHoursList       | ✅          | ✅ labels           | N/A        | ✅                                |
| CityInfo            | ❌          | ❌                  | ❌         | ⚠️ (仅 EN 使用)                   |
| CityFAQ             | ❌          | ✅ (hardcoded "en") | N/A        | ✅ (仅 EN 使用)                   |
| RelatedCities       | ❌          | ❌                  | N/A        | ⚠️ (仅 EN 使用)                   |

---

## 7. 相关文档索引

| 文件                                                | 描述                     |
| --------------------------------------------------- | ------------------------ |
| `.sisyphus/evidence/i18n-completeness-audit.md`     | 初始审计报告（Phase 1）  |
| `.sisyphus/evidence/pr-review-handoff.md`           | SEO 路由修复 PR 交接文档 |
| `.sisyphus/evidence/task-9-seo-parity.json`         | SEO 对称性检查结果       |
| `.sisyphus/evidence/blog-translation-coverage.json` | 博客翻译覆盖审计结果     |
| `.sisyphus/evidence/i18n-full-review-report.md`     | 本报告                   |

---

## 8. 结论

i18n 工程从初始审计的 26 个问题（P0-P3）推进到当前状态，**工程侧全部闭环**：

- ✅ 14 个 P0 共享组件全部接入 i18n
- ✅ 6 个 P1 EN 页面全部接入 i18n
- ✅ P2 ES/PT 分类路由已创建
- ✅ P3 数据层全部完成（regions、cityDescription、cityFaq、about 正文、翻译覆盖审计）
- ✅ 博客翻译 100% 覆盖（33/33）
- ✅ Markdown 内部链接渲染层自动本地化
- ✅ 城市页组件升级（CityCurrentHourCard、CityHoursList i18n）
- ✅ 博客配图全格式升级（avif/webp/jpg/blur）

**唯一阻塞项**：Footer 从 ES/PT layout 中意外移除（FINDING-1，P0），修复需 5 分钟。

修复此回归后即可发布。
