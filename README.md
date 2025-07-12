# 🌟 行星时计算器 | Planetary Hours Calculator

一个基于传统占星学的现代化行星时计算器，支持全球任意地点和时间的精确计算。

## ✨ 核心特性

- **🌍 全球支持**: Google Maps API集成，支持世界任意城市
- **📱 PWA应用**: 离线可用，支持安装到设备
- **⚡ 高性能**: Next.js 15 + React 19，SSR首屏优化
- **🎯 精确计算**: 基于真实天文数据的行星时计算
- **🌙 实时更新**: 实时显示当前行星时主宰
- **📚 知识博客**: 内置行星时使用指南和知识分享

## 🛠️ 技术栈

- **前端框架**: Next.js 15 + React 19 + TypeScript 5
- **样式**: Tailwind CSS v4 + LightningCSS
- **PWA**: Serwist (现代Service Worker解决方案)
- **地图API**: Google Maps Platform (Autocomplete + Timezone)
- **测试**: Vitest (单元测试) + Playwright (E2E测试)
- **部署**: Vercel + Cloudflare DNS

## 🚀 快速开始

### 环境要求
- Node.js 18+ 
- Yarn 或 npm

### 安装依赖
```bash
yarn install
# 或
npm install
```

### 环境变量配置
创建 `.env.local` 文件并配置以下变量：
```env
# Google Maps API密钥
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=你的API密钥

# 广告配置（可选）
NEXT_PUBLIC_GOOGLE_ADSENSE_ID=你的AdSense客户端ID
NEXT_PUBLIC_GA_MEASUREMENT_ID=你的Google Analytics ID
```

### 开发运行
```bash
yarn dev
# 或
npm run dev
```

访问 [http://localhost:3000](http://localhost:3000) 查看应用。

## 📖 使用指南

### 基本功能
1. **选择地点**: 使用地址搜索或点击热门城市按钮
2. **选择日期**: 默认当前日期，可手动调整
3. **查看行星时**: 自动计算并显示24小时行星时安排
4. **实时追踪**: 当前行星时会实时高亮显示

### 高级功能
- **时间格式切换**: 支持12小时/24小时制显示
- **PWA安装**: 点击浏览器"安装"按钮添加到桌面
- **离线使用**: 断网情况下仍可计算已访问过的地点
- **博客学习**: 访问 `/blog` 了解行星时的使用方法和历史

## 🧪 测试

### 运行测试
```bash
# 单元测试
yarn test

# E2E测试
yarn test:e2e

# 监视模式
yarn test:watch
```

### 构建验证
```bash
# 类型检查
yarn typecheck

# 代码规范检查
yarn lint

# 生产构建
yarn build
```

## 📁 项目结构

```
src/
├── app/                    # Next.js App Router
│   ├── page.tsx           # 首页计算器
│   ├── blog/              # 知识博客
│   └── api/               # API路由
├── components/             # React组件
│   ├── Calculator/        # 计算器核心组件
│   ├── UI/               # 通用UI组件
│   └── Blog/             # 博客组件
├── services/              # 业务逻辑服务
├── hooks/                 # 自定义React Hooks
├── utils/                 # 工具函数
└── types/                 # TypeScript类型定义
```

## ⚙️ 可用脚本

- `yarn dev` - 启动开发服务器
- `yarn build` - 生产构建
- `yarn start` - 启动生产服务器
- `yarn test` - 运行测试
- `yarn lint` - 代码检查
- `yarn typecheck` - TypeScript类型检查
- `yarn force:precompute-today` - 强制生成当日预计算数据
- `yarn compress:blog-images` - 压缩博客图片
- `yarn clean` - 清理构建缓存

## 🌍 部署

项目已配置为在Vercel上一键部署：

1. Fork本仓库到你的GitHub账户
2. 在Vercel中导入项目
3. 配置环境变量
4. 部署完成！

### 自定义域名
如需使用自定义域名，请在Vercel项目设置中配置，并确保DNS指向Vercel的边缘网络。

## 🔧 自定义配置

### Google Maps API配置
1. 前往 [Google Cloud Console](https://console.cloud.google.com/)
2. 启用以下API：
   - Maps JavaScript API
   - Places API
   - Time Zone API
3. 创建API密钥并设置适当的限制

### PWA配置
PWA配置位于 `public/manifest.json`，可根据需要调整：
- 应用名称和描述
- 图标和启动画面
- 显示模式和主题颜色

## 🤝 贡献指南

欢迎提交Issue和Pull Request！

### 开发流程
1. Fork项目
2. 创建特性分支 (`git checkout -b feature/新特性`)
3. 提交更改 (`git commit -m '添加新特性'`)
4. 推送到分支 (`git push origin feature/新特性`)
5. 创建Pull Request

### 代码规范
- 使用TypeScript编写所有代码
- 遵循ESLint和Prettier配置
- 为新功能添加相应测试
- 确保所有测试通过

## 📄 许可证

本项目采用 [MIT许可证](LICENSE)。

## 🙏 致谢

- [SunCalc](https://github.com/mourner/suncalc) - 天文计算库
- [date-fns](https://date-fns.org/) - 现代化日期处理
- [Next.js](https://nextjs.org/) - React全栈框架
- [Tailwind CSS](https://tailwindcss.com/) - 实用优先的CSS框架

## 📞 联系方式

如有问题或建议，欢迎：
- 提交 [GitHub Issue](../../issues)
- 访问项目主页了解更多信息

---

**享受探索行星时的神秘世界！** 🌟