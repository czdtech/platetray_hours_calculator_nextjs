# Deployment Flow Guide

> 本文档描述了将 Planetary Hours Calculator 推送至远程仓库（GitHub）并由 Vercel 自动更新生产站点前，如何在 **本地** 充分验证以及借助 Preview Deployments / CI Workflow 保障质量。

---

## 1. 本地验证清单

| 步骤 | 命令 | 目的 |
|------|-------|------|
| 1 | `yarn install --immutable` | 确保依赖版本与 `yarn.lock` 完全一致 |
| 2 | `yarn lint` | 运行 ESLint，捕获语法 & 代码规范问题 |
| 3 | `yarn typecheck` | TypeScript 严格模式检查，防止类型错误 |
| 4 | `yarn build` | 产线构建，验证 Next.js 生产编译能否通过 |
| 5 (可选) | `npx vercel build` | 使用 Vercel CLI 在本地生成与云端完全一致的 Serverless / Edge Function 产物 |
| 6 (可选) | `npx vercel deploy --prebuilt` | 上传上一步产物，获得独立 Preview 链接供 Stakeholder 测试 |

> 提示：若 `vercel` CLI 未安装，可执行 `yarn global add vercel` 或 `npm i -g vercel`。但出于 LightningCSS Windows 兼容性，本项目推荐 **局部 npx** 方式。

---

## 2. Git Workflow

1. **Feature Branch**：每项功能 / 修复创建独立分支 `feat/planetary-hours-cron`。
2. **Pull Request**：向 `main` 提交 PR；GitHub 将显示 Vercel 自动触发的 Preview Deployment 以及 GitHub Actions Check（见下）。
3. **Review & QA**：在 PR 页面访问 Vercel Preview URL 进行回归测试。
4. **Merge**：所有 Checks 通过后合并至 `main` → Vercel 触发 Production Deployment。

> 默认设置下，Vercel 会为 GitHub PR 自动创建 Preview。如果未启用：进入 Vercel Project → *Git* → *Automatic Git Integration* 打开对应仓库即可。

---

## 3. 本地 Git Hooks（Husky + lint-staged）

### 3.1 安装
```bash
yarn add -D husky lint-staged
npx husky install
```
在 `package.json` 中添加：
```jsonc
"scripts": {
  "prepare": "husky install"
}
```

### 3.2 配置示例
```bash
# .husky/pre-commit
#!/usr/bin/env sh
. "$(dirname -- "$0")/_/husky.sh"

yarn lint-staged

yarn typecheck --noEmit
```
```bash
# .husky/pre-push
#!/usr/bin/env sh
. "$(dirname -- "$0")/_/husky.sh"

yarn build --no-lint
```
> 说明：`lint-staged` 针对 **变更文件** 自动执行 `eslint --fix` & `prettier --write`，极大加快提交速度。

新增 `lint-staged.config.mjs`：
```js
export default {
  "src/**/*.{ts,tsx,js,jsx}": [
    "eslint --fix",
    "prettier --write"
  ],
  "src/**/*.{css,scss,md,mdx}": "prettier --write"
};
```

---

## 4. GitHub Actions CI

`.github/workflows/ci.yml`：
```yaml
name: CI
on:
  pull_request:
    branches: [ main ]
  push:
    branches: [ main ]

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: 'yarn'
      - run: yarn install --immutable
      - run: yarn lint
      - run: yarn typecheck
      - run: yarn build
      # 可选：运行 Vitest / Jest
      # - run: yarn test --run
```
> **Why Node 20?** Next.js 15 官方要求 Node.js ≥ 18；Vercel 亦默认 Node 20.

Actions 成功后，PR 页面将显示 **✅ Checks passed**；Vercel Preview Build 也会同步报告状态。只有全部绿色才能合并。

---

## 5. 环境变量同步

1. 本地 `.env.local` 与 Vercel Dashboard → *Settings → Environment Variables* 保持一致。
2. **不要**提交 `.env.local`。
3. 若新增环境变量，需同时：
   - 更新 Vercel 环境变量
   - 在 GitHub Actions 中通过 `secrets` 或 `env` 注入（若流程依赖）

---

## 6. 常见故障排除

| 问题 | 排查路径 |
|------|----------|
| 本地 `yarn build` 通过，Vercel 构建失败 | 确认 Node 版本、环境变量、依赖锁是否一致；可在本地 `vercel build` 复现 |
| Preview 与本地表现不同 | 清理浏览器缓存 / 强制刷新；检查 SW 缓存；使用 `vercel env ls` 比对变量 |
| LightningCSS Windows 错误 | 确认仅使用 Yarn；删除 `node_modules`, `yarn.lock`, 重新 `yarn install` |

---

## 7. 小结

- **三重保障**：Git Hooks → GitHub Actions → Vercel Preview，确保问题在进入生产前被捕获。
- **一键验证**：执行脚本 `yarn validate`（可自定义整合 lint, typecheck, build）
- **预览链接**：让非技术同伴也能直接体验最新变更。

> 完。
