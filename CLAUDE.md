# AI Assistant Development Guide

此文件为 AI 助手（Claude、GitHub Copilot 等）在此代码库中工作时提供特定指导。

## 🤖 AI 助手工作指南

### 基本原则
- **使用中文回复**：始终使用中文进行交流和文档编写
- **参考主文档**：详细的项目信息请参考 [README.md](./README.md)
- **架构图参考**：系统架构和流程请参考 [docs/diagrams-overview.md](./docs/diagrams-overview.md)

### 快速命令参考
```bash
# 开发
yarn dev              # 启动开发服务器
yarn build            # 生产构建
yarn test             # 运行测试

# 预计算（核心功能）
yarn precompute:newyork    # 生成纽约预计算数据
FORCE_RUN=true yarn precompute:newyork  # 强制运行
```

## 🏗️ 架构关键点

### 时区处理原则（重要！）
```typescript
// ✅ 正确：使用目标时区正午作为基准
const localDateString = formatInTimeZone(date, timezone, "yyyy-MM-dd");
const noonStringInTimezone = `${localDateString}T12:00:00`;
const baseDateForSunCalc = fromZonedTime(noonStringInTimezone, timezone);

// ❌ 错误：避免在已转换的日期上再次转换
// const wrongDate = toZonedTime(baseDateForSunCalc, timezone); // 会导致日期偏移
```

### 核心组件职责
- **CalculatorServer.tsx**：SSR，加载预计算数据
- **CalculatorPageOptimized.tsx**：主客户端组件，用户交互
- **PlanetaryHoursCalculator.ts**：核心计算引擎（单例模式）

### 缓存策略层级
1. 内存缓存（PlanetaryHoursCalculator）
2. 预计算JSON文件（public/precomputed/）
3. Vercel KV存储（生产环境）
4. Service Worker缓存（离线支持）

## 🛠️ 开发调试工具

### 浏览器控制台可用
```javascript
// 清理所有缓存
window.clearAllCaches?.()

// 访问计算器实例
window.planetaryHoursCalculator?.getCacheStats()
window.planetaryHoursCalculator?.clearCache()
```

### 测试用例覆盖
- 时区跨越计算（`tests/unit/timezone-edge-cases.spec.ts`）
- 预计算逻辑（`tests/unit/precompute.spec.ts`）
- SSR渲染（`tests/e2e/ssr.spec.ts`）

## 📝 代码约定

### 命名规范
- **文件/变量**：英文，语义化命名
- **注释**：中文，详细说明复杂逻辑
- **组件**：PascalCase，功能明确

### 关键路径
```
src/
├── app/                    # Next.js App Router
├── components/             # UI组件，按功能分组
├── services/               # 业务逻辑服务
├── hooks/                  # 自定义React Hooks
├── utils/                  # 纯工具函数
└── types/                  # TypeScript类型定义
```

## ⚡ 性能要求

### Web Vitals 目标
- **LCP** < 1秒（通过预计算实现）
- **CLS** = 0（SSR避免布局偏移）
- **INP** < 200ms（优化交互响应）

### 关键性能策略
- 预计算纽约数据（每日22:00）
- SSR水合避免首屏闪烁
- Service Worker离线缓存
- 懒加载非关键组件

---

**详细信息请参考：**
- 📖 [README.md](./README.md) - 完整项目文档
- 📊 [docs/diagrams-overview.md](./docs/diagrams-overview.md) - 架构图表
- 🚀 [docs/DEPLOYMENT_FLOW.md](./docs/DEPLOYMENT_FLOW.md) - 部署流程
