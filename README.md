# Planetary Hours Calculator

一个基于 Next.js 15 构建的行星时计算器应用，使用 App Router 架构。

## 🚀 最新修复 (2025-01-06)

### AdSense 和 Hydration 错误修复

我们已经修复了以下生产环境问题：

1. **AdSense `data-nscript` 警告**: 
   - 移除了 Next.js `Script` 组件，改用原生 script 标签
   - 避免了 Next.js 自动添加的 `data-nscript` 属性

2. **React Hydration 错误 #418**:
   - 为所有客户端组件添加了 `isMounted` 状态检查
   - 确保服务端和客户端渲染一致性

3. **开发环境优化**:
   - 开发环境跳过 AdSense 加载，避免 403 错误
   - 添加广告位模拟显示，便于开发调试

### 修复的组件

- `src/components/Analytics/AdSense.tsx` - 完全重写，使用原生 script 标签
- `src/components/Analytics/Analytics.tsx` - 添加 hydration 安全检查  
- `src/components/UI/BackToTop.tsx` - 修复客户端挂载问题
- `next.config.ts` - 禁用可能导致 hydration 问题的实验性功能

### 部署后验证

部署到生产环境后，请检查：

1. ✅ 浏览器控制台无 AdSense 警告
2. ✅ 无 React hydration 错误
3. ✅ AdSense 脚本正常加载（生产环境）
4. ✅ 页面交互正常，无 UI 卡顿

---

## 🛠️ 依赖更新 (2025-06-11)

以下依赖已更新至最新稳定版本，并通过 `yarn lint && yarn typecheck && yarn build` 全流程验证均 **0 error / 0 warning**：

| Package | New Version |
|---------|-------------|
| next | 15.3.3 |
| tailwindcss | 4.1.8 |
| @tailwindcss/postcss | 4.1.8 |
| lucide-react | 0.513.0 |
| react-datepicker | 8.4.0 |
| web-vitals | 5.0.2 |

CI 已新增 lint 零警告门禁，确保后续 PR 不引入新警告。

---

## 📋 项目概述

这是一个专业的行星时计算器应用，具备以下核心功能：

- 📍 基于地理位置的精确行星时计算
- 🌍 全球时区支持和自动定位
- 📱 完全响应式设计（桌面端和移动端优化）
- ⚡ PWA 支持，可离线使用
- 🔍 完整的 SEO 优化和结构化数据
- 📊 Google Analytics 和 AdSense 集成
- ♿ 无障碍访问支持（ARIA 标准）

## 🛠️ 技术栈

### 核心技术
- **Next.js 15** - App Router + React Server Components
- **React 19** - 最新的并发特性
- **TypeScript 5** - 严格类型检查
- **Tailwind CSS v4** - 原子化 CSS + LightningCSS

### 工具链
- **Turbopack** - 极速开发构建工具
- **Yarn** - 包管理器（必需，用于 LightningCSS 兼容）
- **ESLint + TypeScript** - 代码质量保证

### 集成服务
- **Google Maps API** - 地理定位和地址搜索
- **Google Analytics** - 用户行为分析
- **Google AdSense** - 广告变现
- **PWA** - 渐进式 Web 应用

## 🏗️ 项目结构

```
src/
├── app/                    # Next.js App Router
│   ├── page.tsx           # 首页 - 行星时计算器
│   ├── layout.tsx         # 根布局
│   ├── globals.css        # 全局样式
│   ├── api/               # API 路由
│   └── [pages]/           # 其他页面
├── components/            # React 组件
│   ├── Calculator/        # 计算器相关组件
│   ├── Analytics/         # 分析和广告组件
│   ├── SEO/              # SEO 优化组件
│   ├── UI/               # 通用 UI 组件
│   └── Layout/           # 布局组件
├── utils/                # 工具函数
├── types/                # TypeScript 类型定义
└── services/             # 业务逻辑服务
```

## 🚀 快速开始

### 环境要求

- Node.js 18.0 或更高版本
- Yarn 包管理器（必需）
- Git

### 安装步骤

1. **克隆项目**
```bash
git clone <repository-url>
cd nextjs
```

2. **安装依赖**
```bash
yarn install
```

3. **环境变量配置**

创建 `.env.local` 文件：
```bash
# Google Maps API (必需)
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=your_google_maps_api_key

# Google Analytics (可选)
NEXT_PUBLIC_GA_ID=your_google_analytics_id

# Google Search Console (可选)
NEXT_PUBLIC_GSC_VERIFICATION=your_gsc_verification_code

# 站点配置
NEXT_PUBLIC_SITE_URL=https://your-domain.com
```

4. **启动开发服务器**
```bash
yarn dev
```

应用将在 http://localhost:3000 启动。

## 📦 可用脚本

```bash
# 开发
yarn dev          # 启动开发服务器 (http://localhost:3000)

# 构建
yarn build        # 构建生产版本
yarn start        # 启动生产服务器

# 代码质量
yarn lint         # ESLint 检查
yarn typecheck    # TypeScript 类型检查

# 清理
yarn clean        # 清理构建缓存
yarn clean:all    # 完全清理（包括 node_modules）
```

## 🎯 开发规范

### 代码规范
- 使用 TypeScript 严格模式
- ESLint 零警告策略（CI 强制 `yarn lint --max-warnings=0`）
- 遵循 ESLint 规则
- 组件采用 PascalCase 命名
- 文件名采用 camelCase
- 所有代码必须使用英文命名

### 组件设计原则
- 单一责任原则
- 可复用性设计
- 组合优于继承
- Props 类型验证

### 性能优化
- 优先使用 Server Components
- 合理使用 Client Components
- 图片优化和懒加载
- 代码分割和动态导入

## 🌐 API 配置

### Google Maps API

项目使用以下 Google Maps API 服务：
- **Places API** - 地址自动完成
- **Geocoding API** - 地址转坐标
- **Time Zone API** - 时区信息

### API 路由

- `GET /api/maps/autocomplete` - 地址自动完成
- `GET /api/maps/geocode` - 地理编码
- `GET /api/maps/placeDetails` - 地点详情
- `GET /api/maps/timezone` - 时区信息

## 🔧 故障排除

### 常见问题

1. **LightningCSS 错误**
   ```
   Error: Cannot find module '../lightningcss.win32-x64-msvc.node'
   ```
   **解决方案**: 必须使用 Yarn 而不是 npm
   ```bash
   rm -rf node_modules package-lock.json
   yarn install
   ```

2. **构建缓存问题**
   ```bash
   yarn clean
   yarn install
   yarn build
   ```

3. **TypeScript 错误**
   ```bash
   yarn typecheck
   ```

4. **开发服务器无法启动**
   - 检查端口 3000 是否被占用
   - 确认 Node.js 版本 >= 18.0
   - 重新安装依赖

### 调试技巧

- 使用 `yarn dev` 启动开发模式，支持热重载
- 检查浏览器控制台错误信息
- 使用 React Developer Tools
- 启用 Next.js 调试模式：`DEBUG=* yarn dev`

## 📊 SEO 优化

### 已实现的 SEO 特性

- ✅ 动态 meta 标签生成
- ✅ Open Graph 和 Twitter Card
- ✅ 结构化数据 (JSON-LD)
- ✅ 语义化 HTML 结构
- ✅ 自动生成 Sitemap
- ✅ Google Search Console 集成
- ✅ Core Web Vitals 优化
- ✅ 移动端友好设计

### 性能指标

- Lighthouse 性能评分: 95+
- Core Web Vitals: 全绿
- SEO 评分: 100
- 可访问性评分: 95+

## 🚀 部署

### Vercel 部署 (推荐)

1. 连接 GitHub 仓库到 Vercel
2. 配置环境变量
3. 自动部署

### 其他平台

项目支持任何支持 Node.js 的部署平台：
- Netlify
- Railway
- Digital Ocean
- AWS
- Google Cloud

### 环境变量设置

生产环境需要设置以下环境变量：
```bash
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=
NEXT_PUBLIC_GA_ID=
NEXT_PUBLIC_GSC_VERIFICATION=
NEXT_PUBLIC_SITE_URL=
```

## 📄 许可证

本项目采用 MIT 许可证。详见 [LICENSE](LICENSE) 文件。

## 🤝 贡献

欢迎提交 Issue 和 Pull Request！

### 贡献流程

1. Fork 项目
2. 创建功能分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 打开 Pull Request

### 开发注意事项

- 遵循现有代码风格
- 添加适当的测试
- 更新相关文档
- 确保 CI 检查通过

---

## 📞 支持

如遇到问题，请通过以下方式寻求帮助：

1. 查看 [故障排除](#-故障排除) 部分
2. 搜索现有 Issues
3. 创建新的 Issue
4. 查看项目文档

---

**Happy Coding! 🎉**
