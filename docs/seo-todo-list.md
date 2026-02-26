# SEO 里程碑 — 细粒度开发 To-Do List

> 基于 `/workspace/docs/seo-milestone-plan.md` 里程碑计划 + 代码架构深度分析
> 
> **代码架构摘要（指导本文档的技术决策）：**
> - 博客系统：`src/content/blog/*.md`（frontmatter + markdown）→ `gray-matter` 解析 → `remark` + `remark-html` 转 HTML
> - 博客数据注册：`src/data/blogPosts.ts` 中手动维护 slug/title/excerpt/imageUrl 数组；`scripts/generate-blog-metadata.ts` 从 md 生成 `blogDates.json` + `blogRead.json`
> - 静态生成：`blog/[slug]/page.tsx` 使用 `generateStaticParams()` 从 `blogPosts` 数组取 slug 列表，`dynamicParams = false`
> - SEO 基础设施：`src/config/seo.ts`（全局配置）、`src/utils/seo/jsonld.ts`（Schema 生成器）、`src/utils/seo/metadata.ts`（Metadata 生成器）、`src/components/SEO/JsonLd.tsx`（渲染组件）、`src/components/SEO/Breadcrumb.tsx`（面包屑 UI）
> - Schema 类型：`src/types/schema.ts` — WebSite / Article / BreadcrumbList / FAQPage / SoftwareApplication / LocalBusiness 等
> - 计算引擎：`src/services/PlanetaryHoursCalculator.ts` — `calculate(lat, lng, date, timezone)` → `PlanetaryHoursCalculationResult`（含 dayRuler / sunrise / sunset / hours[]）
> - Sitemap：`src/app/sitemap.ts` — 从 `blogPosts` + `staticPageDates.json` 生成
> - Header：`src/components/Layout/Header.tsx` — activePage prop 控制高亮，当前只有 `calculator | about | blog` 三个值
> - Layout：`src/app/layout.tsx` — `<html lang="en">`，无 i18n 机制

---

## Phase B：主题集群内容矩阵

### B-INFRA：博客系统基础设施增强

> 在开始大量新增内容之前，先优化博客系统以支撑扩展。

#### B-INFRA-1：博客分类/标签系统

- [x] **B-INFRA-1a**：在 `src/types/blog.ts` 的 `BlogPost` interface 中新增 `category?: string` 和 `tags?: string[]` 字段
- [x] **B-INFRA-1b**：定义分类枚举常量文件 `src/constants/blogCategories.ts`，包含以下分类：
  - `planet-hours`（行星时专题）
  - `planet-days`（行星日专题）
  - `practical-use`（应用场景）
  - `education`（教育基础）
  - `news`（新闻/事件）
- [x] **B-INFRA-1c**：在 `src/data/blogPosts.ts` 中为现有 9 篇文章添加 category 和 tags 字段
- [x] **B-INFRA-1d**：在 `src/app/blog/page.tsx` 中添加分类筛选 UI（Tab 栏或 Tag 云）
- [ ] **B-INFRA-1e**：可选——创建分类路由 `src/app/blog/category/[category]/page.tsx`，用于分类 landing page

#### B-INFRA-2：博客文章新增流程优化

- [x] **B-INFRA-2a**：在 `src/content/blog/` 的 frontmatter 中支持可选字段 `keywords: string[]`，用于 `<meta name="keywords">`
- [x] **B-INFRA-2b**：修改 `src/app/blog/[slug]/page.tsx` 的 `generateMetadata()` 函数，从 frontmatter 读取 keywords 并注入到 metadata.keywords 中
- [x] **B-INFRA-2c**：在 `src/app/blog/[slug]/page.tsx` 中添加对新文章的 FAQ Schema 支持——如果 frontmatter 中包含 `faqs` 字段（数组），则在页面中注入 `FAQPageSchema`
  - frontmatter 格式设计：`faqs: [{q: "...", a: "..."}]`
  - 或者：在 markdown 正文中用特定格式标记 FAQ，由解析器提取
  - 推荐方案：在 frontmatter 中添加 `faqs` 字段，在 `getMarkdownContent()` 中解析并返回
- [x] **B-INFRA-2d**：修改 `src/utils/markdown.ts` 的 `MarkdownContent` interface，新增 `keywords?: string[]` 和 `faqs?: {question: string, answer: string}[]`
- [x] **B-INFRA-2e**：修改 `getMarkdownContent()` 函数，从 frontmatter 解析 keywords 和 faqs 字段

#### B-INFRA-3：内链 CTA 组件

- [x] **B-INFRA-3a**：创建 `src/components/Blog/CalculatorCTA.tsx` 组件——博客文章中嵌入的计算器引导卡片
  - Props: `planet?: string`（如 "Venus"）、`text?: string`
  - UI：圆角卡片，渐变背景，"Find your next [Planet] hour →" 按钮链接到首页
- [x] **B-INFRA-3b**：创建 `src/components/Blog/RelatedPlanetHours.tsx` 组件——文章底部展示相关的行星时专题链接
  - Props: `planets: string[]`（如 ["Venus", "Moon"]）
  - 自动链接到对应行星时专题博客页
- [x] **B-INFRA-3c**：创建 `src/components/Blog/TableOfContents.tsx` 组件——长文章的目录导航
  - 从 markdown HTML 中提取 h2/h3 生成锚点目录
  - 固定在侧边栏（桌面端）或折叠在顶部（移动端）

#### B-INFRA-4：Sitemap 扩展准备

- [x] **B-INFRA-4a**：确认 `src/app/sitemap.ts` 在新增博客文章后能自动包含新页面（已通过 `blogPosts` 数组实现，但需确认动态 params 也被包含）
- [ ] **B-INFRA-4b**：在 `src/data/staticPageDates.json` 中预留 `planetaryHoursGuide` 等新页面的日期条目

---

### B1：七大行星时专题页（第 1-3 周）

> 每篇文章需要同时完成：Markdown 内容创建 + blogPosts 数据注册 + 图片准备

#### B1-Venus：Venus Hour 专题

- [x] **B1-Venus-1**：撰写 `src/content/blog/venus-hour-guide.md`（~3000 词）
  - frontmatter: title / excerpt / date / author / keywords / faqs
  - keywords: `["venus hour", "venus hour meaning", "venus hour today", "venus hour on friday", "venus hour astrology"]`
  - faqs: 至少 3 个 FAQ（What is Venus hour good for? / Is Venus Hora a good time for love? / When is Venus hour today?）
  - 内容结构：H1 → 定义段落（回答 PAA）→ Venus Hour 含义 → 最佳活动清单 → 避免事项 → Venus Hour on Friday 专题 → 如何查找今天的 Venus Hour → 计算器 CTA → FAQ
  - 内链要求：链接到首页计算器、what-are-planetary-hours、using-planetary-hours、planetary-hours-faq
- [ ] **B1-Venus-2**：准备封面图 `public/images/blog/venus-hour-guide.jpg`（或 .webp）——当前使用占位图
  - 图片 Alt: "Venus Hour Astrology Guide - Love, Beauty and Perfect Timing"
- [x] **B1-Venus-3**：在 `src/data/blogPosts.ts` 中注册新文章
  - 添加 import 语句：`import venusHourImg from "../../public/images/blog/venus-hour-guide.jpg";`
  - 在 `blogPosts` 数组中添加条目（注意按日期倒序放在正确位置）
- [x] **B1-Venus-4**：运行 `npm run generate:blog-metadata` 更新 blogDates.json 和 blogRead.json
- [x] **B1-Venus-5**：运行 `npm run build` 验证静态生成正常，页面可访问 `/blog/venus-hour-guide`
- [x] **B1-Venus-6**：检查页面 SEO 元素完整性——title / description / canonical / OG / Twitter / Article Schema / Breadcrumb Schema / FAQ Schema

#### B1-Jupiter：Jupiter Hour 专题

- [x] **B1-Jupiter-1**：撰写 `src/content/blog/jupiter-hour-guide.md`（~3000 词）
  - keywords: `["jupiter hour", "jupiter hour today", "jupiter hour meaning", "jupiter hour on thursday", "jupiter hour astrology"]`
  - faqs: What is Jupiter hour good for? / What is the best day for Jupiter hour? / How long is a Jupiter hour?
  - 内容要点：Greater Benefic 概念、财务/法律/扩展活动、Thursday 增强效果
  - 内链：首页 + 其他已完成的行星时专题
- [ ] **B1-Jupiter-2**：准备封面图 `public/images/blog/jupiter-hour-guide.jpg`——当前使用占位图
- [x] **B1-Jupiter-3**：在 `src/data/blogPosts.ts` 中注册
- [x] **B1-Jupiter-4**：运行 `npm run generate:blog-metadata`
- [x] **B1-Jupiter-5**：构建验证

#### B1-Saturn：Saturn Hour 专题

- [x] **B1-Saturn-1**：撰写 `src/content/blog/saturn-hour-guide.md`（~3000 词）
  - keywords: `["saturn hour", "saturn hour meaning", "saturn hour today", "saturn hour activities", "saturn hours on saturday"]`
  - faqs: What is the hour of Saturn good for? / What is Saturn time? / What activities are best during Saturn hour?
  - 内容要点：纪律/责任/长期规划、Saturday 增强、"慢时间" 概念
- [ ] **B1-Saturn-2**：准备封面图——当前使用占位图
- [x] **B1-Saturn-3**：在 `src/data/blogPosts.ts` 中注册
- [x] **B1-Saturn-4**：运行 `npm run generate:blog-metadata`
- [x] **B1-Saturn-5**：构建验证

#### B1-Mercury：Mercury Hour 专题

- [x] **B1-Mercury-1**：撰写 `src/content/blog/mercury-hour-guide.md`（~2500 词）
  - keywords: `["mercury hour astrology", "mercury hour meaning", "what is mercury hour", "mercury planetary hour"]`
  - faqs: What is Mercury hora good for? / What is Mercury time in astrology?
  - 内容要点：沟通/学习/写作/贸易、Wednesday 关联
- [ ] **B1-Mercury-2**：准备封面图——当前使用占位图
- [x] **B1-Mercury-3**：注册 + 元数据生成 + 构建验证

#### B1-Mars：Mars Hour 专题

- [x] **B1-Mars-1**：撰写 `src/content/blog/mars-hour-guide.md`（~2500 词）
  - keywords: `["mars planetary hour meaning", "mars hour astrology"]`
  - faqs: What is Mars hour good for? / Is Mars hour good for competition?
  - 内容要点：能量/勇气/行动/竞争、Tuesday 关联
- [ ] **B1-Mars-2**：准备封面图——当前使用占位图
- [x] **B1-Mars-3**：注册 + 元数据生成 + 构建验证

#### B1-Sun：Sun Hour 专题

- [x] **B1-Sun-1**：撰写 `src/content/blog/sun-hour-guide.md`（~2500 词）
  - keywords: `["sun planetary hour meaning", "sun hour astrology"]`
  - 内容要点：领导力/活力/成功/权威、Sunday 关联
- [ ] **B1-Sun-2**：准备封面图——当前使用占位图
- [x] **B1-Sun-3**：注册 + 元数据生成 + 构建验证

#### B1-Moon：Moon Hour 专题

- [x] **B1-Moon-1**：撰写 `src/content/blog/moon-hour-guide.md`（~2500 词）
  - keywords: `["moon planetary hour meaning", "planetary hours moon meaning"]`
  - 内容要点：情感/直觉/家庭事务/公共事务、Monday 关联
- [ ] **B1-Moon-2**：准备封面图——当前使用占位图
- [x] **B1-Moon-3**：注册 + 元数据生成 + 构建验证

#### B1-交叉链接

- [ ] **B1-XLINK-1**：7 篇文章全部完成后，回头在每篇文章中添加到其他 6 篇的内链
- [ ] **B1-XLINK-2**：在首页 FAQ 部分的回答中添加到相关行星时专题的链接
- [ ] **B1-XLINK-3**：在现有 9 篇博客中选择 3-5 篇，在相关段落自然插入到新行星时专题的链接

---

### B2：行星日专题（第 3-5 周）

#### B2-Pillar：行星日总览 Pillar Page

- [ ] **B2-Pillar-1**：撰写 `src/content/blog/planetary-days-of-the-week.md`（~3500 词）
  - keywords: `["planetary days of the week", "planetary days of the week meaning", "planetary days astrology", "what planet rules each day"]`
  - 内容：7 天概览、迦勒底顺序解释、每天简介 + 链接到各日专题
  - 包含一个 7×3 表格（Day / Ruling Planet / Best Activities）
- [ ] **B2-Pillar-2**：准备封面图
- [ ] **B2-Pillar-3**：注册 + 元数据生成

#### B2-Days：7 个星期日专题

对以下 7 篇文章，每篇执行相同步骤：

- [ ] **B2-Sunday**：撰写 `src/content/blog/sunday-sun-day.md`（~1800 词）— keywords: what planet rules sunday, sun day meaning
- [ ] **B2-Monday**：撰写 `src/content/blog/monday-moon-day.md`（~1800 词）
- [ ] **B2-Tuesday**：撰写 `src/content/blog/tuesday-mars-day.md`（~1800 词）
- [ ] **B2-Wednesday**：撰写 `src/content/blog/wednesday-mercury-day.md`（~1800 词）
- [ ] **B2-Thursday**：撰写 `src/content/blog/thursday-jupiter-day.md`（~1800 词）
- [ ] **B2-Friday**：撰写 `src/content/blog/friday-venus-day.md`（~1800 词）
- [ ] **B2-Saturday**：撰写 `src/content/blog/saturday-saturn-day.md`（~1800 词）

每篇文章都需要：
- [ ] 准备封面图
- [ ] 在 `src/data/blogPosts.ts` 中注册（共 8 篇新增：1 Pillar + 7 Days）
- [ ] 运行 `npm run generate:blog-metadata`
- [ ] 每篇都包含到对应行星时专题（B1）的双向内链
- [ ] 每篇都包含到 Pillar 页面的内链

#### B2-XLINK：交叉链接

- [ ] **B2-XLINK-1**：Pillar 页面链接到全部 7 个星期日专题
- [ ] **B2-XLINK-2**：每个星期日专题链接到对应行星时专题（如 Friday → Venus Hour Guide）
- [ ] **B2-XLINK-3**：每个行星时专题（B1）反向链接到对应星期日专题
- [ ] **B2-XLINK-4**：构建验证全部 8 篇正常

---

### B3：应用场景专题（第 5-7 周）

#### B3-Love

- [ ] **B3-Love-1**：撰写 `src/content/blog/planetary-hours-for-love.md`（~3000 词）
  - keywords: `["planetary hours for love", "best time for love astrology", "venus hora for love", "planetary hours for love and marriage"]`
  - faqs: Is Venus Hora a good time for love? / What planetary hour is best for a first date? / Can planetary hours improve my relationship?
  - 内容：Venus Hour for love（主推）+ Moon Hour for emotions + Jupiter Hour for commitment + 实操建议
  - 内链到 venus-hour-guide、moon-hour-guide、friday-venus-day
- [ ] **B3-Love-2**：封面图 + 注册 + 元数据生成

#### B3-Magic

- [ ] **B3-Magic-1**：撰写 `src/content/blog/planetary-hours-for-magic.md`（~3000 词）
  - keywords: `["planetary hours and days for magic", "planetary hours for spells"]`
  - 内容：7 行星 × 魔法对应关系、施法时机选择、与星期日的双重增强
  - 注意：以教育/历史角度为主，保持中性专业语气
- [ ] **B3-Magic-2**：封面图 + 注册 + 元数据生成

#### B3-Manifestation

- [ ] **B3-Manifest-1**：撰写 `src/content/blog/planetary-hours-for-manifestation.md`（~2500 词）
  - keywords: `["planetary hours for manifestation"]`
  - 内容：显化/意图设定与行星时的结合，Jupiter/Sun/Venus Hour 推荐
- [ ] **B3-Manifest-2**：封面图 + 注册 + 元数据生成

#### B3-Money

- [ ] **B3-Money-1**：撰写 `src/content/blog/planetary-hours-for-money.md`（~2500 词）
  - keywords: `["best planetary hour for money", "jupiter hour for money", "best time for business astrology"]`
  - 内链到 jupiter-hour-guide、planetary-hours-business-success（已有文章）
- [ ] **B3-Money-2**：封面图 + 注册 + 元数据生成

#### B3-Marriage

- [ ] **B3-Marriage-1**：撰写 `src/content/blog/best-planetary-hour-for-marriage.md`（~2000 词）
  - keywords: `["best time for marriage astrology", "planetary hours for marriage"]`
- [ ] **B3-Marriage-2**：封面图 + 注册 + 元数据生成

#### B3-Interview

- [ ] **B3-Interview-1**：撰写 `src/content/blog/best-planetary-hour-for-interview.md`（~2000 词）
  - keywords: `["best time for interview astrology"]`
  - 推荐 Mercury Hour（沟通）+ Jupiter Hour（好运）+ Sun Hour（权威印象）
- [ ] **B3-Interview-2**：封面图 + 注册 + 元数据生成

#### B3-Surgery

- [ ] **B3-Surgery-1**：撰写 `src/content/blog/best-planetary-hour-for-surgery.md`（~2000 词）
  - keywords: `["best time for surgery astrology"]`
  - 重要：添加医疗免责声明
- [ ] **B3-Surgery-2**：封面图 + 注册 + 元数据生成

#### B3-Chart-PDF

- [ ] **B3-PDF-1**：设计可打印的行星时参考表 PDF（7 行星 × 7 星期矩阵 + 每个行星的属性/活动摘要）
- [ ] **B3-PDF-2**：将 PDF 放置在 `public/downloads/planetary-hours-chart.pdf`
- [ ] **B3-PDF-3**：撰写 `src/content/blog/planetary-hours-chart-pdf.md`（~1500 词）
  - keywords: `["planetary hours chart", "planetary hours chart pdf", "planetary hours pdf", "planetary days and hours chart"]`
  - 内容：表格预览图 + PDF 下载按钮 + 如何使用说明
- [ ] **B3-PDF-4**：封面图（可以是 PDF 预览截图）+ 注册 + 元数据生成

#### B3-构建验证

- [ ] **B3-BUILD**：全部 8 篇完成后运行 `npm run build` 验证所有页面正常生成

---

### B4：教育基础内容补强（第 7-8 周）

#### B4-Meanings-Pillar

- [ ] **B4-Meanings-1**：撰写 `src/content/blog/planetary-hours-and-their-meanings.md`（~3000 词）
  - keywords: `["planetary hours and their meanings", "planetary hours meaning"]`
  - 内容：7 大行星时总览，每个行星 1 段摘要 + 链接到 B1 专题
  - 作为 B1 集群的 Pillar Page

#### B4-Calculation

- [ ] **B4-Calc-1**：评估现有 `algorithm-behind-calculator.md` 是否需要补充 "how are planetary hours calculated" 关键词优化
- [ ] **B4-Calc-2**：如果需要，撰写新文章 `src/content/blog/how-planetary-hours-are-calculated.md`（~2000 词）
  - keywords: `["how are planetary hours calculated"]`
  - 或者优化现有文章的 H1/meta/内容以覆盖此关键词

#### B4-Explained

- [ ] **B4-Explained-1**：审查现有 `what-are-planetary-hours.md` 的 H1 和 meta description
- [ ] **B4-Explained-2**：如果当前 title 没有包含 "planetary hours explained"，考虑优化 title/H1
- [ ] **B4-Explained-3**：确保内容覆盖 "what are planetary hours in astrology" 和 "what are the planetary hours of each day" 等 autocomplete 词

#### B4-HowToUse

- [ ] **B4-HowTo-1**：审查现有 `using-planetary-hours.md` 的 H1 和 meta description
- [ ] **B4-HowTo-2**：如果需要，优化 title 以包含 "how to use planetary hours" / "how to work with planetary hours"

#### B4-注册与验证

- [ ] **B4-REG**：新文章注册到 `blogPosts.ts` + 元数据生成 + 构建验证

---

### B-FINAL：Phase B 收尾检查

- [ ] **B-FINAL-1**：运行 `npm run lint` 确保无 lint 错误
- [ ] **B-FINAL-2**：运行 `npm run typecheck` 确保无类型错误
- [ ] **B-FINAL-3**：运行 `npm run build` 确保全部页面正常生成
- [ ] **B-FINAL-4**：检查 sitemap（访问 `/sitemap.xml`）确认所有新文章都被包含
- [ ] **B-FINAL-5**：抽查 3-5 篇文章的 HTML 源码，确认 FAQ Schema / Article Schema / Breadcrumb Schema / OG / Twitter Card 均正确渲染
- [ ] **B-FINAL-6**：统计总文章数，预期从 9 篇增至 ~36 篇
- [ ] **B-FINAL-7**：在 Google Search Console 提交更新后的 sitemap

---

## Phase A：城市程序化 SEO

### A-INFRA：城市页面基础设施

#### A-INFRA-1：城市数据层

- [ ] **A-INFRA-1a**：创建 `src/data/cities.ts`——城市数据定义文件
  - 定义 `City` interface：
    ```
    interface City {
      slug: string;           // URL-friendly: "new-york"
      name: string;           // 显示名: "New York"
      country: string;        // 国家: "USA"
      countryCode: string;    // 国家代码: "US"
      latitude: number;
      longitude: number;
      timezone: string;       // IANA timezone: "America/New_York"
      population?: number;    // 用于排序
      region?: string;        // 洲/区域: "North America"
      description?: string;   // 城市简介（1-2 句）
    }
    ```
- [ ] **A-INFRA-1b**：填充首批 20 个 P0/P1 城市数据（NYC、LA、London、Manila、Johannesburg、Lagos、Athens、Dubai、Sydney、Mumbai、New Delhi、Chicago、Houston、Toronto、Paris、Berlin、Tokyo、Mexico City、São Paulo、Cairo）
  - 每个城市需要精确的经纬度、IANA 时区名、1-2 句独特描述
- [ ] **A-INFRA-1c**：创建 `src/data/cities-extended.ts`——预留 100+ 城市扩展数据（A3 阶段填充）
- [ ] **A-INFRA-1d**：创建 `src/utils/cityHelpers.ts`——城市数据辅助函数
  - `getCityBySlug(slug: string): City | undefined`
  - `getAllCitySlugs(): string[]`
  - `getCitiesByRegion(region: string): City[]`
  - `getNearbyCities(slug: string, limit: number): City[]`

#### A-INFRA-2：城市页面路由

- [ ] **A-INFRA-2a**：创建目录 `src/app/planetary-hours/[city]/`
- [ ] **A-INFRA-2b**：创建 `src/app/planetary-hours/[city]/page.tsx`
  - `generateStaticParams()` — 从 cities 数据生成所有 slug
  - `generateMetadata()` — 动态生成 title/description/canonical/OG
    - title 格式: `Planetary Hours in [City] Today | [Date] | Free Calculator`
    - description 格式: `Find today's planetary hours for [City], [Country]. Sunrise at [time], sunset at [time]. See the current ruling planet and all 24 planetary hours.`
    - canonical: `https://planetaryhours.org/planetary-hours/[city-slug]`
  - 页面组件：Server Component，使用 `PlanetaryHoursCalculator` 服务计算当天数据
- [ ] **A-INFRA-2c**：设置 `dynamicParams = false`（仅允许预定义的城市 slug）
- [ ] **A-INFRA-2d**：设置 `revalidate` 策略——由于行星时按天变化，可设置 `revalidate = 3600`（1 小时）或使用 ISR

#### A-INFRA-3：城市页面 UI 组件

- [ ] **A-INFRA-3a**：创建 `src/components/CityCalculator/CityInfo.tsx`——城市信息卡片
  - 显示：城市名、国家、时区、经纬度、今日日出/日落时间
- [ ] **A-INFRA-3b**：创建 `src/components/CityCalculator/CityHoursList.tsx`——城市行星时列表
  - 复用现有 `HoursList` 组件的逻辑，但简化为服务端渲染版
  - 分为 Daytime Hours 和 Nighttime Hours 两栏
- [ ] **A-INFRA-3c**：创建 `src/components/CityCalculator/CurrentCityHour.tsx`——当前行星时高亮
  - 显示当前是哪个行星时、开始结束时间、goodFor/avoid 属性
- [ ] **A-INFRA-3d**：创建 `src/components/CityCalculator/RelatedCities.tsx`——相关城市推荐
  - 显示同区域 3-5 个城市，链接到各自的城市页面
- [ ] **A-INFRA-3e**：创建 `src/components/CityCalculator/CityFAQ.tsx`——城市专属 FAQ
  - 生成 3-5 个动态 FAQ（FAQ Schema）
  - Q1: When is sunrise in [City] today? → A: Sunrise in [City] today is at [time].
  - Q2: What timezone is [City] in? → A: [City] is in the [timezone] timezone.
  - Q3: What planet rules today in [City]? → A: Today is [Day], ruled by [Planet].
  - Q4: How long is a daytime planetary hour in [City] today? → A: Each daytime hour is approximately [X] minutes today.

#### A-INFRA-4：城市页面 SEO 基础设施

- [ ] **A-INFRA-4a**：在 `src/utils/seo/jsonld.ts` 中创建 `getCityPageSchema()` 函数
  - 返回包含 WebPage + BreadcrumbList 的 Schema
  - 面包屑：Home > Planetary Hours > [City]
- [ ] **A-INFRA-4b**：扩展 `src/types/schema.ts`，如需要添加 `WebPageSchema` 类型
- [ ] **A-INFRA-4c**：在 `src/app/sitemap.ts` 中添加城市页面
  - 从 cities 数据中读取所有 slug
  - 设置 `changeFrequency: "daily"`、`priority: 0.8`
  - lastModified 使用当天日期（因为内容每天变化）

#### A-INFRA-5：导航集成

- [ ] **A-INFRA-5a**：修改 `src/components/Layout/Header.tsx` 的 `HeaderProps` interface
  - 将 `activePage` 类型扩展为 `"calculator" | "about" | "blog" | "cities"`
  - 或者添加可选的 `showCitiesLink?: boolean`
- [ ] **A-INFRA-5b**：在 Header 导航中添加 "Cities" 或 "Locations" 链接
- [ ] **A-INFRA-5c**：创建城市索引页 `src/app/planetary-hours/page.tsx`
  - 展示所有可用城市的分区域列表
  - 可选：添加搜索/筛选功能
  - metadata: "Planetary Hours by City | Free Calculator for [N]+ Cities Worldwide"

---

### A1：首批 20 城市上线（第 9-10 周）

- [ ] **A1-1**：完成 A-INFRA 全部基础设施任务
- [ ] **A1-2**：填充 20 个城市的完整数据到 `src/data/cities.ts`
- [ ] **A1-3**：为每个城市撰写 1-2 句独特描述（不能是模板套用）
  - 示例：New York — "The city that never sleeps experiences dramatic seasonal variations in planetary hour lengths, from 50-minute winter hours to 75-minute summer hours."
  - 示例：Manila — "Located near the equator, Manila enjoys relatively consistent planetary hour lengths throughout the year, with daytime hours staying close to 60 minutes."
- [ ] **A1-4**：运行 `npm run build` 验证 20 个城市页面全部正常生成
- [ ] **A1-5**：抽查 5 个城市页面的 HTML 源码
  - 确认 meta title/description 正确
  - 确认 canonical URL 正确
  - 确认 BreadcrumbList Schema 正确
  - 确认 FAQ Schema 正确（含动态计算的日出日落时间）
  - 确认 OG Image 正确
- [ ] **A1-6**：访问 `/sitemap.xml` 确认 20 个城市页面全部出现
- [ ] **A1-7**：检查城市页面的内链
  - 到首页计算器的 CTA
  - 到相关行星时专题（B1 内容）的链接
  - 到相邻城市的链接

---

### A2：模板优化（第 11 周）

- [ ] **A2-1**：根据 A1 测试反馈优化城市页面模板
- [ ] **A2-2**：城市索引页 `/planetary-hours` 上线
- [ ] **A2-3**：首页添加城市选择入口——在现有 4 个快捷城市按钮下方添加 "View all [N] cities →" 链接
- [ ] **A2-4**：在博客文章底部添加 "Find planetary hours in your city" 模块，链接到城市索引页
- [ ] **A2-5**：在 `next.config.ts` 的 `redirects()` 中添加城市页面的尾斜杠重定向

---

### A3：扩展至 100+ 城市（第 11-13 周）

- [ ] **A3-1**：填充 `src/data/cities-extended.ts` 中的 80+ 城市数据
  - 北美 30 城、欧洲 25 城、亚洲 20 城、南美 10 城、非洲 10 城、大洋洲 5 城
- [ ] **A3-2**：合并 `cities.ts` 和 `cities-extended.ts` 的导出（或改为单一文件）
- [ ] **A3-3**：为每个新城市撰写 1-2 句独特描述
- [ ] **A3-4**：运行 `npm run build` 验证 100+ 页面正常生成（注意构建时间是否合理）
- [ ] **A3-5**：如果构建时间过长，考虑将城市页面改为 `dynamicParams = true` + 按需 ISR

---

### A4：内链网络优化（第 14 周）

- [ ] **A4-1**：在 `src/app/sitemap.ts` 中将城市页面拆分为独立 sitemap 分组（如果总 URL 超过 500）
- [ ] **A4-2**：城市页面底部添加 "Nearby Cities" 推荐模块
- [ ] **A4-3**：博客文章中自然引用城市页面（如："Check the Venus Hour in your city: [New York](/planetary-hours/new-york) | [London](/planetary-hours/london) | [Tokyo](/planetary-hours/tokyo)"）
- [ ] **A4-4**：城市页面到 Phase B 行星时专题的交叉链接
  - 在城市页面的 "Today's Day Ruler" 部分链接到对应的行星日专题
  - 在 "Current Planetary Hour" 部分链接到对应的行星时专题

---

### A-FINAL：Phase A 收尾检查

- [ ] **A-FINAL-1**：运行 `npm run lint` + `npm run typecheck`
- [ ] **A-FINAL-2**：运行 `npm run build` 验证全部城市页面正常
- [ ] **A-FINAL-3**：检查 `/sitemap.xml` 包含所有城市页面
- [ ] **A-FINAL-4**：在 Google Search Console 提交更新后的 sitemap
- [ ] **A-FINAL-5**：统计总页面数，预期 ~150+（36 博客 + 100 城市 + 城市索引 + 原有页面）

---

## Phase C：多语言国际化

### C-INFRA：i18n 基础设施

#### C-INFRA-1：i18n 架构设计

- [ ] **C-INFRA-1a**：选择 i18n 方案——推荐使用 Next.js App Router 的子路径方案（`/es/`、`/pt/`）
  - 方案选项评估：
    - a) `next-intl` 库（最成熟的 App Router i18n 解决方案）
    - b) 自定义 middleware + `[locale]` 路由组
    - c) 独立子路径路由组 `(es)/`
  - 推荐：方案 a (`next-intl`)
- [ ] **C-INFRA-1b**：安装 i18n 依赖（如选择 `next-intl`：`npm install next-intl`）
- [ ] **C-INFRA-1c**：创建 i18n 配置文件 `src/i18n/config.ts`
  - 定义支持的语言列表：`['en', 'es', 'pt']`
  - 定义默认语言：`'en'`
  - 定义语言名称映射：`{ en: 'English', es: 'Español', pt: 'Português' }`

#### C-INFRA-2：翻译文件结构

- [ ] **C-INFRA-2a**：创建翻译文件目录 `src/i18n/messages/`
- [ ] **C-INFRA-2b**：创建英文翻译文件 `src/i18n/messages/en.json`——从现有代码中提取所有 UI 文本
  - 分组：`common`（通用）、`calculator`（计算器）、`header`（导航）、`footer`（页脚）、`planets`（行星名称）、`days`（星期名称）、`seo`（SEO 文本）
  - 包含所有行星名称、星期名称、"Daytime Planetary Hours"、"Nighttime Planetary Hours" 等
- [ ] **C-INFRA-2c**：创建西班牙语翻译文件 `src/i18n/messages/es.json`
- [ ] **C-INFRA-2d**：创建葡萄牙语翻译文件 `src/i18n/messages/pt.json`

#### C-INFRA-3：路由架构改造

- [ ] **C-INFRA-3a**：创建 i18n middleware `src/middleware.ts`（或修改现有）
  - 检测请求 URL 前缀确定语言
  - 默认语言 `en` 不带前缀（保持现有 URL 不变）
  - `/es/` 和 `/pt/` 前缀路由到对应语言版本
- [ ] **C-INFRA-3b**：修改 `src/app/layout.tsx`
  - `<html lang={locale}>` 根据当前语言动态设置
  - 注入 hreflang 标签到 `<head>`
- [ ] **C-INFRA-3c**：创建 hreflang 生成工具 `src/utils/seo/hreflang.ts`
  - 为每个页面生成完整的 hreflang 标签集
  - 包含 `x-default` 指向英文版

#### C-INFRA-4：语言切换组件

- [ ] **C-INFRA-4a**：创建 `src/components/Layout/LanguageSwitcher.tsx`
  - 下拉菜单或旗帜图标选择器
  - 切换时保持当前页面路径不变（只改变语言前缀）
- [ ] **C-INFRA-4b**：在 `src/components/Layout/Header.tsx` 中集成语言切换器
- [ ] **C-INFRA-4c**：在 `src/components/Layout/Footer.tsx` 中添加可用语言链接

#### C-INFRA-5：多语言 Sitemap

- [ ] **C-INFRA-5a**：修改 `src/app/sitemap.ts`，为每个语言版本生成独立的 sitemap 条目
  - 或创建 `src/app/[locale]/sitemap.ts`
- [ ] **C-INFRA-5b**：每个 sitemap 条目包含 `alternates.languages` 字段，列出所有语言版本的 URL

---

### C1：西班牙语版本（第 15-17 周）

#### C1-UI：计算器界面翻译

- [ ] **C1-UI-1**：翻译 `src/i18n/messages/es.json` 中的所有 UI 文本
- [ ] **C1-UI-2**：翻译计算器组件中的所有文本
  - "Daytime Planetary Hours" → "Horas Planetarias Diurnas"
  - "Nighttime Planetary Hours" → "Horas Planetarias Nocturnas"
  - "Current Planetary Hour" → "Hora Planetaria Actual"
  - "Day Ruler" → "Regente del Día"
  - 所有行星名称、星期名称
  - "Good For" / "Avoid" 标签
  - 日期选择器文本
  - 城市名本地化（New York → Nueva York, London → Londres）
- [ ] **C1-UI-3**：翻译 Header / Footer 导航文本
- [ ] **C1-UI-4**：翻译 About 页面内容

#### C1-Content：核心博客内容翻译

- [ ] **C1-Content-1**：翻译 7 篇行星时专题（B1）为西班牙语
  - 放置在 `src/content/blog/es/` 目录（或 `src/content/blog/` 中以 `es-` 前缀命名）
- [ ] **C1-Content-2**：翻译行星日总览 Pillar（B2）
- [ ] **C1-Content-3**：翻译 5 篇最重要的应用场景（love / magic / manifestation / money / marriage）
- [ ] **C1-Content-4**：在西班牙语版 `blogPosts` 中注册翻译后的文章
- [ ] **C1-Content-5**：翻译后的文章需要本地化 keywords（如 "venus hour" → "hora de venus"）

#### C1-Cities：拉美城市页面

- [ ] **C1-Cities-1**：在城市数据中添加 10 个拉美/西班牙城市
  - Ciudad de México, Buenos Aires, Lima, Bogotá, Santiago, Madrid, Barcelona, Caracas, Guadalajara, Medellín
- [ ] **C1-Cities-2**：西班牙语城市页面使用本地化城市名和描述

#### C1-SEO：西班牙语 SEO

- [ ] **C1-SEO-1**：为 `/es/` 路径配置独立的 metadata（西班牙语 title/description）
- [ ] **C1-SEO-2**：确认 hreflang 标签在所有英文和西班牙语页面间正确双向映射
- [ ] **C1-SEO-3**：西班牙语 sitemap 条目生成正确
- [ ] **C1-SEO-4**：在 Google Search Console 中添加西班牙语版本属性

#### C1-验证

- [ ] **C1-BUILD**：运行 `npm run build` 验证全部西班牙语页面正常生成
- [ ] **C1-CHECK**：抽查 5 个西班牙语页面的 HTML 源码验证 SEO 元素

---

### C2：葡萄牙语版本（第 17-19 周）

- [ ] **C2-1**：翻译 `src/i18n/messages/pt.json`
- [ ] **C2-2**：翻译计算器 UI 全部文本为葡萄牙语
- [ ] **C2-3**：翻译 7 篇行星时专题 + 1 篇 Pillar + 5 篇应用场景 = 13 篇内容
- [ ] **C2-4**：添加 5 个巴西/葡萄牙城市（São Paulo, Rio, Brasília, Lisbon, Porto）
- [ ] **C2-5**：配置 `/pt/` 路径 SEO + hreflang
- [ ] **C2-6**：构建验证

---

### C3：菲律宾本地化（第 19-21 周）

- [ ] **C3-1**：评估是否需要完整的菲律宾语翻译，还是英文 + 本地化城市/日期即可
  - 菲律宾用户主要用英文搜索，重点是城市覆盖
- [ ] **C3-2**：添加 10 个菲律宾城市（Manila, Cebu, Davao, Quezon City, Makati, Taguig, Pasig, Caloocan, Zamboanga, Antipolo）
- [ ] **C3-3**：为 `/ph/` 路径创建本地化版本（英文 UI + 菲律宾城市优先展示）
- [ ] **C3-4**：配置 SEO + hreflang
- [ ] **C3-5**：构建验证

---

### C4：评估与决策（第 21-22 周）

- [ ] **C4-1**：分析 C1-C3 的流量数据（Google Search Console）
- [ ] **C4-2**：评估法语版本的 ROI
- [ ] **C4-3**：评估印地语版本的 ROI
- [ ] **C4-4**：根据数据决定下一步语言扩展方向
- [ ] **C4-5**：撰写评估报告

---

### C-FINAL：Phase C 收尾检查

- [ ] **C-FINAL-1**：运行 `npm run lint` + `npm run typecheck`
- [ ] **C-FINAL-2**：运行 `npm run build` 验证全部多语言页面正常
- [ ] **C-FINAL-3**：使用 [hreflang 验证工具](https://technicalseo.com/tools/hreflang/) 检查全站 hreflang 配置
- [ ] **C-FINAL-4**：检查所有语言的 `/sitemap.xml` 包含正确的 URL
- [ ] **C-FINAL-5**：在 Google Search Console 为每个语言提交 sitemap
- [ ] **C-FINAL-6**：统计总页面数，预期 ~400+

---

## 持续优化清单（贯穿全过程）

### 监控与分析

- [ ] **MON-1**：每周检查 Google Search Console 的索引状态，确认新页面被爬取
- [ ] **MON-2**：每两周检查关键词排名变化
- [ ] **MON-3**：每月分析 UV 增长趋势，对比里程碑预期
- [ ] **MON-4**：监控 Core Web Vitals 是否因页面增多而下降

### 技术 SEO 维护

- [ ] **TECH-1**：确保所有新页面的 Lighthouse SEO 分数 ≥ 90
- [ ] **TECH-2**：定期检查死链（broken links）
- [ ] **TECH-3**：确保所有图片都有 alt 标签
- [ ] **TECH-4**：确保所有页面加载时间 < 3 秒

---

_文档创建时间：2026-02-26_
_状态：待执行_
_总任务数：~200+ 细粒度 to-do 项_
