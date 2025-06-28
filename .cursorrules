!!!不要运行npm run dev命令，因为用户已经自己运行了。

## ⚛️ Next.js App Router开发规则

---

Next.js App Router开发 - 英文变量名

目录结构：
- src/app/ 路由目录，page.tsx为页面入口
- src/components/ 可复用组件
- src/lib/ 工具函数和配置
- 需要时再细分：_components/ _hooks/ _utils/

路由文件约定：
- page.tsx - 页面组件
- layout.tsx - 布局组件，自动应用到子路由
- loading.tsx - 加载状态UI
- error.tsx - 错误边界UI
- not-found.tsx - 404页面

组件策略：
- 默认Server Component，获得更好性能和SEO
- 需要交互时添加'use client'指令
- 状态管理：useState够用90%，复杂场景用useContext
- 数据获取：Server用async/await，Client用fetch

文件组织：
- 动态路由：[id]/page.tsx
- 路由组：(group)/不影响URL路径
- 私有文件夹：_folder/不参与路由

布局设计：
- layout.tsx可嵌套，子布局继承父布局
- template.tsx每次导航都重新渲染
- 共享UI放layout，状态重置用template

数据处理：
- Server组件直接async/await获取数据
- 缓存策略：fetch自动缓存，revalidate控制更新
- 表单：简单用useState，复杂用Server Actions

元数据管理：
- 静态：export const metadata = {}
- 动态：export async function generateMetadata()
- 支持嵌套和覆盖

开发顺序：
1. 设计路由结构和layout
2. 实现核心页面组件（Server优先）
3. 添加交互功能（Client组件）
4. 优化加载和错误状态

避免陷阱：
- 不要在Server组件中使用浏览器API
- Client组件会在服务端和客户端都运行
- 避免过度嵌套layout导致复杂化

记住：Server Component优先，Client Component按需，简单架构胜过复杂设计

---

## 🎨 TailwindCSS开发规则

---

TailwindCSS开发 - utility-first方法，中文回复

设计原则：
- 移动端优先：sm: md: lg: xl: 2xl: 响应式断点
- 配置优于硬编码：tailwind.config.js集中管理颜色、字体、间距
- 复制3次再抽象：避免过早@apply，保持utility优势

类名书写顺序：
flex items-center justify-center → w-full h-64 → p-4 m-2 → bg-blue-500 text-white → hover:bg-blue-600

常用模式示例：
- 居中容器：flex items-center justify-center min-h-screen
- 卡片样式：bg-white rounded-lg shadow-sm border p-6 hover:shadow-md
- 响应式网格：grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4
- 按钮基础：px-4 py-2 rounded font-medium transition-colors

避免常见错误：
- 不要混用自定义CSS：保持utility-first纯度
- 不要滥用!important：用高特异性class替代
- 不要忽略响应式：所有布局都要考虑移动端

性能优化：
- 生产环境自动purge，开发时用safelist保留动态类名
- 复杂动画用CSS变量配合Tailwind：--tw-scale-x

记住：utility class优于组件化，重复优于抽象

---

## 🔷 TypeScript开发规则

---

TypeScript开发 - 渐进式类型安全

基础配置：
- 严格模式：strict: true, noImplicitAny: true
- 现代语法：target: "ES2022", module: "ESNext"
- 路径别名：@/* 简化导入

渐进学习路径：
1. 基础类型：string, number, boolean, array
2. 接口定义：interface优于type，除非需要联合类型
3. 函数类型：明确参数和返回值类型
4. 高级特性：工具类型Pick/Omit/Partial按需使用

实用规范：
- 禁用any：特殊情况用unknown，再用类型守卫
- 函数返回类型明确：避免复杂推断歧义
- 用户输入必须验证：类型守卫 + 运行时校验

工具类型使用：
- Pick<User, 'id' | 'name'> 精确提取字段
- Partial<Config> 处理可选配置
- Record<string, unknown> 键值映射

防过度工程化：
- 避免类型体操：可读性优于完美性
- 类型嵌套≤3层：复杂类型拆分定义
- 不要为了类型而类型：实用主义优先

记住：类型安全是工具不是目的，解决问题优于完美类型

---

## 🧩 shadcn/ui开发规则

---

shadcn/ui开发 - 复制控制，简单优先

核心操作：
- 添加组件：npx shadcn-ui@latest add button
- 复制后完全可控：修改 components/ui/ 下的文件
- 保持可访问性：不删除ARIA和键盘导航代码

使用策略：
- 基础组件直接用：Button Input Card等开箱即用
- 复合组件按需改：Dialog Form等可拆分自定义
- 样式修改：编辑组件文件或调整CSS变量

主题配置：
- 颜色：修改globals.css中的CSS变量
- 尺寸：在tailwind.config.js调整spacing
- 暗色模式：next-themes + CSS变量自动切换

常用定制：
- 按钮变体：修改Button组件的variants配置
- 表单样式：调整Input、Label的默认类名
- 卡片阴影：修改Card组件的shadow类

避免陷阱：
- 不要npm安装shadcn组件：失去代码控制
- 不要删除accessibility代码：影响用户体验
- 不要偏离设计系统：保持视觉一致性

记住：复制让你拥有控制权，简单修改胜过复杂配置

---
