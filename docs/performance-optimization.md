# 性能优化指南

## 📊 当前性能问题分析

基于Slow 4G网络下的性能测试结果：

| 指标 | 当前值 | 目标值 | 状态 |
|------|--------|--------|------|
| TTFB | 5277ms | <800ms | 🔴 需要优化 |
| FCP | 5400ms | <1800ms | 🔴 需要优化 |
| LCP | 5400ms | <2500ms | 🔴 需要优化 |
| CLS | 0.228 | <0.1 | 🟡 接近目标 |

## 🚀 优化策略

### 1. 立即优化（开发环境）

#### A. 使用优化版本的计算器页面
```typescript
// 在 src/app/page.tsx 中替换
import CalculatorPageOptimized from "./CalculatorPageOptimized";

export default function HomePage() {
  return (
    <>
      <Header activePage="calculator" />
      <CalculatorPageOptimized />
    </>
  );
}
```

#### B. 启用开发环境优化
```bash
# 使用优化的开发命令
npm run dev:fast
```

### 2. 组件懒加载优化

#### 已实现的懒加载组件：
- `WeekNavigation` - 周导航组件
- `HoursList` - 行星时列表
- `TimeFormatToggle` - 时间格式切换
- `FAQSection` - FAQ部分

#### 延迟加载策略：
- 核心功能立即加载（位置输入、日期选择、当前行星时）
- 高级功能延迟1秒加载
- FAQ部分最后加载

### 3. 网络优化

#### 减少初始请求：
```typescript
// 优化API调用
const fetchTimezone = async () => {
  // 添加请求缓存
  const cacheKey = `timezone_${coordinates.latitude}_${coordinates.longitude}`;
  const cached = sessionStorage.getItem(cacheKey);
  
  if (cached) {
    const data = JSON.parse(cached);
    setTimezone(data.timeZoneId);
    return;
  }
  
  // 原有请求逻辑...
};
```

### 4. 图片和资源优化

#### Next.js图片优化：
```typescript
// next.config.ts 中的优化配置
images: {
  formats: ['image/webp', 'image/avif'],
  deviceSizes: [640, 750, 828, 1080, 1200, 1920],
  minimumCacheTTL: 60 * 60 * 24 * 30, // 30天缓存
}
```

### 5. 代码分割优化

#### 动态导入：
```typescript
// 使用动态导入减少初始包大小
const HeavyComponent = dynamic(() => import('./HeavyComponent'), {
  loading: () => <Skeleton />,
  ssr: false // 如果不需要SSR
});
```

## 🛠️ 实施步骤

### 第一步：立即优化（5分钟）
1. 替换首页使用 `CalculatorPageOptimized`
2. 使用 `npm run dev:fast` 启动开发服务器

### 第二步：测试优化效果（10分钟）
1. 清除浏览器缓存
2. 在Slow 4G网络下重新测试
3. 观察性能监控面板的变化

### 第三步：进一步优化（30分钟）
1. 添加API请求缓存
2. 优化图片资源
3. 实施代码分割

## 📈 预期改善效果

### 开发环境优化后预期：
- **TTFB**: 5277ms → 2000ms (减少60%)
- **FCP**: 5400ms → 2500ms (减少55%)
- **LCP**: 5400ms → 3000ms (减少45%)
- **CLS**: 0.228 → 0.1 (减少55%)

### 生产环境优化后预期：
- **TTFB**: < 800ms
- **FCP**: < 1800ms
- **LCP**: < 2500ms
- **CLS**: < 0.1

## 🔍 性能监控

### 使用内置性能监控：
1. 开发环境自动显示性能面板
2. 实时监控Core Web Vitals
3. 性能建议自动生成

### 使用Lighthouse审计：
```bash
# 运行性能审计
npm run perf:audit
```

## 📋 检查清单

- [ ] 替换为优化版本的计算器页面
- [ ] 测试懒加载组件是否正常工作
- [ ] 验证性能监控面板显示
- [ ] 在Slow 4G下重新测试性能
- [ ] 检查控制台是否有错误
- [ ] 验证所有功能正常工作

## 🚨 注意事项

1. **开发环境 vs 生产环境**：
   - 开发环境性能通常比生产环境差
   - 生产环境有更多优化（压缩、缓存等）

2. **网络条件**：
   - Slow 4G是极端测试条件
   - 实际用户网络条件通常更好

3. **渐进式优化**：
   - 先优化关键路径
   - 再优化次要功能
   - 保持功能完整性

## 📞 问题排查

如果优化后性能仍然不理想：

1. 检查网络请求瀑布图
2. 分析JavaScript执行时间
3. 检查是否有内存泄漏
4. 验证缓存策略是否生效