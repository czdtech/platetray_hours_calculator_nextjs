# Planetary Hours Calculator

一个基于Next.js构建的行星时计算器，帮助用户根据地理位置和日期计算行星时，探索古老的占星智慧。

## 🌟 功能特性

- **精确计算**: 基于地理位置和日期的精确行星时计算
- **实时更新**: 当前行星时的实时显示
- **地理定位**: 支持自动地理定位和手动位置输入
- **响应式设计**: 完美适配桌面和移动设备
- **SEO优化**: 完整的搜索引擎优化实现

## 🚀 快速开始

### 安装依赖

```bash
npm install
# 或
yarn install
```

### 开发环境

```bash
npm run dev
# 或
yarn dev
```

在浏览器中打开 [http://localhost:3000](http://localhost:3000) 查看应用。

### 构建生产版本

```bash
npm run build
npm start
```

## 🔧 技术栈

- **框架**: Next.js 15 (App Router)
- **语言**: TypeScript
- **样式**: Tailwind CSS
- **地图服务**: Google Maps API
- **时区处理**: date-fns-tz
- **图标**: Lucide React

## 📈 SEO 功能

本项目实现了完整的SEO优化方案：

### 结构化数据 (JSON-LD)
- **WebSite Schema**: 网站基础信息
- **Article Schema**: 博客文章结构化数据
- **FAQ Schema**: 常见问题结构化数据
- **Breadcrumb Schema**: 面包屑导航

### 元数据管理
- 动态页面标题和描述
- Open Graph 社交媒体优化
- Twitter Card 支持
- Canonical URL 设置

### 技术优化
- 动态 Sitemap 生成
- 图片优化 (WebP/AVIF)
- 安全头配置
- 性能优化

### 使用示例

#### 生成页面元数据
```typescript
import { generatePageMetadata } from '@/utils/seo/metadata';

export const metadata = generatePageMetadata({
  title: '关于我们',
  description: '了解行星时计算器的背景和古老的占星智慧',
  keywords: ['行星时', '占星学', '关于'],
  path: '/about',
});
```

#### 添加结构化数据
```typescript
import { JsonLd } from '@/components/SEO/JsonLd';
import { getArticleSchema } from '@/utils/seo/jsonld';

const articleSchema = getArticleSchema({
  title: '什么是行星时',
  description: '深入了解行星时的概念和应用',
  authorName: '行星时团队',
  datePublished: '2024-01-15',
  url: 'https://planetaryhours.org/blog/what-are-planetary-hours',
});

export default function BlogPost() {
  return (
    <>
      <JsonLd data={articleSchema} />
      {/* 页面内容 */}
    </>
  );
}
```

#### 生成面包屑导航
```typescript
import { Breadcrumb } from '@/components/SEO/Breadcrumb';

const breadcrumbs = [
  { name: '首页', href: '/' },
  { name: '博客', href: '/blog' },
  { name: '什么是行星时', href: '/blog/what-are-planetary-hours' },
];

<Breadcrumb items={breadcrumbs} />
```

## 📁 项目结构

```
src/
├── app/                    # Next.js App Router 页面
├── components/             # React 组件
│   ├── SEO/               # SEO 相关组件
│   ├── Calculator/        # 计算器组件
│   └── Layout/            # 布局组件
├── config/                # 配置文件
│   └── seo.ts            # SEO 配置中心
├── utils/seo/             # SEO 工具函数
│   ├── metadata.ts       # 元数据生成
│   └── jsonld.ts         # JSON-LD 生成
├── types/                 # TypeScript 类型定义
│   └── schema.ts         # Schema.org 类型
└── services/              # 业务逻辑服务
```

## 🌍 环境变量

创建 `.env.local` 文件并添加以下环境变量：

```env
NEXT_PUBLIC_SITE_URL=https://your-domain.com
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=your_google_maps_api_key
```

## 📊 SEO 检查清单

- [x] 类型安全的 Schema.org 实现
- [x] 统一的 SEO 配置管理
- [x] 动态元数据生成
- [x] 结构化数据验证
- [x] 动态 Sitemap 生成
- [x] 图片优化配置
- [x] 安全头设置
- [ ] 性能监控集成

## 🤝 贡献

欢迎提交 Issue 和 Pull Request 来改进项目。

## 📄 许可证

MIT License

---

**注意**: 行星时是传统占星学的一部分，不基于现代科学原理。本工具仅供那些遵循这些传统的用户使用。
