# 美化的日历组件

本项目包含两个美化的日历组件，使用项目的设计语言重新设计，提供更好的用户体验。

## 组件概览

### 1. DateTimeInput (改进版)
基于 `react-datepicker` 的增强版本，保持原有功能的同时美化了视觉效果。

**特性：**
- 🎨 现代化设计风格
- 🌙 暗色模式支持
- ⚡ 平滑过渡动画
- 🎯 紫色主题色彩
- 📱 响应式设计
- ⌨️ 快捷选择按钮

### 2. EnhancedDatePicker (全新版)
完全自定义的日历组件，提供更丰富的交互体验。

**特性：**
- 🎨 完全自定义设计
- ⌨️ 键盘导航支持
- 🚀 快捷日期选择
- 🎯 悬停状态反馈
- 🌙 完整暗色模式
- 📍 时区显示
- 🎪 动画效果

## 使用方法

### DateTimeInput

```tsx
import { DateTimeInput } from "@/components/Calculator/DateTimeInput";
import { useState } from "react";

function MyComponent() {
  const [selectedDate, setSelectedDate] = useState(new Date());

  return (
    <DateTimeInput
      defaultDate={format(selectedDate, "MMMM d, yyyy")}
      onDateChange={setSelectedDate}
      selectedDate={selectedDate}
    />
  );
}
```

### EnhancedDatePicker

```tsx
import { EnhancedDatePicker } from "@/components/UI/EnhancedDatePicker";
import { useState } from "react";

function MyComponent() {
  const [selectedDate, setSelectedDate] = useState(new Date());

  return (
    <EnhancedDatePicker
      selectedDate={selectedDate}
      onDateChange={setSelectedDate}
      timezone="Asia/Shanghai"
      label="选择日期"
      placeholder="点击选择日期..."
    />
  );
}
```

## 键盘快捷键

| 按键 | 功能 |
|------|------|
| `←` | 前一天 |
| `→` | 后一天 |
| `↑` | 上一周 |
| `↓` | 下一周 |
| `Enter` | 确认选择 |
| `Esc` | 关闭日历 |

## 样式定制

### CSS 变量
组件使用 Tailwind CSS 类名，可以通过修改 `tailwind.config.js` 来定制颜色：

```js
// tailwind.config.js
module.exports = {
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#f5f3ff',
          500: '#8b5cf6',
          600: '#7c3aed',
          // ...
        }
      }
    }
  }
}
```

### 自定义样式
DateTimeInput 组件包含自定义 CSS 文件 `DateTimeInput.css`，可以直接修改样式：

```css
/* 自定义日历容器 */
.react-datepicker {
  border-radius: 12px;
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1);
  /* ... */
}
```

## 设计原则

### 视觉层次
- 使用阴影和圆角创建深度感
- 紫色作为主要强调色
- 灰色系作为中性色调
- 适当的留白和间距

### 交互反馈
- 悬停状态变化
- 焦点状态指示
- 选中状态突出
- 平滑的过渡动画

### 可访问性
- 键盘导航支持
- 语义化 HTML 结构
- 适当的 ARIA 标签
- 高对比度颜色

## 演示页面

访问 `/calendar-demo` 页面查看组件的完整演示和使用说明。

## 依赖项

- `react-datepicker`: 日历基础功能
- `date-fns`: 日期处理工具
- `lucide-react`: 图标库
- `tailwindcss`: 样式框架

## 浏览器支持

- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

## 更新日志

### v1.0.0
- 初始版本发布
- 基础日历功能
- 美化的视觉设计

### v1.1.0
- 添加键盘导航
- 增强的交互体验
- 暗色模式支持

### v1.2.0
- 快捷选择功能
- 时区显示
- 响应式优化