# 🪐 行星时计算器（Planetary Hours Calculator）

> 基于 **Next.js 15 + React 19 + TypeScript 5** 打造的现代化行星时查询工具

本项目将传统的七曜行星时算法与现代 Web 技术结合，提供「精准 · 即时 · 离线可用」的行星时信息。默认城市为纽约，首页通过预计算 JSON 实现 0 CLS 与极速 FMP。

---

## 🎯 项目亮点

| 维度 | 说明 |
|------|------|
| 🚀 性能 | 每日预计算 + Server Components — 首屏不再闪烁，LCP < 1 s |
| 🌍 全球化 | 支持任意经纬度 / 日期，自动时区推断，跨日跨区零误差 |
| 📱 移动友好 | 完全响应式，INP < 200 ms，移动端手势优化 |
| ⚙️ PWA | Service Worker Cache First，离线亦可查看已访问数据 |
| 🔍 SEO | 动态 meta、JSON-LD、Sitemap；Lighthouse SEO 100/100 |
| 💰 AdSense | 生产环境自动加载，开发环境占位，不污染控制台 |
| 🧪 测试 | Vitest 单测 + Playwright E2E，CI 100% 通过 |

---

## 🗺️ 架构概览

```mermaid
flowchart TD
    subgraph "Vercel Cron"
        A[22:00 预计算] -->|写 KV/文件| J((JSON))
        B[23:00 验证] --> J
    end
    J -.Edge Cache / SW Cache.- U[用户浏览器]
    J --> S[CalculatorServer (RSC)] --> C[CalculatorClient]
```

1. **预计算脚本**：每天纽约时间 22:00 生成次日 `ny-YYYY-MM-DD.json`。
2. **验证脚本**：23:00 检测文件是否存在，缺失则补偿计算。
3. **SSR**：`CalculatorServer` 在 RSC 阶段读取 JSON；若缺失则同步计算并回写。
4. **CSR**：默认纽约直接复用 SSR 数据；更换城市/日期时客户端重新计算。
5. **离线**：Service Worker 对 `/precomputed/*.json` 采用 Cache First。

### 📐 日期处理原则

所有行星时计算日期均统一构造为「**目标时区当日 12:00**」，再转换至 UTC 输入 SunCalc，避免因跨时区导致日期漂移。

---

## 📂 目录结构

```text
nextjs/
├── .cursor/
├── .next/                       # Next.js 编译输出（忽略版本控制）
├── docs/                        # 设计文档 & 方案说明
├── node_modules/                # 第三方依赖（忽略版本控制）
├── public/
│   ├── precomputed/             # 预计算 JSON（开发 / CDN 缓存）
│   └── ...                      # 其它静态资源 (icons、images…)
├── scripts/                     # CLI 任务脚本
│   ├── precompute-newyork.ts
│   ├── verify-newyork.ts
│   └── clean-precomputed.ts
├── src/
│   ├── app/                     # App Router 页面 & API
│   │   ├── layout.tsx
│   │   ├── page.tsx
│   │   ├── CalculatorServer.tsx
│   │   ├── globals.css
│   │   └── api/
│   │       └── cron/
│   │           ├── precompute-newyork/route.ts
│   │           ├── verify-newyork/route.ts
│   │           └── revalidate/route.ts
│   ├── components/
│   │   ├── Calculator/
│   │   │   ├── CalculatorClient.tsx
│   │   │   ├── CurrentHourDisplay.tsx
│   │   │   ├── DateTimeInput.tsx
│   │   │   └── EnhancedLocationInput.tsx
│   │   ├── SEO/JsonLd.tsx
│   │   └── … (UI, Layout 等其余组件)
│   ├── hooks/usePlanetaryHours.ts
│   ├── services/PlanetaryHoursCalculator.ts
│   ├── utils/time.ts
│   └── types/
├── tests/                       # Vitest & Playwright
│   ├── __mocks__/
│   ├── unit/
│   │   ├── precompute.spec.ts
│   │   ├── verify.spec.ts
│   │   └── … 其它单测
│   └── e2e/
│       ├── ssr.spec.ts
│       └── … 其它端到端测试
├── .env.local                   # 本地环境变量（不提交）
├── .eslintrc.json               # ESLint 配置
├── .gitignore                   # Git 忽略清单
├── middleware.ts                # Next.js 中间件
├── next.config.ts               # Next.js 全局配置
├── package.json                 # 依赖 & 脚本
├── playwright.config.ts         # Playwright 配置
├── postcss.config.mjs           # PostCSS / LightningCSS 配置
├── tailwind.config.js           # Tailwind v4 配置
├── tsconfig.json                # TypeScript 编译配置
├── vercel.json                  # Vercel 部署配置
└── yarn.lock                    # Yarn 依赖锁
```

---

## ⚙️ 安装与启动

> **⚠️ 必须使用 Yarn**，否则 LightningCSS 原生模块在 Windows 可能报错。

```bash
# 克隆仓库并安装依赖
$ git clone <repo-url> && cd nextjs
$ yarn install

# （可选）本地立即生成纽约 JSON，避免首屏闪烁
$ FORCE_RUN=true yarn precompute:newyork
$ FORCE_RUN=true yarn verify:newyork

# 启动开发服务器
$ yarn dev      # http://localhost:3000
```

如需生产部署，推荐 **Vercel**：连接 GitHub → 配置环境变量 → 自动部署。

---

## 📦 常用脚本

| 命令 | 说明 |
|------|------|
| `yarn dev` | 开发模式启动 |
| `yarn build` / `yarn start` | 生产构建 / 启动 |
| `yarn lint` / `yarn typecheck` | ESLint / TS 严格检查 |
| `yarn test` | 运行所有 Vitest 单测 |
| `npx playwright test` | 运行 E2E 测试（需先 `yarn dev`） |
| `yarn precompute:newyork` | 22:00 NY 预计算脚本 |
| `yarn verify:newyork` | 23:00 NY 验证 & 补偿脚本 |

### Vercel Cron

| 路径 | UTC | 纽约时间 | 任务 |
|------|-----|---------|------|
| `/api/cron/precompute` | 02:00 | 22:00 | 生成次日 JSON |
| `/api/cron/verify` | 03:00 | 23:00 | 校验 / 补偿 |
| `/api/cron/revalidate` | 04:01 | 00:01 | 触发首页 ISR revalidate |

---

## 🧪 测试

```bash
# 单元测试
$ yarn test

# 端到端测试（需本地 dev）
$ npx playwright test
```

CI 流水线：`lint → typecheck → test`，全部通过后才可合并。

---

## 🔑 环境变量示例（`.env.local`）

```ini
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=
NEXT_PUBLIC_SITE_URL=https://planetaryhours.org

# 可选
NEXT_PUBLIC_GA_ID=
NEXT_PUBLIC_GSC_VERIFICATION=
```

---

## 🐛 常见问题

| 问题 | 原因 | 解决方案 |
|------|------|----------|
| `lightningcss.*.node` 丢失 | 使用 npm 安装依赖 | 删除 `node_modules`，确保使用 Yarn 安装依赖 |
| 首页闪烁 / 数据缺失 | KV 未生成 JSON | 手动运行预计算脚本或等待下次定时任务 |
| Hydration mismatch | 开发环境加载 AdSense | 开发模式已用占位符代替，无需处理 |

---

## 🤝 贡献

1. Fork 仓库并创建分支 `feature/<name>`
2. 保持代码/文件/变量命名英文，注释可中文
3. 编写/更新单测 & 文档
4. 确保 `yarn lint && yarn typecheck && yarn test` 全绿后提交 PR

---

## 📄 License

MIT
# 强制触发新部署以清理Vercel Cron Jobs
