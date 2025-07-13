# 🌲 完整项目目录树

```
platetray_hours_calculator_nextjs/
├── 📋 配置文件
│   ├── next.config.ts              # Next.js 配置
│   ├── vercel.json                 # Vercel 部署配置
│   ├── package.json                # 项目依赖和脚本
│   ├── package-lock.json           # 依赖版本锁定
│   ├── yarn.lock                   # Yarn 依赖锁定
│   ├── tsconfig.json               # TypeScript 配置
│   ├── .eslintrc.json              # ESLint 配置
│   ├── tailwind.config.js          # Tailwind CSS 配置
│   ├── postcss.config.mjs          # PostCSS 配置
│   ├── vitest.config.ts            # Vitest 测试配置
│   ├── playwright.config.ts        # Playwright E2E 配置
│   ├── setupTests.ts               # 测试环境设置
│   ├── middleware.ts               # Next.js 中间件
│   ├── next-env.d.ts               # Next.js 类型定义
│   ├── .gitignore                  # Git 忽略文件
│   └── .cursorrules                # Cursor IDE 规则
│
├── 📝 文档
│   ├── CLAUDE.md                   # AI 助手工作指南
│   ├── LICENSE                     # 开源许可证
│   └── docs/                       # 详细文档目录
│       ├── DEPLOYMENT_FLOW.md      # 部署流程文档
│       ├── PRODUCTION_FIX_GUIDE.md # 生产环境修复指南
│       ├── diagrams-overview.md    # 架构图表概览
│       ├── component-architecture-diagram.md
│       ├── data-flow-diagram.md
│       ├── sequence-diagram.md
│       ├── user-flow-diagram.md
│       ├── logging-system-unified.md
│       ├── timezone-gotcha.md      # 时区处理注意事项
│       └── precompute-ny-ssr-plan-zh.md
│
├── 🛠️ 脚本工具
│   └── scripts/
│       ├── force-precompute-today.ts           # 强制生成当日预计算
│       ├── force-precompute-multiple-days.ts   # 生成多天预计算数据
│       ├── compress-blog-images.ts             # 博客图片压缩
│       └── clean-blog-image-artifacts.ts       # 清理图片缓存
│
├── 🌐 静态资源
│   └── public/
│       ├── precomputed/            # 预计算数据文件
│       │   ├── ny-2025-07-12.json  # 纽约当日预计算数据
│       │   ├── ny-2025-07-13.json  # 纽约明日预计算数据
│       │   ├── ny-2025-07-14.json  # 纽约后日预计算数据
│       │   └── ny-2025-07-15.json  # 纽约未来预计算数据
│       ├── images/                 # 图片资源
│       │   └── blog/               # 博客图片
│       │       ├── algorithm-behind-calculator.{jpg,webp,avif,blur.jpg}
│       │       ├── planetary-hours-intro.{jpg,webp,avif,blur.jpg}
│       │       ├── using-planetary-hours.{jpg,webp,avif,blur.jpg}
│       │       └── what-are-planetary-hours.{jpg,webp,avif,blur.jpg}
│       ├── favicon.ico             # 网站图标
│       ├── favicon-{16x16,32x32}.png
│       ├── apple-touch-icon.png
│       ├── android-chrome-{192x192,512x512}.png
│       ├── android-chrome-512x512-maskable.png
│       ├── og-image.jpg            # Open Graph 图片
│       ├── icon_source.png         # 图标源文件
│       ├── manifest.json           # PWA 清单文件
│       ├── site.webmanifest        # Web 应用清单
│       ├── sw.js                   # Service Worker
│       ├── robots.txt              # 搜索引擎爬虫规则
│       └── ads.txt                 # 广告验证文件
│
├── 💻 源代码
│   └── src/
│       ├── 🏠 应用入口
│       │   └── app/                # Next.js App Router
│       │       ├── layout.tsx      # 根布局组件
│       │       ├── page.tsx        # 首页
│       │       ├── globals.css     # 全局样式
│       │       ├── error.tsx       # 错误页面
│       │       ├── not-found.tsx   # 404 页面
│       │       ├── sitemap.ts      # 站点地图
│       │       ├── CalculatorServer.tsx        # 服务端计算器组件
│       │       ├── CalculatorPageOptimized.tsx # 优化的客户端页面
│       │       ├── about/page.tsx              # 关于页面
│       │       ├── privacy/page.tsx            # 隐私政策
│       │       ├── terms/page.tsx              # 服务条款
│       │       ├── blog/                       # 博客系统
│       │       │   ├── page.tsx                # 博客首页
│       │       │   └── [slug]/                 # 动态博客页面
│       │       │       ├── page.tsx
│       │       │       └── not-found.tsx
│       │       └── api/                        # API 路由
│       │           ├── cron/                   # 定时任务 API
│       │           │   ├── daily-precompute/route.ts    # 每日预计算任务
│       │           │   └── revalidate/route.ts          # 缓存重新验证
│       │           ├── status/                 # 状态检查 API
│       │           │   └── precompute/route.ts          # 预计算状态检查
│       │           ├── manage/                 # 管理工具 API
│       │           │   └── cache/route.ts               # 缓存管理
│       │           ├── health/route.ts         # 健康检查端点
│       │           └── maps/                   # Google Maps API
│       │               ├── autocomplete/route.ts
│       │               ├── geocode/route.ts
│       │               ├── placeDetails/route.ts
│       │               ├── timezone/route.ts
│       │               └── session/start/route.ts
│       │
│       ├── 🧩 组件库
│       │   └── components/
│       │       ├── Calculator/          # 计算器核心组件
│       │       │   ├── CalculatorClient.tsx
│       │       │   ├── CurrentHourDisplay.tsx
│       │       │   ├── DateTimeInput.{tsx,css}
│       │       │   ├── EnhancedLocationInput.tsx
│       │       │   ├── HourItem.tsx
│       │       │   ├── HoursList.tsx
│       │       │   ├── LocationInput.tsx
│       │       │   ├── SuggestionBar.tsx
│       │       │   ├── TimeFormatToggle.tsx
│       │       │   └── WeekNavigation.tsx
│       │       ├── Layout/              # 布局组件
│       │       │   ├── Header.tsx
│       │       │   ├── Footer.tsx
│       │       │   └── OptimizedLink.tsx
│       │       ├── UI/                  # 通用 UI 组件
│       │       │   ├── BackToTop.tsx
│       │       │   ├── EnhancedDatePicker.tsx
│       │       │   ├── ErrorMessage.tsx
│       │       │   ├── NetworkError{,Message}.tsx
│       │       │   ├── PageHero.tsx
│       │       │   └── SkipToContent.tsx
│       │       ├── Performance/         # 性能优化组件
│       │       │   ├── FontOptimizer.tsx
│       │       │   ├── LayoutStabilizer.tsx
│       │       │   ├── LazyLoader.tsx
│       │       │   └── ResourcePreloader.tsx
│       │       ├── Skeleton/            # 骨架屏组件
│       │       │   ├── CurrentHourSkeleton.tsx
│       │       │   └── HoursListSkeleton.tsx
│       │       ├── SEO/                 # SEO 优化组件
│       │       │   ├── Breadcrumb.tsx
│       │       │   └── JsonLd.tsx
│       │       ├── Blog/                # 博客相关组件
│       │       │   ├── ArticleHero.tsx
│       │       │   ├── ArticleLayout.tsx
│       │       │   ├── ArticleMeta.tsx
│       │       │   ├── ArticleShare.tsx
│       │       │   ├── BlogBackToTop.tsx
│       │       │   ├── BlogPostCard.tsx
│       │       │   └── RelatedArticles.tsx
│       │       ├── Analytics/           # 分析追踪组件
│       │       │   ├── AdSense.tsx
│       │       │   ├── Analytics.tsx
│       │       │   └── index.ts
│       │       ├── FAQ/                 # 常见问题组件
│       │       │   └── FAQSection.tsx
│       │       ├── Monitoring/          # 监控组件
│       │       │   └── SimpleMonitoringSetup.tsx
│       │       ├── semantic/            # 语义化组件
│       │       │   ├── Article.tsx
│       │       │   ├── Aside.tsx
│       │       │   └── Section.tsx
│       │       └── CrossDateTestComponent.tsx
│       │
│       ├── 🔧 服务层
│       │   └── services/
│       │       ├── PlanetaryHoursCalculator.ts  # 核心计算引擎
│       │       ├── DateService.ts               # 日期服务
│       │       ├── LocationDateService.ts       # 位置日期服务
│       │       └── TimeZoneService.ts           # 时区服务
│       │
│       ├── 🎣 React Hooks
│       │   └── hooks/
│       │       ├── usePlanetaryHours.ts         # 主要计算 Hook
│       │       ├── useCurrentLivePlanetaryHour.ts
│       │       ├── useUnifiedPlanetaryTime.ts
│       │       ├── usePreciseTimer.ts
│       │       ├── useAdvancedPlanetaryTimeClock.ts
│       │       ├── usePerformanceOptimization.ts
│       │       └── useCrossDateTransition.ts
│       │
│       ├── 🌐 上下文
│       │   └── contexts/
│       │       └── DateContext.tsx              # 日期状态管理
│       │
│       ├── 🛠️ 工具函数
│       │   └── utils/
│       │       ├── time.ts                      # 时间处理工具
│       │       ├── markdown.ts                  # Markdown 处理
│       │       ├── unified-logger.ts            # 统一日志系统
│       │       ├── semantic.ts                  # 语义化工具
│       │       ├── animation.ts                 # 动画工具
│       │       ├── planetaryHourFormatters.ts   # 行星时格式化
│       │       ├── planetaryHourHelpers.ts      # 行星时辅助函数
│       │       ├── performance-{helpers,monitor}.ts
│       │       ├── setup-monitoring.ts
│       │       ├── cache/                       # 缓存工具
│       │       │   ├── dynamicTTL.ts
│       │       │   └── cacheTestUtils.ts
│       │       ├── performance/                 # 性能优化工具
│       │       │   ├── advancedCache.ts
│       │       │   └── cssOptimization.ts
│       │       └── seo/                         # SEO 工具
│       │           ├── metadata.ts
│       │           └── jsonld.ts
│       │
│       ├── 📊 数据层
│       │   ├── data/
│       │   │   ├── blogPosts.ts                 # 博客文章数据
│       │   │   ├── blogDates.json               # 博客日期数据
│       │   │   ├── blogRead.json                # 博客阅读状态
│       │   │   └── staticPageDates.json         # 静态页面日期
│       │   ├── constants/
│       │   │   ├── planetColors.ts              # 行星颜色配置
│       │   │   └── popularCities.ts             # 热门城市数据
│       │   └── content/blog/                    # 博客内容 (Markdown)
│       │       ├── algorithm-behind-calculator.md
│       │       ├── introduction.md
│       │       ├── using-planetary-hours.md
│       │       └── what-are-planetary-hours.md
│       │
│       ├── 🎨 类型定义
│       │   └── types/
│       │       ├── schema.ts                    # 数据结构类型
│       │       └── blog.ts                      # 博客相关类型
│       │
│       └── ⚙️ 配置
│           └── config/
│               ├── seo.ts                       # SEO 配置
│               └── seo-monitoring.ts            # SEO 监控配置
│
└── 🧪 测试
    └── tests/
        ├── unit/                        # 单元测试
        │   ├── phCalculator.spec.ts     # 核心计算器测试
        │   ├── precompute.spec.ts       # 预计算逻辑测试
        │   ├── verify.spec.ts           # 验证逻辑测试
        │   ├── dayRuler.spec.ts         # 日期规则测试
        │   ├── timeUtils.spec.ts        # 时间工具测试
        │   └── highLatitude.spec.ts     # 高纬度边界测试
        ├── e2e/                         # 端到端测试
        │   ├── ssr.spec.ts              # 服务端渲染测试
        │   ├── locationSelect.spec.ts   # 位置选择测试
        │   ├── timeFormat.spec.ts       # 时间格式测试
        │   ├── hourItemToggle.spec.ts   # 时间项切换测试
        │   └── highLatitudeFallback.spec.ts
        ├── getDayRuler.test.ts          # 日期规则独立测试
        └── __mocks__/                   # 测试模拟文件
            └── styleMock.js
```

## 📈 项目规模统计

- **总文件数**: ~180+ 个源文件
- **核心组件**: 30+ 个 React 组件
- **API 路由**: 12 个 API 端点
- **测试文件**: 12 个测试文件
- **工具函数**: 20+ 个工具模块
- **配置文件**: 10+ 个配置文件

## 🏗️ 核心架构实况

### 技术栈现状
- **框架**: Next.js 15 + React 19 + TypeScript 5 + Tailwind CSS v4
- **构建**: Turbopack + LightningCSS + PWA
- **测试**: Vitest (单测) + Playwright (E2E)
- **部署**: Vercel + 自动化预计算系统

### 实际运行模式
**完整的预计算和缓存架构**：

1. **自动化预计算**: Vercel Cron Jobs 每日22:00自动生成未来7天数据
2. **服务端渲染(SSR)**: `CalculatorServer.tsx` 优先加载预计算文件，回退到实时计算
3. **客户端水合**: `CalculatorPageOptimized.tsx` 处理用户交互和动态计算
4. **多层缓存策略**: 预计算文件 + 内存缓存 + 动态TTL缓存

## 🔄 数据流实际架构

```
定时任务(22:00) → 生成预计算数据 → 存储到 public/precomputed/
    ↓
用户请求 → CalculatorServer (SSR)
    ↓
检查预计算文件 → 存在且有效则加载，否则实时计算
    ↓
传递数据给 CalculatorPageOptimized (CSR)
    ↓
用户交互触发重新计算 → PlanetaryHoursCalculator (单例)
    ↓
内存缓存 + 动态TTL缓存 → 渲染显示
```

这是一个结构清晰、分层明确的现代化 Next.js 项目，代码组织遵循最佳实践，具备完整的测试覆盖和性能优化。