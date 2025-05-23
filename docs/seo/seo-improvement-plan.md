# NextJS项目SEO提升计划

**制定日期**: 2024年12月19日  
**预计完成时间**: 2-3周  
**负责人**: 开发团队

---

## 🎯 总体目标

将项目SEO评分从当前的 **7.6/10** 提升至 **9.0/10**，重点改进类型安全、配置中心化和技术优化。

---

## 📅 分阶段实施计划

### 第一阶段: 代码质量提升 (第1周)
**目标**: 修复类型安全问题，建立SEO配置中心

#### 任务1.1: 类型安全改进 (优先级: 🔴 高)
**预计时间**: 2天

**具体任务**:
1. 创建严格的Schema类型定义
2. 重构JsonLd组件使用类型安全的接口
3. 更新所有相关的工具函数

**实施步骤**:
```typescript
// 1. 创建 src/types/schema.ts
interface SchemaOrgBase {
  '@context': 'https://schema.org';
  '@type': string;
}

interface WebSiteSchema extends SchemaOrgBase {
  '@type': 'WebSite';
  url: string;
  name: string;
  description?: string;
  publisher?: OrganizationSchema;
}

// 2. 更新 JsonLd 组件
export interface JsonLdProps {
  data: SchemaOrgBase | SchemaOrgBase[];
}
```

**验收标准**:
- [ ] 所有Schema类型都有严格的TypeScript定义
- [ ] JsonLd组件不再使用`any`类型
- [ ] 编译时无类型错误
- [ ] 现有功能保持不变

#### 任务1.2: SEO配置中心化 (优先级: 🔴 高)
**预计时间**: 1天

**具体任务**:
1. 创建统一的SEO配置文件
2. 抽取重复的元数据配置
3. 建立可复用的SEO工具函数

**实施步骤**:
```typescript
// 1. 创建 src/config/seo.ts
export const seoConfig = {
  site: {
    name: 'Planetary Hours Calculator',
    url: process.env.NEXT_PUBLIC_SITE_URL || '',
    description: 'Calculate planetary hours based on your location and date.',
    author: 'Planetary Hours Team',
  },
  defaults: {
    title: 'Planetary Hours Calculator',
    titleTemplate: '%s | Planetary Hours Calculator',
    image: '/og-image.jpg',
  },
  social: {
    twitter: '@planetaryhours',
  }
};

// 2. 创建 src/utils/seo/metadata.ts
export function generatePageMetadata(options: PageMetadataOptions): Metadata {
  // 统一的元数据生成逻辑
}
```

**验收标准**:
- [ ] 创建了统一的SEO配置文件
- [ ] 所有页面使用统一的元数据生成函数
- [ ] 减少了重复代码
- [ ] 配置易于维护和更新

#### 任务1.3: 代码重构和清理 (优先级: 🟡 中)
**预计时间**: 1天

**具体任务**:
1. 重构现有页面使用新的SEO配置
2. 统一代码风格和注释
3. 添加必要的文档

---

### 第二阶段: 技术优化 (第2周)
**目标**: 完善Next.js配置，实现动态sitemap

#### 任务2.1: Next.js配置优化 (优先级: 🟡 中)
**预计时间**: 2天

**具体任务**:
1. 配置图片优化
2. 启用压缩和缓存
3. 添加安全头
4. 配置重定向规则

**实施步骤**:
```typescript
// 更新 next.config.ts
const nextConfig: NextConfig = {
  // 图片优化
  images: {
    domains: ['planetaryhours.org'],
    formats: ['image/webp', 'image/avif'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
  },
  
  // 压缩优化
  compress: true,
  poweredByHeader: false,
  
  // 安全头
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block',
          },
        ],
      },
    ];
  },
  
  // 重定向规则
  async redirects() {
    return [
      // 添加必要的重定向
    ];
  },
};
```

**验收标准**:
- [ ] 图片自动优化为WebP/AVIF格式
- [ ] 启用了Gzip压缩
- [ ] 添加了安全头
- [ ] 配置了必要的重定向规则

#### 任务2.2: 动态Sitemap实现 (优先级: 🟡 中)
**预计时间**: 1天

**具体任务**:
1. 创建动态sitemap生成器
2. 集成博客文章自动发现
3. 添加lastmod和priority配置

**实施步骤**:
```typescript
// 创建 src/app/sitemap.ts
import { MetadataRoute } from 'next';
import { blogPosts } from '@/data/blogPosts';

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://planetaryhours.org';
  
  // 静态页面
  const staticPages = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'daily' as const,
      priority: 1,
    },
    // ... 其他静态页面
  ];
  
  // 动态博客页面
  const blogPages = blogPosts.map((post) => ({
    url: `${baseUrl}/blog/${post.slug}`,
    lastModified: new Date(post.date),
    changeFrequency: 'weekly' as const,
    priority: 0.8,
  }));
  
  return [...staticPages, ...blogPages];
}
```

**验收标准**:
- [ ] 删除静态sitemap.xml文件
- [ ] 实现动态sitemap生成
- [ ] 新增博客文章自动包含在sitemap中
- [ ] 正确设置lastModified和priority

#### 任务2.3: 性能监控设置 (优先级: 🟢 低)
**预计时间**: 1天

**具体任务**:
1. 集成Web Vitals监控
2. 添加SEO性能指标追踪
3. 设置自动化SEO检查

---

### 第三阶段: 高级优化 (第3周)
**目标**: 实现高级SEO功能，完善监控体系

#### 任务3.1: 高级Schema实现 (优先级: 🟢 低)
**预计时间**: 2天

**具体任务**:
1. 添加更多Schema类型支持
2. 实现LocalBusiness Schema
3. 添加Review和Rating Schema

#### 任务3.2: SEO测试和验证 (优先级: 🔴 高)
**预计时间**: 2天

**具体任务**:
1. 使用Google Search Console验证
2. 进行Rich Results测试
3. 执行完整的SEO审计

---

## 🛠️ 实施工具和资源

### 开发工具
- **TypeScript**: 类型安全检查
- **ESLint**: 代码质量检查
- **Prettier**: 代码格式化

### SEO验证工具
- **Google Search Console**: 搜索性能监控
- **Google Rich Results Test**: 结构化数据验证
- **Lighthouse**: 性能和SEO审计
- **Schema.org Validator**: Schema验证

### 监控工具
- **Google Analytics**: 流量分析
- **Google Tag Manager**: 标签管理
- **Web Vitals**: 性能指标

---

## 📊 成功指标

### 技术指标
- [ ] TypeScript编译无错误
- [ ] ESLint检查通过
- [ ] Lighthouse SEO评分 > 95
- [ ] Rich Results测试通过率 100%

### 业务指标
- [ ] 搜索引擎收录页面数量增加
- [ ] 有机搜索流量提升
- [ ] 页面加载速度改善
- [ ] 用户体验指标提升

---

## 🚨 风险和缓解措施

### 风险1: 重构过程中破坏现有功能
**缓解措施**:
- 每个任务完成后进行完整测试
- 保持向后兼容性
- 使用Git分支进行开发

### 风险2: 性能优化影响用户体验
**缓解措施**:
- 渐进式优化
- A/B测试验证
- 监控关键指标

### 风险3: SEO配置错误影响搜索排名
**缓解措施**:
- 使用Google Search Console监控
- 分阶段部署
- 保留回滚方案

---

## 📋 检查清单

### 第一阶段完成检查
- [ ] 所有TypeScript类型错误已修复
- [ ] SEO配置已中心化
- [ ] 代码重构完成并测试通过

### 第二阶段完成检查
- [ ] Next.js配置优化完成
- [ ] 动态sitemap正常工作
- [ ] 性能监控已设置

### 第三阶段完成检查
- [ ] 高级Schema功能实现
- [ ] SEO测试全部通过
- [ ] 文档更新完成

---

## 📞 联系和支持

**项目负责人**: 开发团队  
**技术支持**: SEO专家  
**进度汇报**: 每周五下午

**下次评估时间**: 实施完成后1周

---

*此计划将根据实施过程中的实际情况进行调整和优化。*