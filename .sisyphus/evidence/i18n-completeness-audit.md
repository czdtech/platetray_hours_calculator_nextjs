# i18n Completeness Audit Report

**Generated:** 2026-02-28  
**Scope:** Full project URL inventory + per-page i18n implementation analysis  
**Locales:** EN (default, no prefix) / ES (`/es/`) / PT (`/pt/`)  
**Translation files:** `src/i18n/messages/{en,es,pt}.json` — 88 keys each, structure fully aligned

---

## 1. Project URL Inventory

### 1.1 Complete Route Table (22 page.tsx files → 391 static pages at build)

| # | EN URL | ES URL | PT URL | 页面类型 |
|---|--------|--------|--------|----------|
| 1 | `/` | `/es` | `/pt` | 首页 |
| 2 | `/about` | `/es/about` | `/pt/about` | 关于页 |
| 3 | `/blog` | `/es/blog` | `/pt/blog` | 博客列表 |
| 4 | `/blog/[slug]` (20+ 篇) | `/es/blog/[slug]` (13 篇) | `/pt/blog/[slug]` (13 篇) | 博客文章 |
| 5 | `/blog/category/[category]` | **无** | **无** | 博客分类 |
| 6 | `/planetary-hours` | `/es/planetary-hours` | `/pt/planetary-hours` | 城市索引 |
| 7 | `/planetary-hours/[city]` (~101 城市) | `/es/planetary-hours/[city]` | `/pt/planetary-hours/[city]` | 城市详情 |
| 8 | `/privacy` | **无 (EN-only 设计)** | **无 (EN-only 设计)** | 隐私政策 |
| 9 | `/terms` | **无 (EN-only 设计)** | **无 (EN-only 设计)** | 服务条款 |
| 10 | `/debug` | **无 (开发工具)** | **无 (开发工具)** | 调试面板 |

### 1.2 Translation Coverage by Route

| 路由模式 | EN 页面数 | ES 页面数 | PT 页面数 | 备注 |
|----------|-----------|-----------|-----------|------|
| 首页 | 1 | 1 | 1 | EN 为计算器，ES/PT 为着陆页 |
| 关于 | 1 | 1 | 1 | |
| 博客列表 | 1 | 1 | 1 | |
| 博客文章 | ~20+ | 13 | 13 | 未翻译文章有回退机制 |
| 博客分类 | ~5 | 0 | 0 | **缺失** |
| 城市索引 | 1 | 1 | 1 | |
| 城市详情 | ~101 | ~101 | ~101 | |
| 隐私政策 | 1 | 0 | 0 | 有意 EN-only |
| 服务条款 | 1 | 0 | 0 | 有意 EN-only |
| 调试 | 1 | 0 | 0 | 生产环境 404 |
| **合计** | **~132** | **~118** | **~118** | |

---

## 2. Translation File (JSON) Comparison

### 2.1 Key Structure

三份翻译文件 `en.json` / `es.json` / `pt.json` 共 9 个顶层模块、88 个 key：

| 模块 | Key 数量 | EN | ES | PT |
|------|---------|-----|-----|-----|
| `common` | 7 | ✅ | ✅ | ✅ |
| `planets` | 7 | ✅ | ✅ | ✅ |
| `calculator` | 18 | ✅ | ✅ | ✅ |
| `cityPage` | 6 | ✅ | ✅ | ✅ |
| `cityIndex` | 3 | ✅ | ✅ | ✅ |
| `blog` | 12 | ✅ | ✅ | ✅ |
| `about` | 8 | ✅ | ✅ | ✅ |
| `home` | 4 | ✅ | ✅ | ✅ |
| `categories` | 5 | ✅ | ✅ | ✅ |

**结论：翻译文件本身没有缺失 key。**

### 2.2 Missing Message Keys (应存在但不存在的 key)

以下内容在页面/组件中以硬编码形式存在，但没有对应的 i18n key：

| 建议 key | 当前硬编码文本 | 使用位置 |
|----------|---------------|----------|
| `common.faq` | "FAQ" | Header.tsx |
| `common.selectLanguage` | "Select language" | LanguageSwitcher.tsx aria-label |
| `common.copyright` | "© 2025 Planetary Hours Calculator" | Footer.tsx |
| `common.privacyPolicy` | "Privacy Policy" | Footer.tsx |
| `common.termsOfService` | "Terms of Service" | Footer.tsx |
| `blog.author` | "Planetary Hours Team" | ArticleMeta.tsx, blog/[slug] pages |
| `blog.noTranslation` | "This article is not yet translated..." | ES/PT blog/[slug] pages |
| `blog.copyLink` | "Copy link" / "Link copied!" | ArticleShare.tsx |
| `blog.copyError` | 复制失败提示 | ArticleShare.tsx (当前为中文) |
| `blog.shareOn` | "Share on {platform}" | ArticleShare.tsx aria-labels |
| `calculator.findPlanetHour` | "Find your next {planet} hour" | CalculatorCTA.tsx |
| `calculator.calculateYourHours` | "Calculate your planetary hours" | CalculatorCTA.tsx |
| `cityPage.regionNames.*` | "Africa", "North America" 等 | cities.ts data |
| `about.chaldeanOrder` | 迦勒底序 描述段落 | about pages |
| `about.planetHourDescriptions.*` | 各行星时描述（Sun Hour, Venus Hour 等） | about pages |
| `about.keyFeaturesList.*` | Key Features 各条目 | about pages |
| `about.limitationsText` | Limitations 正文 | about pages |
| `about.closingText` | 结尾段落 | about pages |
| `cityPage.faqItems.*` | FAQ 问答内容 | city detail pages |

---

## 3. Per-Page i18n Implementation Analysis

### 3.1 EN Pages — 全部未接入 i18n

| 页面 | 使用 getMessages | Metadata 国际化 | UI 文本国际化 | 日期本地化 |
|------|-----------------|-----------------|--------------|-----------|
| `/` (首页) | ❌ | ❌ 全部硬编码 | ❌ | N/A |
| `/about` | ❌ | ❌ | ❌ | N/A |
| `/blog` | ❌ | ❌ | ❌ | ❌ |
| `/blog/[slug]` | ❌ | ❌ | ❌ | ❌ |
| `/blog/category/[category]` | ❌ | ❌ | ❌ | ❌ |
| `/planetary-hours` | ❌ | ❌ | ❌ | N/A |
| `/planetary-hours/[city]` | ❌ | ❌ | ❌ | ❌ |
| `/privacy` | ❌ | ❌ | ❌ | N/A |
| `/terms` | ❌ | ❌ | ❌ | N/A |
| `/debug` | ❌ | N/A (client) | ❌ (中文) | N/A |

### 3.2 ES Pages

| 页面 | 使用 getMessages | Metadata 国际化 | UI 文本国际化 | 日期本地化 |
|------|-----------------|-----------------|--------------|-----------|
| `/es` (首页) | ✅ | ✅ | ✅ | N/A |
| `/es/about` | ✅ | ✅ | ⚠️ 部分（正文硬编码西文） | N/A |
| `/es/blog` | ✅ | ✅ | ✅ | ❌ formatDistanceToNow 无 locale |
| `/es/blog/[slug]` | ✅ | ✅ | ⚠️ author 仍为英文 | ❌ format 无 locale |
| `/es/planetary-hours` | ✅ | ⚠️ 硬编码西文而非 messages | ✅ | N/A |
| `/es/planetary-hours/[city]` | ✅ | ✅ | ⚠️ FAQ 硬编码西文 | ✅ esLocale |

### 3.3 PT Pages

| 页面 | 使用 getMessages | Metadata 国际化 | UI 文本国际化 | 日期本地化 |
|------|-----------------|-----------------|--------------|-----------|
| `/pt` (首页) | ✅ | ✅ | ✅ | N/A |
| `/pt/about` | ✅ | ✅ | ⚠️ 部分（正文硬编码葡文） | N/A |
| `/pt/blog` | ✅ | ✅ | ✅ | ❌ formatDistanceToNow 无 locale |
| `/pt/blog/[slug]` | ✅ | ✅ | ⚠️ author 仍为英文 | ❌ format 无 locale |
| `/pt/planetary-hours` | ✅ | ⚠️ 硬编码葡文而非 messages | ✅ | N/A |
| `/pt/planetary-hours/[city]` | ✅ | ✅ | ⚠️ FAQ 硬编码葡文 | ✅ ptBR locale |

---

## 4. Shared Component i18n Audit

### 4.1 Layout Components (影响全站所有页面)

#### `src/components/Layout/Header.tsx`

- **接入 i18n**: ❌ 不接受 locale/messages props
- **硬编码文本**:
  - `"Planetary Hours"` (logo, 2 处)
  - `"Calculator"` (4 处 — desktop/mobile × active/inactive)
  - `"FAQ"` (4 处)
  - `"Cities"` (4 处)
  - `"Blog"` (4 处)
  - `"About"` (4 处)
  - `aria-label="Planetary Hours home"`, `"Toggle navigation"`
- **已有 i18n key**: `messages.common.home/blog/about/cities/calculator`
- **影响**: ES/PT 所有页面的导航显示英文

#### `src/components/Layout/Footer.tsx`

- **接入 i18n**: ❌
- **硬编码文本**:
  - `"© 2025 Planetary Hours Calculator"`
  - `"About"` (链接文本)
  - `"Privacy Policy"` (链接文本)
  - `"Terms of Service"` (链接文本)
- **备注**: Privacy/Terms 链接目标为 EN-only 页面（设计如此），但链接文本本身应翻译
- **影响**: ES/PT 所有页面的底部显示英文

#### `src/components/Layout/LanguageSwitcher.tsx`

- **接入 i18n**: ❌
- **硬编码文本**: `aria-label="Select language"`
- **影响**: 辅助功能，各语言页面 aria-label 均为英文

### 4.2 Blog Components (影响 ES/PT 博客页面)

#### `src/components/Blog/BlogPostCard.tsx`

- **接入 i18n**: ❌
- **硬编码**: `"Read more →"`
- **已有 key**: `messages.blog.readMore`
- **日期问题**: `formatDistanceToNow` 未传 locale
- **影响**: ES/PT 博客列表显示英文 "Read more" 和英文相对时间

#### `src/components/Blog/BlogCategoryFilter.tsx`

- **接入 i18n**: ⚠️ 部分 — 接受 `allLabel` prop 但默认 `"All"`
- **硬编码**:
  - 默认 `allLabel="All"` (已有 key `messages.blog.all`)
  - `"min read"` (已有 key `messages.blog.minRead`)
  - `"Read more →"` (已有 key `messages.blog.readMore`)
  - 分类标签来自 `BLOG_CATEGORIES` 常量（英文），未使用 `messages.categories.*`
- **日期问题**: `formatDistanceToNow` 未传 locale
- **影响**: ES/PT 博客列表页分类标签和卡片标签显示英文

#### `src/components/Blog/RelatedArticles.tsx`

- **接入 i18n**: ❌
- **硬编码**: `"Related Articles"`, `"Read more"`
- **已有 key**: `messages.blog.relatedArticles`, `messages.blog.readMore`
- **影响**: ES/PT 博客文章页相关推荐区域显示英文

#### `src/components/Blog/CalculatorCTA.tsx`

- **接入 i18n**: ❌
- **硬编码**:
  - `"Find your next ${planet} hour"` (动态)
  - `"Calculate your planetary hours"`
  - `"Open Calculator →"`
- **部分已有 key**: `messages.calculator.openCalculator`
- **影响**: ES/PT 博客文章页 CTA 显示英文

#### `src/components/Blog/ArticleShare.tsx`

- **接入 i18n**: ❌
- **硬编码**:
  - `"Share this article:"` (已有 key `messages.blog.shareArticle`)
  - aria-labels: "Share on Twitter", "Share on Facebook", "Share on WhatsApp", "Share on Telegram", "Copy link", "Link copied!"
  - **复制失败提示为中文**: `"无法复制链接，请手动复制地址栏中的URL"`
- **影响**: ES/PT 文章分享区域混合英文和中文

#### `src/components/Blog/ArticleMeta.tsx`

- **接入 i18n**: ❌
- **硬编码**:
  - `"Planetary Hours Team"` (author fallback)
  - `" min read"` (已有 key `messages.blog.minRead`)
- **日期问题**: `format(date, "MMMM d, yyyy")` 未传 locale，月份名为英文
- **影响**: ES/PT 文章页显示英文作者名、英文阅读时间、英文日期

#### `src/components/Blog/TableOfContents.tsx`

- **接入 i18n**: ❌
- **硬编码**: `"Table of Contents"` (已有 key `messages.blog.tableOfContents`)
- **影响**: ES/PT 文章页目录标题显示英文

#### `src/components/Blog/BlogBackToTop.tsx`

- **接入 i18n**: ❌
- **硬编码 (中文)**:
  - `aria-label="返回顶部"` / `title="返回顶部"`
  - `aria-label="分享文章"` / `title="分享文章"`
- **已有 key**: `messages.common.backToTop`
- **影响**: 全站辅助功能 aria-label 为中文（应为各语言本地化）

#### `src/components/Blog/FAQSection.tsx`

- **接入 i18n**: ❌
- **硬编码**: `"Frequently Asked Questions"` (已有 key `messages.blog.faq`)
- **影响**: ES/PT 文章页 FAQ 标题显示英文

### 4.3 City Components (仅在 EN 城市页使用)

| 组件 | 硬编码文本 |
|------|-----------|
| `CityInfo` | "Planetary Hours in {city} Today", "Sunrise", "Sunset", "Day Ruler", "Timezone" |
| `CityHoursList` | "Daytime Planetary Hours", "Nighttime Planetary Hours", "Planet", "Time", "Duration", "Now" |
| `CityFAQ` | "Frequently Asked Questions" + 全部 FAQ 问答 |
| `RelatedCities` | "Planetary Hours in Other Cities" |

**备注**: ES/PT 城市页不使用这些共享组件，而是在各自的 page.tsx 中直接内联渲染（使用 messages），但 FAQ 内容为硬编码西/葡文。

---

## 5. Date/Time Localization Audit

| 位置 | 函数 | locale 参数 | 问题 |
|------|------|------------|------|
| `src/app/blog/page.tsx` | `formatDistanceToNow` | ❌ 未传 | EN 页面无影响 |
| `src/app/es/blog/page.tsx` | `formatDistanceToNow` | ❌ 未传 | ES 页面显示英文 "3 days ago" |
| `src/app/pt/blog/page.tsx` | `formatDistanceToNow` | ❌ 未传 | PT 页面显示英文 "3 days ago" |
| `BlogCategoryFilter.tsx` | `formatDistanceToNow` | ❌ 未传 | ES/PT 显示英文 |
| `ArticleMeta.tsx` | `formatDistanceToNow` | ❌ 未传 | ES/PT 显示英文 |
| `ArticleMeta.tsx` | `format(date, "MMMM d, yyyy")` | ❌ 未传 | ES/PT 月份名英文 |
| EN `planetary-hours/[city]` | `formatInTimeZone` | ❌ 未传 | EN 无影响 |
| ES `planetary-hours/[city]` | `formatInTimeZone` | ✅ `esLocale` | **正确** |
| PT `planetary-hours/[city]` | `formatInTimeZone` | ✅ `ptBR` | **正确** |

---

## 6. Data Layer Localization Gaps

### 6.1 City Data (`src/data/cities.ts`)

- `region` 字段: "Africa", "Asia", "Europe", "North America", "South America", "Oceania" — 全部英文
- `description` 字段: 英文描述 — ES/PT 城市页直接使用
- **影响**: ES/PT 城市索引页的区域分组标题显示英文

### 6.2 Blog Category Constants (`src/constants/blogCategories.ts`)

- `BLOG_CATEGORIES` 对象的 `label`/`description` 字段为英文
- i18n JSON 中已有 `categories.*` key（已翻译），但 `BlogCategoryFilter` 和 `/blog/category/[category]` 页面使用常量而非 i18n key
- **影响**: 分类标签在全站显示英文

### 6.3 Blog Content Files

| 语言 | 已翻译文章数 | 总文章数 | 覆盖率 |
|------|-------------|---------|--------|
| EN | 20+ | 20+ | 100% |
| ES | 13 | 20+ | ~65% |
| PT | 13 | 20+ | ~65% |

- ES/PT slug 集合完全一致（均为 13 篇相同文章）
- 未翻译文章有回退机制：显示英文内容 + 语言提示

---

## 7. Priority Classification

### P0 — 用户可见的错误语言（ES/PT 页面显示英文或中文）

| ID | 问题 | 影响范围 | 修复方式 |
|----|------|----------|---------|
| P0-1 | Header 导航全部英文 | 全站 ES/PT | Header 接受 locale prop，使用 messages.common |
| P0-2 | Footer 文本全部英文 | 全站 ES/PT | Footer 接受 locale prop |
| P0-3 | BlogPostCard "Read more →" 英文 | ES/PT 博客列表 | 组件接受 readMoreLabel prop |
| P0-4 | BlogCategoryFilter "All"/"min read"/"Read more" 英文 | ES/PT 博客列表 | 传入 allLabel/readMoreLabel/minReadLabel |
| P0-5 | RelatedArticles "Related Articles"/"Read more" 英文 | ES/PT 文章页 | 组件接受 messages prop |
| P0-6 | TableOfContents "Table of Contents" 英文 | ES/PT 文章页 | 接受 title prop |
| P0-7 | FAQSection "Frequently Asked Questions" 英文 | ES/PT 文章页 | 接受 title prop |
| P0-8 | ArticleShare 混合英文+中文 | ES/PT 文章页 | 接受 messages prop，修复中文 |
| P0-9 | BlogBackToTop aria-label 中文 | 全站 | 使用 messages.common.backToTop |
| P0-10 | ArticleMeta "min read"/"Planetary Hours Team" 英文 | ES/PT 文章页 | 接受 locale/messages prop |
| P0-11 | formatDistanceToNow 无 locale | ES/PT 博客页 | 传入 date-fns locale |
| P0-12 | format("MMMM d, yyyy") 无 locale | ES/PT 文章页 | 传入 date-fns locale |
| P0-13 | CalculatorCTA 英文 | ES/PT 文章页 | 接受 messages prop |
| P0-14 | 分类标签使用英文常量 | 博客分类页 | 使用 messages.categories |

### P1 — 架构一致性（EN 页面不使用 i18n）

| ID | 问题 | 修复方式 |
|----|------|---------|
| P1-1 | EN 首页不使用 getMessages | 引入 getMessagesSync("en") |
| P1-2 | EN /about 不使用 getMessages | 同上 |
| P1-3 | EN /blog 不使用 getMessages | 同上 |
| P1-4 | EN /blog/[slug] 不使用 getMessages | 同上 |
| P1-5 | EN /planetary-hours 不使用 getMessages | 同上 |
| P1-6 | EN /planetary-hours/[city] 不使用 getMessages | 同上 |

### P2 — 缺失路由

| ID | 问题 | 修复方式 |
|----|------|---------|
| P2-1 | `/blog/category/[category]` 无 ES/PT 版本 | 新增 ES/PT 分类路由 |

### P3 — 数据层

| ID | 问题 | 修复方式 |
|----|------|---------|
| P3-1 | cities.ts region 英文 | 新增 region i18n 映射 |
| P3-2 | cities.ts description 英文 | 按需新增本地化描述 |
| P3-3 | ES/PT about 正文硬编码 | 迁入 i18n JSON |
| P3-4 | ES/PT city FAQ 硬编码 | 迁入 i18n JSON 或结构化数据 |
| P3-5 | 博客文章翻译覆盖 ~65% | 逐步翻译剩余文章 |

---

## 8. Relationship to .sisyphus/plans/seo-risk-remediation-pr-review.md

该计划文档中 Task 1-10 + F1-F4 的关系：

| 计划任务 | 与本审计的关系 |
|---------|---------------|
| Task 1 (routePolicy) | 已完成，解决了路由策略问题，但不涉及 UI 文本翻译 |
| Task 2 (Header locale) | 标记完成，**但本审计发现 Header 仍显示英文文本**（Task 2 仅修复了链接路径，未修复导航文本） |
| Task 3 (Footer locale) | 标记完成，**同上 — Footer 链接路径已修复但文本仍英文** |
| Task 4 (Blog 组件链接) | 标记完成，**链接路径已修复但组件文本仍硬编码英文** |
| Task 5 (LanguageSwitcher) | 已完成 |
| Task 6 (alternates 对齐) | 已完成 |
| Task 7 (城市页日期/CTA) | 已完成（ES/PT 城市页日期已本地化） |
| Task 8 (回归测试) | 已完成 |
| Task 9 (SEO parity) | 已完成，177 检查 / 0 blocker |
| Task 10 (handoff) | 已完成 |

**关键发现**：之前的 SEO 风险修复计划聚焦于**路由路径和 SEO 标签**的正确性，已成功完成。但**页面/组件内的 UI 文本翻译**不在该计划范围内，是本审计发现的新增工作项。

---

## 9. Effort Estimate

| 优先级 | 工作项数 | 预估工作量 | 备注 |
|--------|---------|-----------|------|
| P0 | 14 项 | Medium | 主要是给共享组件添加 locale/messages props |
| P1 | 6 项 | Low-Medium | EN 页面引入 getMessagesSync("en") |
| P2 | 1 项 | Low | 新增 ES/PT 分类路由 |
| P3 | 5 项 | High | 涉及大量内容迁移和新增翻译 |

---

## Appendix A: Files Requiring Changes (P0)

```
src/components/Layout/Header.tsx
src/components/Layout/Footer.tsx
src/components/Layout/LanguageSwitcher.tsx
src/components/Blog/BlogPostCard.tsx
src/components/Blog/BlogCategoryFilter.tsx
src/components/Blog/RelatedArticles.tsx
src/components/Blog/CalculatorCTA.tsx
src/components/Blog/ArticleShare.tsx
src/components/Blog/ArticleMeta.tsx
src/components/Blog/TableOfContents.tsx
src/components/Blog/BlogBackToTop.tsx
src/components/Blog/FAQSection.tsx
src/i18n/messages/en.json (新增 key)
src/i18n/messages/es.json (新增 key)
src/i18n/messages/pt.json (新增 key)
```

## Appendix B: Files Requiring Changes (P1)

```
src/app/page.tsx
src/app/about/page.tsx
src/app/blog/page.tsx
src/app/blog/[slug]/page.tsx
src/app/planetary-hours/page.tsx
src/app/planetary-hours/[city]/page.tsx
```

## Appendix C: Files Requiring Changes (P2)

```
src/app/es/blog/category/[category]/page.tsx (新增)
src/app/pt/blog/category/[category]/page.tsx (新增)
```
