# SEO Risk Remediation & PR Review Readiness Plan

## TL;DR
> **Summary**: 以 Blocker 优先策略修复当前分支在多语言导航、blog 路由、语言切换、hreflang 对齐和本地化一致性上的风险，确保进入可交付外部 reviewer 的 PR 审查状态。  
> **Deliverables**:
> - locale-aware 导航与博客链接体系（不再泄漏到 EN）
> - 语言切换防 404 策略（未翻译 slug 的确定性回退）
> - EN/ES/PT article-level alternates 一致性
> - ES/PT 城市页日期本地化一致性
> - 自动化验证与 reviewer 证据包
> **Effort**: Medium  
> **Parallel**: YES - 3 waves  
> **Critical Path**: Task 1 → Task 5 → Task 7 → Task 9 → Task 10

## Context
### Original Request
- 针对每一项不同风险的问题，制定详细的修复计划。

### Interview Summary
- 审查范围：整个分支对 `main` 的全部差异。
- 有意删除文件不纳入本次分析噪音。
- 未勾选 todo 项不纳入本次范围。
- 目标是“可交付给他人 review 的 PR 流程”。
- 当前重点是“审查报告+风险清单”之后的风险修复计划。

### Metis Review (gaps addressed)
- 增加“策略冻结任务”：先固定语言切换与路由回退规则，避免返工。
- 增加“SEO parity gate”：head 与 sitemap 的 alternates 必须一致。
- 增加“证据驱动验收”：禁止“人工点点看”，全部用命令/自动化断言。
- 增加“范围防漂移”：只修复已识别风险，不扩展到未勾选 todo 或新功能。

## Work Objectives
### Core Objective
将已识别风险项（Blocker + Non-blocker）转化为可执行修复任务，并产出可直接给外部 reviewer 使用的 PR 审查证据包。

### Deliverables
- Header/Footer/Blog 共享组件 locale-aware 路由改造。
- LanguageSwitcher 未翻译 slug 回退逻辑落地。
- EN blog article alternates.languages 与已翻译 slug 集合对齐。
- ES/PT 城市页日期/CTA 本地化一致性修复。
- 自动化验证（lint/typecheck/test/build + e2e + SEO parity）。
- reviewer handoff 证据文件（.sisyphus/evidence）。

### Definition of Done (verifiable conditions with commands)
- `npm run lint` 通过（允许现有 warning，不新增 error）。
- `npm run typecheck` 通过。
- `npm run test` 通过。
- `npm run build` 通过，且 `/es/*` `/pt/*` 路由继续静态生成。
- `npm run test:e2e -- --grep "locale|language|blog"` 通过（新增回归用例）。
- `tsx scripts/verify-seo-parity.ts` 生成 0 blocker 报告。

### Must Have
- Blocker 风险全部关闭：
  - locale 导航泄漏
  - ES/PT blog 链接跳 EN
  - language switcher 未翻译 slug 导致 404
- SEO 图一致：article 页面 alternates 与 sitemap 条目一致。
- 每个任务均附带 agent-executed QA 场景与证据路径。

### Must NOT Have (guardrails, AI slop patterns, scope boundaries)
- 不新增未在风险清单中的功能（例如完整新增 /es/privacy、/pt/privacy 页面）。
- 不修改业务算法（PlanetaryHoursCalculator 核心计算）与本次风险无关部分。
- 不以人工口述验收替代自动化证据。
- 不改动 intentionally deleted 的本地记忆/spec 文件。

## Verification Strategy
> ZERO HUMAN INTERVENTION — all verification is agent-executed.
- Test decision: tests-after（Vitest + Playwright + build gate）
- QA policy: Every task has agent-executed scenarios
- Evidence: `.sisyphus/evidence/task-{N}-{slug}.{ext}`

## Execution Strategy
### Parallel Execution Waves
> Target: 5-8 tasks per wave. <3 per wave (except final) = under-splitting.
> Extract shared dependencies as Wave-1 tasks for max parallelism.

Wave 1: 路由策略冻结 + 共享导航/链接组件修复（Task 1-4）  
Wave 2: 语言切换与 SEO/本地化一致性修复（Task 5-8）  
Wave 3: 自动化验证与 reviewer 证据包（Task 9-10）

### Dependency Matrix (full, all tasks)
- Task 1 blocks: Task 2, Task 3, Task 4, Task 5
- Task 2 blocks: Task 10
- Task 3 blocks: Task 10
- Task 4 blocks: Task 6, Task 10
- Task 5 blocks: Task 9, Task 10
- Task 6 blocks: Task 10
- Task 7 blocks: Task 9, Task 10
- Task 8 blocks: Task 10
- Task 9 blocks: Task 10
- Task 10 blocks: Final Verification Wave

### Agent Dispatch Summary (wave → task count → categories)
- Wave 1 → 4 tasks → `unspecified-high`, `quick`
- Wave 2 → 4 tasks → `unspecified-high`, `deep`
- Wave 3 → 2 tasks → `unspecified-high`, `writing`

## TODOs
> Implementation + Test = ONE task. Never separate.
> EVERY task MUST have: Agent Profile + Parallelization + QA Scenarios.
> Note: Tasks are listed by execution wave grouping; follow `Parallelization` + `Blocked By` as source of truth.


- [ ] 9. 建立 SEO parity 自动校验脚本与报告输出

  **What to do**:
  - 新增 `scripts/verify-seo-parity.ts`：
    - 输入：`PLAYWRIGHT_BASE_URL`（默认 `http://localhost:3000`）
    - 采样 URL 集：`/`, `/es`, `/pt`, `/blog/{translated}`, `/blog/{untranslated}`, `/es/blog/{translated}`, `/pt/blog/{translated}`, `/planetary-hours/{city}`, `/es/planetary-hours/{city}`, `/pt/planetary-hours/{city}`
    - 校验项：
      - canonical 存在且与当前 URL 规范匹配
      - hreflang 互链集合正确（根据翻译覆盖策略）
      - sitemap 中同 URL 的 alternates 与 head 一致
  - 输出 JSON 报告到 `.sisyphus/evidence/task-9-seo-parity.json`。

  **Must NOT do**:
  - 不接入付费 SaaS；仅使用仓内脚本与本地服务。
  - 不把检查逻辑散落到多个脚本。

  **Recommended Agent Profile**:
  - Category: `unspecified-high` — Reason: SEO graph gate，合并前关键证据
  - Skills: `[]` — 本地脚本与结构化输出
  - Omitted: `['quick']` — 涉及多维一致性检查

  **Parallelization**: Can Parallel: NO | Wave 3 | Blocks: [10] | Blocked By: [5,6]

  **References** (executor has NO interview context — be exhaustive):
  - Pattern: `src/app/sitemap.ts:69-151,170-244,247-329` — alternates 来源
  - Pattern: `src/utils/seo/hreflang.ts:3-12` — hreflang helper
  - Pattern: `src/app/blog/[slug]/page.tsx:63-89` — EN article metadata
  - Pattern: `src/app/es/blog/[slug]/page.tsx:68-98`, `src/app/pt/blog/[slug]/page.tsx:68-98`

  **Acceptance Criteria** (agent-executable only):
  - [ ] `tsx scripts/verify-seo-parity.ts` 退出码 0。
  - [ ] 报告中 `blockers` 数量为 0，且包含每条 URL 的 canonical/hreflang/sitemap 对照。
  - [ ] 报告文件写入 `.sisyphus/evidence/task-9-seo-parity.json`。

  **QA Scenarios** (MANDATORY — task incomplete without these):
  ```
  Scenario: SEO parity pass after fixes
    Tool: Bash
    Steps: PLAYWRIGHT_BASE_URL=http://localhost:3000 tsx scripts/verify-seo-parity.ts
    Expected: report.blockers === 0 and script exits 0
    Evidence: .sisyphus/evidence/task-9-seo-parity.json

  Scenario: Detect intentional mismatch (guardrail validation)
    Tool: Bash
    Steps: run script against a seeded mismatch fixture in tests/fixtures/seo-parity-mismatch.json
    Expected: script exits non-zero and reports mismatch type/category
    Evidence: .sisyphus/evidence/task-9-seo-parity-error.json
  ```

  **Commit**: YES | Message: `test(seo): add canonical-hreflang-sitemap parity verifier` | Files: `scripts/verify-seo-parity.ts`, `tests/fixtures/*`

- [ ] 10. 生成 PR reviewer handoff 证据包（可直接外部审查）

  **What to do**:
  - 运行并收集门禁输出：
    - `npm run lint`
    - `npm run typecheck`
    - `npm run test`
    - `npm run build`
    - `npm run test:e2e -- --grep "locale|language|blog"`
    - `tsx scripts/verify-seo-parity.ts`
  - 生成 `.sisyphus/evidence/pr-review-handoff.md`，必须包含：
    - 修复前后风险对照（Blocker/Non-blocker）
    - 关键 URL 抽样结果表（status/canonical/hreflang）
    - 失败与已关闭项摘要
    - 建议 reviewer 按 chunk 的审查顺序
  - 在 PR 描述中粘贴“风险关闭证据区块”。
  - 新增完整性校验脚本 `scripts/check-handoff-completeness.ts`，用于验证 handoff 文档必填章节。

  **Must NOT do**:
  - 不以“本地看起来正常”替代证据文件。
  - 不提交含临时调试日志或随机截图命名。

  **Recommended Agent Profile**:
  - Category: `writing` — Reason: 结构化审查交付物
  - Skills: `[]` — 文档聚合 + 命令证据
  - Omitted: `['deep']` — 不涉及新逻辑实现

  **Parallelization**: Can Parallel: NO | Wave 3 | Blocks: [F1-F4] | Blocked By: [2,3,4,5,6,7,8,9]

  **References** (executor has NO interview context — be exhaustive):
  - Process baseline: `docs/seo-todo-list.md`（仅作为已做项背景，不将未勾选项作为本轮范围）
  - Scripts: `package.json:10-24`
  - Review chunk source: `.sisyphus/plans/seo-risk-remediation-pr-review.md` 本文件

  **Acceptance Criteria** (agent-executable only):
  - [ ] 所有门禁命令执行完成并附原始输出。
  - [ ] `pr-review-handoff.md` 包含风险项逐条 closure 状态与证据链接。
  - [ ] reviewer 可仅基于该文档执行审查（无需二次追问路径与策略）。

  **QA Scenarios** (MANDATORY — task incomplete without these):
  ```
  Scenario: Evidence pack generation
    Tool: Bash
    Steps: run all gate commands; append outputs into .sisyphus/evidence/pr-review-handoff.md
    Expected: handoff doc contains command, result, timestamp, and pass/fail summary
    Evidence: .sisyphus/evidence/task-10-handoff.md

  Scenario: Missing evidence fails handoff quality gate
    Tool: Bash
    Steps: run scripts/check-handoff-completeness.ts against handoff document
    Expected: non-zero exit when any mandatory section is missing
    Evidence: .sisyphus/evidence/task-10-handoff-error.txt
  ```

  **Commit**: YES | Message: `docs(review): add pr handoff evidence pack for external reviewers` | Files: `.sisyphus/evidence/*`, `scripts/check-handoff-completeness.ts`

- [ ] 5. 修复 LanguageSwitcher：未翻译 blog slug 切换不再 404

  **What to do**:
  - 重构 `src/components/Layout/LanguageSwitcher.tsx`，改为调用 Task 1 的 `resolveLocaleSwitchPath`。
  - 支持路径分类判定：
    - `/blog/[slug]`：依据 translatedSlugs 判断目标语可达性
    - `/planetary-hours/[city]`：始终可切换（城市全集一致）
    - `/privacy`、`/terms`：按 EN-only 策略处理
    - `/blog/category/[category]`：目标语回退 locale blog index
  - 保留当前 pathname 的 hash（如果存在）并在可达路径下附加。

  **Must NOT do**:
  - 不引入全局 middleware 重写。
  - 不在客户端硬编码第二份 translatedSlugs 字符串常量。

  **Recommended Agent Profile**:
  - Category: `deep` — Reason: 路径语义 + 404 风险 + 回退策略一致性
  - Skills: `[]` — 逻辑复杂度高但不依赖外部库
  - Omitted: `['visual-engineering']` — 非 UI 任务

  **Parallelization**: Can Parallel: NO | Wave 2 | Blocks: [9,10] | Blocked By: [1]

  **References** (executor has NO interview context — be exhaustive):
  - Pattern: `src/components/Layout/LanguageSwitcher.tsx:27-30,51-55` — 现状仅前缀替换
  - Constraint: `src/app/es/blog/[slug]/page.tsx:29,31-35` — dynamicParams=false + 本地目录 static params
  - Constraint: `src/app/pt/blog/[slug]/page.tsx:29,31-35` — 同上
  - Data: `src/data/blogPosts-es.ts:4-18`, `src/data/blogPosts-pt.ts:4-18`

  **Acceptance Criteria** (agent-executable only):
  - [ ] 在 EN 未翻译文章页切换到 ES/PT 时，不出现 404，落在 `/es/blog` 或 `/pt/blog`。
  - [ ] 在已翻译 slug 上切换，落在对应 locale article URL。
  - [ ] 城市页切换保持 city slug 不变（`/planetary-hours/{slug}` 跨语对齐）。

  **QA Scenarios** (MANDATORY — task incomplete without these):
  ```
  Scenario: Language switch on translated blog slug
    Tool: Playwright
    Steps: 1) visit /blog/venus-hour-guide 2) open language switcher 3) select ES
    Expected: URL becomes /es/blog/venus-hour-guide (200)
    Evidence: .sisyphus/evidence/task-5-switcher.json

  Scenario: Language switch on untranslated blog slug
    Tool: Playwright
    Steps: 1) visit /blog/what-are-planetary-hours 2) switch to PT
    Expected: URL becomes /pt/blog (200), not /pt/blog/what-are-planetary-hours (404)
    Evidence: .sisyphus/evidence/task-5-switcher-error.json
  ```

  **Commit**: YES | Message: `fix(i18n): add safe language-switch fallback for untranslated slugs` | Files: `src/components/Layout/LanguageSwitcher.tsx`, `src/i18n/routePolicy.ts`

- [ ] 6. 对齐 EN blog article alternates 与实际翻译覆盖

  **What to do**:
  - 修改 `src/app/blog/[slug]/page.tsx` 的 `generateMetadata()`：
    - canonical 保持 `/${slug}`。
    - 仅当 slug 在 ES/PT translatedSlugs 都存在时，才输出 `alternates.languages`（en/es/pt/x-default）。
  - 新增工具函数（建议）：`src/utils/seo/articleAlternates.ts`，集中判断 slug 可翻译性，避免与 sitemap 分叉。
  - 新增轻量断言脚本 `scripts/assert-head-alternates.ts`，用于单 URL 的 head alternates 校验（供 Task 6 快速回归）。
  - 对齐 `src/app/sitemap.ts` 的 translatedSlugs 来源：使用 ES 与 PT 交集（而不是仅一侧）。

  **Must NOT do**:
  - 不为未翻译 slug 强行输出不存在的 ES/PT alternates。
  - 不改变文章 canonical URL 结构。

  **Recommended Agent Profile**:
  - Category: `unspecified-high` — Reason: SEO graph consistency 高风险
  - Skills: `[]` — 仓内数据与 metadata 收敛
  - Omitted: `['quick']` — 涉及多处一致性，非单点快修

  **Parallelization**: Can Parallel: YES | Wave 2 | Blocks: [9,10] | Blocked By: [4]

  **References** (executor has NO interview context — be exhaustive):
  - Pattern: `src/app/blog/[slug]/page.tsx:66-68` — 当前仅 canonical
  - Pattern: `src/app/es/blog/[slug]/page.tsx:66-74` — 已有 languages
  - Pattern: `src/app/pt/blog/[slug]/page.tsx:66-74` — 已有 languages
  - Pattern: `src/app/sitemap.ts:69-113` — 当前 translatedSlugs 仅来自 ES

  **Acceptance Criteria** (agent-executable only):
  - [ ] 已翻译文章（如 `venus-hour-guide`）在 EN 页渲染 alternates.languages（含 es/pt）。
  - [ ] 未翻译文章（如 `what-are-planetary-hours`）不渲染不存在语言 alternates。
  - [ ] sitemap 与页面 `<head>` alternates 一致（同一 slug 判定规则）。

  **QA Scenarios** (MANDATORY — task incomplete without these):
  ```
  Scenario: Alternates present for translated slug
    Tool: Bash
    Steps: tsx scripts/assert-head-alternates.ts /blog/venus-hour-guide
    Expected: head contains en/es/pt alternates and canonical /blog/venus-hour-guide
    Evidence: .sisyphus/evidence/task-6-alternates.json

  Scenario: Alternates omitted for untranslated slug
    Tool: Bash
    Steps: tsx scripts/assert-head-alternates.ts /blog/what-are-planetary-hours
    Expected: no es/pt alternate links for missing translation; canonical still present
    Evidence: .sisyphus/evidence/task-6-alternates-error.json
  ```

  **Commit**: YES | Message: `fix(seo): align blog alternates with translation coverage` | Files: `src/app/blog/[slug]/page.tsx`, `src/app/sitemap.ts`, `src/utils/seo/articleAlternates.ts`, `scripts/assert-head-alternates.ts`

- [ ] 7. 修复 ES/PT 城市页日期与 CTA 本地化一致性

  **What to do**:
  - 在 `src/app/es/planetary-hours/[city]/page.tsx` 与 `src/app/pt/planetary-hours/[city]/page.tsx`：
    - `dateFormatted` 使用对应 locale（`date-fns/locale/es`、`date-fns/locale/pt-BR`）
    - metadata 的 `today` 同步使用 locale 输出
    - 底部 CTA `href` 从 `/` 改为 `/es` 或 `/pt`
  - 确保不影响 `sunrise/sunset` 的 timezone 计算逻辑。

  **Must NOT do**:
  - 不改动 `planetaryHoursCalculator.calculate` 调用参数。
  - 不修改 city 数据源结构。

  **Recommended Agent Profile**:
  - Category: `quick` — Reason: 明确两文件对称修复
  - Skills: `[]` — 无复杂架构依赖
  - Omitted: `['deep']` — 低复杂度

  **Parallelization**: Can Parallel: YES | Wave 2 | Blocks: [10] | Blocked By: []

  **References** (executor has NO interview context — be exhaustive):
  - Pattern: `src/app/es/planetary-hours/[city]/page.tsx:154,361`
  - Pattern: `src/app/pt/planetary-hours/[city]/page.tsx:154,361`
  - Context: `src/app/es/planetary-hours/[city]/page.tsx:152-155` — sunrise/sunset/date formatting

  **Acceptance Criteria** (agent-executable only):
  - [ ] ES 城市页标题日期显示西语月份/星期；PT 城市页显示葡语月份/星期。
  - [ ] ES/PT 城市页底部 CTA 分别跳 `/es`、`/pt`。
  - [ ] `npm run build` 后 ES/PT 城市页仍保持 SSG + revalidate 1h。

  **QA Scenarios** (MANDATORY — task incomplete without these):
  ```
  Scenario: Localized city date rendering
    Tool: Playwright
    Steps: 1) visit /es/planetary-hours/madrid 2) capture date text; 3) visit /pt/planetary-hours/lisbon 4) capture date text
    Expected: date strings are locale-appropriate (not English month/day)
    Evidence: .sisyphus/evidence/task-7-city-date.json

  Scenario: Localized city CTA target
    Tool: Playwright
    Steps: 1) visit /es/planetary-hours/madrid 2) click "Open Calculator" 3) assert /es; repeat for /pt
    Expected: CTA never sends locale user to /
    Evidence: .sisyphus/evidence/task-7-city-date-error.json
  ```

  **Commit**: YES | Message: `fix(i18n-city): localize date output and calculator CTA paths` | Files: `src/app/es/planetary-hours/[city]/page.tsx`, `src/app/pt/planetary-hours/[city]/page.tsx`

- [ ] 8. 增加 locale 导航与语言切换回归测试

  **What to do**:
  - 新增 Playwright 回归：
    - `tests/e2e/localeNavigation.spec.ts`
    - `tests/e2e/languageSwitcherFallback.spec.ts`
  - 覆盖核心路径：
    - `/es` Header 导航不跳 EN
    - `/pt/blog` 卡片与相关推荐不跳 EN
    - EN 未翻译 slug 切换目标语时回退 index
  - 如需，新增 `tests/unit/blogLinkBuilder.spec.ts` 验证组件默认/locale 路径。

  **Must NOT do**:
  - 不把 e2e 前提写成“手动启动 dev 再人工核对”。
  - 不删除现有 e2e 测试文件。

  **Recommended Agent Profile**:
  - Category: `unspecified-high` — Reason: 回归覆盖多路径风险
  - Skills: [`playwright`] — 路由级验证高适配
  - Omitted: `['artistry']` — 常规测试任务

  **Parallelization**: Can Parallel: YES | Wave 2 | Blocks: [10] | Blocked By: [5,6,7]

  **References** (executor has NO interview context — be exhaustive):
  - Test pattern: `tests/e2e/ssr.spec.ts:8-16`
  - Test pattern: `tests/e2e/locationSelect.spec.ts:4-14`
  - Config: `playwright.config.ts:3-12`

  **Acceptance Criteria** (agent-executable only):
  - [ ] `npm run test:e2e -- --grep "locale|language|blog"` 通过。
  - [ ] 新增用例在 CI/headless 下稳定（连续 2 次运行通过）。
  - [ ] 失败输出包含 URL 断言差异，便于 reviewer 追踪。

  **QA Scenarios** (MANDATORY — task incomplete without these):
  ```
  Scenario: Locale regression suite passes
    Tool: Bash
    Steps: npm run test:e2e -- --grep "locale|language|blog"
    Expected: all newly added locale regression tests pass
    Evidence: .sisyphus/evidence/task-8-locale-tests.txt

  Scenario: Guard against EN link leakage
    Tool: Bash
    Steps: npm run test:e2e -- --grep "does not jump to EN"
    Expected: explicit assertions fail if any URL starts with /blog from /es or /pt pages
    Evidence: .sisyphus/evidence/task-8-locale-tests-error.txt
  ```

  **Commit**: YES | Message: `test(i18n): add locale navigation and switcher fallback regression` | Files: `tests/e2e/*.spec.ts`, `tests/unit/*.spec.ts`


- [ ] 1. 冻结多语言路由策略并建立统一路径策略工具

  **What to do**:
  - 新建 `src/i18n/routePolicy.ts`，集中定义并导出：
    - `getCurrentLocale(pathname)`
    - `stripLocalePrefix(pathname)`
    - `toLocalizedPath(pathname, locale)`
    - `resolveLocaleSwitchPath(currentPath, targetLocale)`（包含 blog slug 存在性判断与回退）
    - `LEGAL_EN_ONLY_PATHS = ['/privacy', '/terms']`
  - 固定回退决策（本计划默认）：
    - blog 文章 slug 在目标语不存在时：回退到 `/{locale}/blog`（en 则 `/blog`）
    - `/privacy`、`/terms` 维持 EN-only，不做 locale 映射
    - `/blog/category/*` 在非 EN locale 切换时回退到 locale blog index
  - 新增 `tests/unit/localeRoutePolicy.spec.ts`，覆盖上述分支。

  **Must NOT do**:
  - 不新增 `/es/privacy`、`/pt/privacy` 等新页面。
  - 不在组件内重复实现第二套路由规则。

  **Recommended Agent Profile**:
  - Category: `unspecified-high` — Reason: 规则中心化 + 多调用方依赖
  - Skills: `[]` — 核心为仓内逻辑收敛
  - Omitted: `['frontend-ui-ux']` — 非视觉设计任务

  **Parallelization**: Can Parallel: NO | Wave 1 | Blocks: [2,3,4,5] | Blocked By: []

  **References** (executor has NO interview context — be exhaustive):
  - Pattern: `src/components/Layout/LanguageSwitcher.tsx:8-30,51-55` — 当前 locale/path 计算逻辑
  - Pattern: `src/i18n/config.ts:1-9` — locale 定义（en/es/pt）
  - Data: `src/data/blogPosts-es.ts:4-18` — ES translatedSlugs
  - Data: `src/data/blogPosts-pt.ts:4-18` — PT translatedSlugs

  **Acceptance Criteria** (agent-executable only):
  - [ ] `npm run test -- tests/unit/localeRoutePolicy.spec.ts` 通过。
  - [ ] 路由策略测试覆盖 8 种路径类型（home/about/blog/blog-slug/city/city-slug/privacy/terms）。
  - [ ] blog 未翻译 slug 切换返回 locale blog index（非 404）。

  **QA Scenarios** (MANDATORY — task incomplete without these):
  ```
  Scenario: Route policy resolves known localized slug
    Tool: Bash
    Steps: npm run test -- tests/unit/localeRoutePolicy.spec.ts --runInBand
    Expected: test output includes pass for "blog slug translated" case
    Evidence: .sisyphus/evidence/task-1-route-policy.txt

  Scenario: Route policy handles untranslated slug fallback
    Tool: Bash
    Steps: npm run test -- tests/unit/localeRoutePolicy.spec.ts --runInBand
    Expected: test output includes pass for fallback to /es/blog and /pt/blog
    Evidence: .sisyphus/evidence/task-1-route-policy-error.txt
  ```

  **Commit**: YES | Message: `fix(i18n): centralize locale route policy and fallback rules` | Files: `src/i18n/routePolicy.ts`, `tests/unit/localeRoutePolicy.spec.ts`

- [ ] 2. 修复 Header locale 泄漏与 FAQ 跳转行为

  **What to do**:
  - 修改 `src/components/Layout/Header.tsx`：
    - `HeaderProps` 新增 `locale?: Locale`（默认 `en`）
    - 全部导航链接由 `toLocalizedPath` 生成（Calculator/Cities/Blog/About）
    - FAQ 锚点路由从硬编码 `/` 改为 locale 首页（`/`, `/es`, `/pt`）
    - 移动端菜单同样使用 locale-aware 链接
  - 更新 ES/PT 页面调用：`<Header activePage="..." locale="es|pt" />`。

  **Must NOT do**:
  - 不改变导航信息架构（菜单项保持不变）。
  - 不改动主题切换、移动菜单动画等无关行为。

  **Recommended Agent Profile**:
  - Category: `unspecified-high` — Reason: 全站导航入口，风险高
  - Skills: `[]` — 以仓内一致性改造为主
  - Omitted: `['artistry']` — 无非常规创意需求

  **Parallelization**: Can Parallel: NO | Wave 1 | Blocks: [10] | Blocked By: [1]

  **References** (executor has NO interview context — be exhaustive):
  - Pattern: `src/components/Layout/Header.tsx:47,56,67,75,85,95,148,156,164,171,178` — 当前硬编码链接位点
  - Usage: `src/app/es/page.tsx:32`, `src/app/pt/page.tsx:32` — locale 页面调用 Header
  - Usage: `src/app/es/blog/page.tsx:50`, `src/app/pt/blog/page.tsx:50` — blog 场景调用

  **Acceptance Criteria** (agent-executable only):
  - [ ] `rg -n 'href="/|router.push\("/"\)' src/components/Layout/Header.tsx` 仅保留允许白名单（logo 可为 locale 根路径变量，不允许硬编码 EN 跳转）。
  - [ ] `/es` 页面点击 Blog 后进入 `/es/blog`；`/pt` 页面点击 About 后进入 `/pt/about`。
  - [ ] FAQ 按钮在 `/es` 与 `/pt` 下均跳转对应 locale 首页并滚动到 `#faq`。

  **QA Scenarios** (MANDATORY — task incomplete without these):
  ```
  Scenario: Locale navigation from ES/PT header
    Tool: Playwright
    Steps: 1) visit /es 2) click nav "Blog" 3) assert URL /es/blog 4) visit /pt 5) click nav "About" 6) assert URL /pt/about
    Expected: No cross-locale jump to /blog or /about without locale prefix
    Evidence: .sisyphus/evidence/task-2-header-nav.json

  Scenario: FAQ anchor navigation under localized pages
    Tool: Playwright
    Steps: 1) visit /es/blog 2) click nav "FAQ" (or open calculator then FAQ) 3) assert URL starts /es and includes #faq behavior
    Expected: Router does not push to EN home
    Evidence: .sisyphus/evidence/task-2-header-nav-error.json
  ```

  **Commit**: YES | Message: `fix(nav): make header links locale-aware and faq-safe` | Files: `src/components/Layout/Header.tsx`, `src/app/**/page.tsx`

- [ ] 3. 修复 Footer locale 泄漏并落实 legal EN-only 回退策略

  **What to do**:
  - 修改 `src/components/Layout/Footer.tsx`：新增 `locale?: Locale`，About 使用 locale 路径，Privacy/Terms 维持 EN-only。
  - 修改 layout 调用：
    - `src/app/layout.tsx` 传 `locale="en"`
    - `src/app/es/layout.tsx` 传 `locale="es"`
    - `src/app/pt/layout.tsx` 传 `locale="pt"`
  - 在 Footer 注释中明确 legal EN-only 是设计决策（避免 reviewer 误判为遗漏）。

  **Must NOT do**:
  - 不新增 legal 页面翻译路由。
  - 不改 Footer 结构与样式层级。

  **Recommended Agent Profile**:
  - Category: `quick` — Reason: 变更集中、可快速闭环
  - Skills: `[]` — 纯仓内路径绑定
  - Omitted: `['deep']` — 不需要深层架构推导

  **Parallelization**: Can Parallel: YES | Wave 1 | Blocks: [10] | Blocked By: [1]

  **References** (executor has NO interview context — be exhaustive):
  - Pattern: `src/components/Layout/Footer.tsx:12,19,27` — 当前硬编码链接
  - Usage: `src/app/layout.tsx:61`, `src/app/es/layout.tsx:52`, `src/app/pt/layout.tsx:52`

  **Acceptance Criteria** (agent-executable only):
  - [ ] `/es` 与 `/pt` 下 Footer 的 About 分别跳转 `/es/about`、`/pt/about`。
  - [ ] Footer Privacy/Terms 始终跳转 `/privacy`、`/terms`（EN-only，非 404）。
  - [ ] `rg -n 'href="/about"' src/components/Layout/Footer.tsx` 无 EN 硬编码残留。

  **QA Scenarios** (MANDATORY — task incomplete without these):
  ```
  Scenario: Footer about link respects locale
    Tool: Playwright
    Steps: 1) visit /es/blog 2) click footer About 3) assert URL /es/about; repeat on /pt/blog -> /pt/about
    Expected: About remains inside current locale
    Evidence: .sisyphus/evidence/task-3-footer-locale.json

  Scenario: Legal links remain EN-only by policy
    Tool: Playwright
    Steps: 1) visit /pt 2) click footer Privacy 3) assert URL /privacy and status 200
    Expected: Explicit EN fallback works and is not broken
    Evidence: .sisyphus/evidence/task-3-footer-locale-error.json
  ```

  **Commit**: YES | Message: `fix(layout): localize footer about links with legal fallback` | Files: `src/components/Layout/Footer.tsx`, `src/app/*/layout.tsx`

- [ ] 4. 修复 Blog 共享组件链接与文案的 locale 泄漏

  **What to do**:
  - 修改组件支持 locale/basePath（并保留 EN 默认）：
    - `src/components/Blog/BlogCategoryFilter.tsx`
    - `src/components/Blog/BlogPostCard.tsx`
    - `src/components/Blog/RelatedArticles.tsx`
    - `src/components/Blog/RelatedPlanetHours.tsx`
    - `src/components/Blog/CalculatorCTA.tsx`
  - 新增 props：
    - `basePath`（如 `/blog`, `/es/blog`, `/pt/blog`）
    - `labels`（`all`, `readMore`, `openCalculator`）
    - `calculatorPath`（`/`, `/es`, `/pt`）
  - 更新调用方：`src/app/es/blog/page.tsx`, `src/app/pt/blog/page.tsx`, `src/app/es|pt/blog/[slug]/page.tsx`。

  **Must NOT do**:
  - 不更改文章数据结构（slug/title/excerpt 结构不动）。
  - 不改变卡片 UI 样式，仅修复链接与文案来源。

  **Recommended Agent Profile**:
  - Category: `unspecified-high` — Reason: 共享组件复用面广，回归面大
  - Skills: `[]` — 组件参数化与调用方联动
  - Omitted: `['frontend-ui-ux']` — 非视觉重构

  **Parallelization**: Can Parallel: YES | Wave 1 | Blocks: [6,10] | Blocked By: [1]

  **References** (executor has NO interview context — be exhaustive):
  - Pattern: `src/components/Blog/BlogCategoryFilter.tsx:61,80,90`
  - Pattern: `src/components/Blog/BlogPostCard.tsx:29,48,56`
  - Pattern: `src/components/Blog/RelatedArticles.tsx:36`
  - Pattern: `src/components/Blog/RelatedPlanetHours.tsx:41`
  - Pattern: `src/components/Blog/CalculatorCTA.tsx:21`
  - Usage: `src/app/es/blog/page.tsx:109`, `src/app/pt/blog/page.tsx:109`
  - Usage: `src/app/es/blog/[slug]/page.tsx:205`, `src/app/pt/blog/[slug]/page.tsx:205`

  **Acceptance Criteria** (agent-executable only):
  - [ ] 在 `/es/blog` 与 `/pt/blog` 点击任意列表卡片均进入对应 locale 文章路径。
  - [ ] `RelatedArticles`、`RelatedPlanetHours` 在 ES/PT 文章页不再跳转 EN。
  - [ ] `rg -n 'href=\{`/blog/\$\{|href="/"' src/components/Blog` 仅保留允许白名单（默认 EN fallback 逻辑必须由 props 驱动）。

  **QA Scenarios** (MANDATORY — task incomplete without these):
  ```
  Scenario: ES/PT blog cards and related links stay in locale
    Tool: Playwright
    Steps: 1) visit /es/blog 2) click first card 3) assert URL starts /es/blog/; 4) click related article 5) assert still /es/blog/
    Expected: No redirect/jump to /blog/*
    Evidence: .sisyphus/evidence/task-4-blog-links.json

  Scenario: Missing locale props fallback remains EN-safe
    Tool: Bash
    Steps: npm run test -- tests/unit/blogLinkBuilder.spec.ts
    Expected: default props produce /blog/* and / paths only in EN tests
    Evidence: .sisyphus/evidence/task-4-blog-links-error.txt
  ```

  **Commit**: YES | Message: `fix(blog): parameterize shared links for locale-safe routing` | Files: `src/components/Blog/*.tsx`, `src/app/es/**`, `src/app/pt/**`


## Final Verification Wave (4 parallel agents, ALL must APPROVE)
- [ ] F1. Plan Compliance Audit — oracle
- [ ] F2. Code Quality Review — unspecified-high
- [ ] F3. Real Manual QA — unspecified-high (+ playwright if UI)
- [ ] F4. Scope Fidelity Check — deep

## Commit Strategy
- Commit A: `fix(i18n-nav): localize header footer and shared link paths`
- Commit B: `fix(i18n-blog): prevent locale switch 404 and align blog routing`
- Commit C: `fix(seo): align alternates parity and localized city date formatting`
- Commit D: `test(seo-i18n): add parity checks and reviewer evidence workflow`

## Success Criteria
- 外部 reviewer 可按 9-chunk 审查，不再被路由/语言泄漏问题阻塞。
- PR 中提供完整证据：命令输出、e2e 结果、SEO parity 报告、关键页面 HTML 抽样。
- merge gate 达标：Blocker=0，Non-blocker 已记录并有处置结论。
