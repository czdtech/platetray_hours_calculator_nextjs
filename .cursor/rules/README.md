# Cursor Rules for Planetary Hours Calculator

本目录包含了行星时计算器项目的 Cursor AI 规则，确保 AI 助手能够正确理解和操作项目。

## 规则文件

### 1. `yarn-only.mdc` - Yarn 包管理器规则 ⭐
**最重要的规则**：强制 AI 使用 Yarn 而不是 npm 来管理项目依赖。

**规则类型**：`alwaysApply: true` - 始终应用

**原因**：项目使用 Tailwind CSS v4 + LightningCSS，在 Windows 系统上 npm 存在兼容性问题。

**核心要求**：
- 所有包管理操作必须使用 Yarn
- 禁止使用任何 npm 命令
- 禁止创建或修改 package-lock.json
- 包含命令执行限制

### 2. `command-restrictions.mdc` - 命令执行限制规则 🚫
**新增规则**：限制 AI 自动执行启动命令和长时间运行的进程。

**规则类型**：`alwaysApply: true` - 始终应用

**核心限制**：
- 禁止自动执行 `yarn dev`、`yarn start` 等启动命令
- 要求 AI 提供命令建议，但让用户手动执行
- 允许执行短期、非阻塞的命令（如 `yarn install`、`yarn lint`）

### 3. `tailwind-v4.mdc` - Tailwind CSS v4 配置规则
指导 AI 正确处理 Tailwind CSS v4 的特殊配置和最佳实践。

**规则类型**：`alwaysApply: false` - 自动附加到相关文件

**触发条件**：当处理 CSS、TypeScript、配置文件时自动应用

**关键点**：
- 理解 LightningCSS 引擎的要求
- 正确的配置文件结构
- 性能优化建议
- 故障排除指南

### 4. `project-overview.mdc` - 项目概览规则
提供项目的整体架构和组件结构，帮助 AI 理解项目上下文。

**规则类型**：`alwaysApply: true` - 始终应用

**包含内容**：
- 项目功能和技术栈
- 目录结构说明
- 主要页面和 API 路由
- 开发工作流程

## MDC 格式说明

根据 [Cursor 官方文档](https://docs.cursor.com/context/rules)，所有规则文件都使用 MDC 格式，包含：

```yaml
---
description: 规则描述
globs: ["**/*.ts", "**/*.tsx"]  # 可选：文件匹配模式
alwaysApply: true/false         # 是否始终应用
---

# 规则内容（Markdown 格式）
```

### 规则类型

1. **Always Applied** (`alwaysApply: true`)
   - `yarn-only.mdc` - 包管理规则
   - `command-restrictions.mdc` - 命令限制
   - `project-overview.mdc` - 项目概览

2. **Auto Attached** (`alwaysApply: false` + `globs`)
   - `tailwind-v4.mdc` - 当处理相关文件时自动应用

## 使用说明

这些规则会自动被 Cursor AI 读取，确保：

1. **包管理一致性**：AI 始终使用 Yarn 命令
2. **命令执行控制**：AI 不会自动启动服务器，而是提供指导
3. **配置正确性**：AI 理解 Tailwind CSS v4 的特殊要求
4. **项目理解**：AI 能够正确导航和修改项目文件

## 规则优先级

1. 🚫 **命令限制** - 最高优先级，保护用户的开发环境
2. ⭐ **Yarn 强制** - 确保包管理一致性
3. 📋 **项目概览** - 提供上下文理解
4. 🎨 **Tailwind 配置** - 特定技术栈指导

## 维护

当项目结构或配置发生重大变化时，请更新相应的规则文件，确保 AI 助手始终拥有最新的项目信息。

### 更新指南

- 修改规则内容时，保持 MDC 元数据不变
- 添加新规则时，选择合适的 `alwaysApply` 和 `globs` 设置
- 测试规则是否正确应用：使用 Cursor 的规则管理界面查看状态 