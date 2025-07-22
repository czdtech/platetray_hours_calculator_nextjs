# 🌅 Planetary Hours Calculator

一个基于 Next.js 的现代行星时计算器，提供精确的行星时间计算和实时更新功能。

## ✨ 功能特性

- 🌍 **全球城市支持** - 内置热门城市数据，支持自定义坐标
- ⏰ **实时行星时** - 自动检测当前行星时，60秒精确更新
- 🌅 **日夜分离** - 清晰展示白天和夜间行星时
- 📱 **响应式设计** - 完美适配桌面和移动设备
- 🕐 **双时间格式** - 支持12小时制和24小时制切换
- 📅 **日期选择** - 支持查看任意日期的行星时
- 🚀 **高性能优化** - Core Web Vitals 优化，LCP < 900ms

## 🛠️ 技术栈

- **框架**: Next.js 14 (App Router)
- **样式**: TailwindCSS + shadcn/ui
- **语言**: TypeScript
- **部署**: Vercel
- **性能**: 优化至 Core Web Vitals 绿色指标

## 🚀 快速开始

### 环境要求

- Node.js 18+
- npm 或 yarn

### 安装依赖

```bash
npm install
# 或
yarn install
```

### 启动开发服务器

```bash
npm run dev
# 或
yarn dev
```

访问 [http://localhost:3000](http://localhost:3000) 查看应用。

### 构建生产版本

```bash
npm run build
npm start
```

## 📁 项目结构

```
src/
├── app/                    # Next.js App Router 页面
├── components/            # 可复用 UI 组件
├── hooks/                # 自定义 React Hooks
├── services/             # 业务逻辑服务
├── utils/                # 工具函数和配置
└── lib/                  # 第三方库配置
```

### 核心模块

- **PlanetaryHoursCalculator** - 行星时计算核心引擎
- **TimeZoneService** - 时区处理和验证服务
- **usePlanetaryHours** - 行星时数据管理 Hook
- **useCurrentLivePlanetaryHour** - 实时行星时更新 Hook

## 🎯 核心概念

### 行星时 (Planetary Hours)

行星时是古代占星学中将一天24小时按行星分配的时间系统：

- **白天行星时**: 从日出到日落，分为12个不等长时段
- **夜间行星时**: 从日落到次日日出，分为12个不等长时段
- **行星顺序**: 土星 → 木星 → 火星 → 太阳 → 金星 → 水星 → 月亮

### 计算原理

1. 获取指定地点的日出日落时间
2. 将白天和夜间分别等分为12段
3. 按行星顺序分配每个时段
4. 实时检测当前所处的行星时

## ⚡ 性能优化

### 已优化项目

- **Core Web Vitals 优化**
  - LCP: 888ms (优秀)
  - FCP: 464ms (优秀)
  - CLS: 0.0 (完美)

- **渲染性能**
  - 移除不必要的重计算依赖
  - 实现智能缓存策略
  - 优化时间同步机制

- **开发体验**
  - 简化监控系统，避免开发环境性能影响
  - 减少内存检查频率
  - 优化日志输出

## 🌐 部署

### Vercel 部署 (推荐)

1. 连接 GitHub 仓库到 Vercel
2. 自动检测 Next.js 项目配置
3. 一键部署，支持自动更新

### 其他平台

支持任何 Node.js 环境的部署平台：

- Netlify
- Railway
- DigitalOcean App Platform
- 自建服务器

## 🔧 配置选项

### 环境变量

```env
# 可选：启用开发环境性能监控
NEXT_PUBLIC_ENABLE_PERF_MONITORING=true

# 可选：Google Analytics 跟踪
NEXT_PUBLIC_GA_ID=GA_TRACKING_ID
```

### 自定义设置

- 修改 `src/data/cities.ts` 添加更多城市
- 调整 `tailwind.config.js` 自定义主题
- 编辑 `src/utils/constants.ts` 修改默认配置

## 🤝 贡献指南

欢迎提交 Issue 和 Pull Request！

### 开发规范

- 使用 TypeScript 严格模式
- 遵循 Next.js App Router 最佳实践
- 保持组件单一职责原则
- 添加适当的错误处理和日志

### 提交代码

1. Fork 项目
2. 创建功能分支: `git checkout -b feature/amazing-feature`
3. 提交更改: `git commit -m 'Add amazing feature'`
4. 推送分支: `git push origin feature/amazing-feature`
5. 创建 Pull Request

## 📄 许可证

本项目采用 MIT 许可证 - 查看 [LICENSE](LICENSE) 文件了解详情。

## 🙏 致谢

- 感谢 [SunCalc](https://github.com/mourner/suncalc) 提供日出日落计算
- 感谢 [shadcn/ui](https://ui.shadcn.com/) 提供优秀的 UI 组件
- 感谢所有贡献者和用户的支持

---

**🌟 如果这个项目对你有帮助，请考虑给个 Star！**