# Planetary Hours Calculator

一个基于 Next.js 构建的行星时计算器，帮助用户根据地理位置和日期计算行星时，探索古老的占星智慧。在线网站 [https://planetaryhours.org](https://planetaryhours.org) 。

## 🌟 功能特性

- **精确计算**: 基于用户提供的地理位置（经纬度）和日期，利用 `suncalc` 库精确计算日出日落时间，并结合 `date-fns-tz` 进行精确的时区处理，从而划分出12个昼间行星时和12个夜间行星时。
- **实时当前小时**: 动态显示当前所处的行星时，通过 `useCurrentLivePlanetaryHour` Hook 每分钟自动更新，并能正确处理日出前的跨天夜间时段。
- **地理位置服务**: 支持自动地理定位（通过浏览器API）和手动地址输入。手动输入时，通过后端 API 代理（`/api/maps/*`）调用 Google Maps API 进行地址自动完成、地理编码和时区查询。
- **灵活的时间格式**: 支持12小时制和24小时制显示。
- **响应式设计**: 完美适配桌面和移动设备。
- **PWA 支持**: 通过 `next-pwa` 实现渐进式Web应用功能，提供离线体验和可安装性。
- **SEO 优化**: 包含动态元数据、结构化数据 (JSON-LD)、动态 Sitemap 等。
- **性能优化**: 采用多种策略，包括客户端计算去重、结果缓存、代码分割、图片和字体优化等。

## 🚀 快速开始

### ⚠️ 重要提示：使用 Yarn 而不是 npm/pnpm

**本项目使用 Tailwind CSS v4，它依赖 LightningCSS 引擎。在 Windows 系统上，npm 处理 LightningCSS 的原生二进制模块时存在兼容性问题，可能导致构建失败。强烈建议使用 Yarn。**

如果使用 npm 遇到类似 `Error: Cannot find module '../lightningcss.win32-x64-msvc.node'` 的错误，请切换到 Yarn。

### 解决方案：

1.  **安装 Yarn**（如果尚未安装）：
    ```bash
    npm install -g yarn
    ```
2.  **删除现有的 npm 依赖**（如果之前使用了 npm）：
    ```bash
    rm -rf node_modules package-lock.json
    ```

### 安装依赖

```bash
yarn install
```

### 开发环境

项目使用 Turbopack 进行快速开发：
```bash
yarn dev
```
在浏览器中打开 [http://localhost:3000](http://localhost:3000) 查看应用。

### 构建生产版本

```bash
yarn build
yarn start
```

### 其他常用命令

```bash
# 代码检查
yarn lint

# 类型检查
yarn typecheck

# 清理缓存 (构建缓存和 node_modules 缓存)
yarn clean

# 完全清理并重新安装依赖
yarn clean:all
```

## 🔧 技术栈

- **框架**: Next.js 15.3.2 (App Router, Turbopack for development)
- **UI 库**: React 19
- **语言**: TypeScript 5
- **样式**: Tailwind CSS v4 (使用 `@tailwindcss/postcss`，依赖 LightningCSS)
- **包管理**: Yarn (必需)
- **核心计算库**:
    - `suncalc@1.9.0`: 用于精确计算日出、日落等太阳位置数据。
    - `date-fns@4.1.0` & `date-fns-tz@3.2.0`: 用于强大的日期、时间操作和时区处理。
- **地理服务**: Google Maps API (通过后端 API 代理)
- **图标**: `lucide-react@0.511.0`
- **PWA**: `next-pwa@5.6.0`
- **其他**: `lodash`, `gray-matter` (Markdown处理), `remark` (Markdown解析) 等。

## 🏗️ 核心架构与工作原理

本项目采用模块化的设计，核心功能围绕行星时的精确计算和用户友好的展示。

### 1. 项目结构概览 (关键目录)

```
src/
├── app/                    # Next.js App Router: 页面、布局、API路由
│   ├── page.tsx           # 应用程序主入口和计算器界面
│   └── api/               # 后端 API 路由
│       └── maps/          # 代理 Google Maps API 请求 (地理编码, 时区等)
├── components/             # React UI 组件
│   └── Calculator/        # 核心计算器界面组件 (位置输入, 日期选择, 小时列表)
├── services/               # 核心业务逻辑服务
│   └── PlanetaryHoursCalculator.ts # 行星时计算引擎
├── hooks/                  # 自定义 React Hooks
│   ├── usePlanetaryHours.ts       # 管理计算参数、触发计算、处理结果和状态
│   └── useCurrentLivePlanetaryHour.ts # 实时确定和更新当前活动的行星时
├── utils/                  # 通用工具函数
│   └── planetaryHourFormatters.ts # 格式化行星时数据以便显示
├── types/                  # TypeScript 类型定义
└── ...                     # 其他支持性目录 (config, contexts, constants, content, public)
```

### 2. 核心计算逻辑 (`src/services/PlanetaryHoursCalculator.ts`)

这是行星时计算的核心引擎，其工作流程如下：
- **输入**: 用户指定的日期、经纬度、时区和可选的海拔高度。
- **时区校正**: 为了精确计算，输入日期会先转换为目标时区的正午12点，然后再转换为UTC时间，作为 `suncalc` 库的计算基准。这一步对于正确处理夏令时和时区边界至关重要。
- **日出日落计算**: 使用 `suncalc.getTimes()` 获取指定日期和地点的日出 (sunrise) 和日落 (sunset) 的UTC时间，同时也会计算次日的日出时间以确定夜晚的结束。
- **时长计算**:
    - 白昼总时长 = `sunset` - `sunrise`
    - 夜晚总时长 = `nextSunrise` - `sunset`
- **行星时划分**:
    - 将白昼总时长和夜晚总时长分别均分为12段，得到每个昼间行星时和夜间行星时的精确时长。
    - 根据迦勒底行星顺序 (`PLANETARY_ORDER`常量) 和当日主宰行星 (`DAY_RULERS`常量，通过 `getDay()` 获取)，从日出时刻开始，依次为24个行星时分配其主宰行星。
- **属性附加**: 为每个计算出的行星时附加预定义的吉凶宜忌等属性信息 (`PLANET_ATTRIBUTES`常量)。
- **输出**: 返回一个包含当日所有行星时详细信息（开始/结束UTC时间、主宰行星、类型、时长、属性等）的 `PlanetaryHoursCalculationResult` 对象。
- **辅助方法**: 包含 `getCurrentHour()` 方法，用于在已计算的结果中根据给定的UTC时间查找当前活动的行星时。

### 3. 前端数据流与状态管理 (React Hooks)

前端逻辑主要由两个核心 Hooks驱动：

- **`src/hooks/usePlanetaryHours.ts`**:
    - **职责**: 作为UI组件与计算服务之间的桥梁。它接收用户输入（位置、日期、时区），管理计算的加载和错误状态，调用计算服务，并存储原始计算结果 (`planetaryHoursRaw`)。
    - **功能**:
        - 使用 `TimeZoneService` 验证输入时区的有效性。
        - 实现客户端级别的计算请求去重，避免对相同参数的重复计算。
        - 使用 `useMemo` 和自定义的 `memoize` 工具对格式化后的昼夜行星时列表进行缓存，优化UI渲染性能。
        - 调用 `useCurrentLivePlanetaryHour` Hook 来获取并展示实时的当前行星时。
    - **输出**: 向UI组件提供计算结果、当前小时、加载/错误状态以及一个 `calculate` 函数来触发新的计算。

- **`src/hooks/useCurrentLivePlanetaryHour.ts`**:
    - **职责**: 根据 `usePlanetaryHours` 提供的原始计算数据和当前的UTC时间，动态地确定并格式化当前正处于活动状态的行星时。
    - **功能**:
        - 通过 `setInterval` 实现每分钟自动检查和更新当前行星时。
        - **核心逻辑**:
            1.  首先尝试在当前 `planetaryHoursRaw` 数据中直接查找与当前时间匹配的行星时。
            2.  **日出前处理**: 如果当前时间早于当日日出，则判定当前可能处于前一天的夜间时段。此时，Hook会尝试获取或计算**前一天**对应地理位置的行星时数据（此过程包含针对前一天数据的内存缓存 `yesterdayCache` 和并发请求去重 `pendingRequests` 机制），并从中找出当前活动的行星时。
        - 使用 `formatSingleHour` 工具函数将最终确定的当前行星时对象格式化为适合UI显示的字符串。

**数据流概要**:
用户输入 -> UI组件 -> `usePlanetaryHours.calculate()` -> `PlanetaryHoursCalculator.service.calculate()` -> 计算结果 -> `usePlanetaryHours`状态更新 -> `useCurrentLivePlanetaryHour`计算实时小时 -> UI组件渲染。

## 🌍 环境变量

创建 `.env.local` 文件并添加以下环境变量：

```env
# 基础配置
NEXT_PUBLIC_SITE_URL=https://planetaryhours.org # 替换为您的站点URL
GOOGLE_MAPS_API_KEY=your_google_maps_api_key # 您的Google Maps API密钥

# 可选配置 (用于Google Analytics)
NEXT_PUBLIC_GA_ID=your_google_analytics_id
```
请根据您的实际部署情况修改 `NEXT_PUBLIC_SITE_URL` 和 `GOOGLE_MAPS_API_KEY`。

## ⚡ 性能优化

本项目关注性能，并实施了多项优化措施：
- **Turbopack**: Next.js 开发模式下使用，提升构建和热更新速度。
- **代码分割**: Next.js 自动进行代码分割，按需加载。
- **客户端计算去重**: `usePlanetaryHours` Hook 避免对相同参数的重复计算。
- **结果缓存**:
    - `usePlanetaryHours` 使用 `useMemo` 和自定义 `memoize` 缓存格式化后的行星时列表。
    - `useCurrentLivePlanetaryHour` 对前一天的计算结果进行内存缓存。
- **PWA 缓存**: 利用 Service Worker 缓存应用外壳和静态资源。
- **图片和字体优化**: (具体实现需在代码中进一步确认，但通常是Next.js项目的一部分)
- **Web Vitals**: 集成了 `web-vitals` 库进行性能监控。

## 📈 SEO 功能

项目考虑了搜索引擎优化：
- **动态元数据**: 通过 Next.js 的 `metadata` API 或类似机制为每个页面生成动态的标题、描述和关键词。
- **结构化数据 (JSON-LD)**: 可能通过 `src/components/SEO/JsonLd.tsx` 和 `src/utils/seo/jsonld.ts` 实现，为搜索引擎提供更丰富的页面信息（如文章、FAQ、面包屑等）。
- **动态 Sitemap**: `src/app/sitemap.ts` 表明项目会动态生成 `sitemap.xml`。
- **Open Graph 和 Twitter Cards**: 支持社交媒体分享预览。
- **其他**: Canonical URL, 语义化HTML标签等。

(具体SEO实现细节和覆盖范围建议查阅 `src/utils/seo/` 和 `src/components/SEO/` 下的代码。)

## 🚀 部署指南

(此部分基本沿用原README，因为部署流程通常比较稳定)

### 部署前检查清单
#### 环境配置
- [ ] 确认 `.env.production` (或相应环境文件) 配置正确
- [ ] 设置 `NEXT_PUBLIC_SITE_URL` 为生产环境URL
- [ ] 配置生产环境的 Google Maps API Key
#### 代码质量检查
- [ ] 运行 `yarn lint` 无错误
- [ ] 运行 `yarn typecheck` 无类型错误
- [ ] 运行 `yarn build` 构建成功
#### 功能测试
- [ ] 地理定位功能正常
- [ ] 行星时计算准确
- [ ] 响应式设计正常
- [ ] SEO 元数据正确
#### 性能验证
- [ ] 首屏加载时间符合预期
- [ ] Core Web Vitals 达标
- [ ] 缓存系统工作正常

### 部署后验证
#### 基础功能
- [ ] 网站可正常访问
- [ ] 所有页面加载正常
- [ ] API 端点响应正常
#### SEO 验证
- [ ] 页面标题和描述正确
- [ ] 结构化数据验证通过 (使用 Google's Rich Results Test 等工具)
- [ ] `sitemap.xml` 可访问且内容正确
- [ ] `robots.txt` 配置正确
#### 性能验证
- [ ] 浏览器控制台无错误
- [ ] 页面加载速度正常
- [ ] 移动端体验良好

## 🔧 故障排除

### LightningCSS 兼容性问题 (Windows)
**问题描述**: 在 Windows 系统上使用 npm 构建项目时出现 `Error: Cannot find module '../lightningcss.win32-x64-msvc.node'`。
**原因**: Tailwind CSS v4 使用 LightningCSS，其原生模块在 Windows 上与 npm 存在兼容性问题。
**解决方案**: **强制使用 Yarn**。
   ```bash
   # 1. 安装 Yarn (如果未安装)
   npm install -g yarn
   # 2. 清理 npm 依赖 (如果之前用了 npm)
   rm -rf node_modules package-lock.json
   # 3. 使用 Yarn 安装和运行
   yarn install
   yarn dev / yarn build
   ```
   如果问题依旧，请确保已安装 Microsoft Visual C++ Redistributable (x64 版本)。

### 其他常见问题
- **构建缓存问题**: 运行 `yarn clean` 或 `yarn clean:all`。
- **TypeScript 类型错误**: 运行 `yarn typecheck` 查看具体错误。

## 🤝 贡献

欢迎提交 Issue 和 Pull Request 来改进项目。
- **请务必使用 Yarn**。
- 在提交前运行 `yarn lint` 和 `yarn typecheck`。
- 遵循现有代码风格和架构。

## 📄 许可证

GPLv3 License

---
**注意**: 行星时是传统占星学的一部分，不基于现代科学原理。本工具仅供那些遵循这些传统的用户使用。

## 🎉 更新日志

### 最新更新

#### v2.0.0 - 生产优化版本
- ✅ 移除所有开发专用文件和依赖
- ✅ 清理无用的脚本和配置
- ✅ 优化项目结构，准备生产部署
- ✅ 精简依赖包，提升性能

#### v1.3.0 - 性能优化
- ✅ 实施高级缓存系统
- ✅ 组件性能优化
- ✅ 资源预加载优化
- ✅ PWA 缓存策略优化

---
**项目已基于最新代码分析更新文档，旨在提供准确的项目理解。** 🚀
