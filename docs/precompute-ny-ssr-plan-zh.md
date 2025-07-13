# 行星时计算器 – 纽约预计算与 SSR 升级方案

**部署环境**：Cloudflare DNS + Vercel（边缘网络）

## 主要目标
1. 通过 Server Component 直接输出纽约数据，彻底消除首屏骨架闪烁。
2. **每天纽约当地时间 22:00 预计算第二天的行星时数据；23:00 进行验证，若失败则自动补偿计算，确保数据可用性。**
3. 结果写入持久存储，保证无论冷启动或多实例都无需重复计算。
4. PWA 离线场景仍可在客户端自行计算任意地点/日期。
5. 自动每日刷新，并由 Service Worker 缓存预计算 JSON（⚠️ 需与再验证策略一致，见下文）。

---

## 1️⃣  高级架构图
```mermaid
flowchart TD
    subgraph "定时任务 (Vercel Cron)"
        A[计算任务 22:00 NY] --> B{KV 中是否存在<br>第二天数据?}
        C[验证任务 23:00 NY] --> B
        B -- 存在 --> D[结束]
        B -- 不存在 --> E[执行计算]
    end
    E --> F[ny-YYYYMMDD.json <br> @ Vercel KV]
    F -->|SSR 读取| G[Calculator (RSC)]
    G -->|页面互动| H[Calculator Client]
    H -->|PWA 离线| I[用户]
    F -.Edge Cache/SW .-> I
```

---

## 2️⃣  任务清单
| # | 类别 | 描述 | 负责人 | 状态 |
|---|----------|-------------|-------|--------|
| 1 | **预计算脚本** | 创建 `scripts/precompute-newyork.ts`：<br>• 计算**第二天（today+1）**的行星时（纽约时区）<br>• 结果写入 Vercel KV（开发模式可落到 `public/`） | FE | ✅ |
| 2 | **验证脚本** | 创建 `scripts/verify-newyork.ts`：<br>• 检查第二天数据是否存在于 KV<br>• 若不存在，则调用主计算逻辑进行补偿 | FE | ✅ |
| 3 | **CLI 脚本** | 在 `package.json` 增加 `yarn precompute:newyork` 和 `yarn verify:newyork`，并安装 `ts-node` 等运行依赖 | FE | ✅ |
| 4 | **Vercel Cron** | 在 `vercel.json` 中配置两个任务：<br>• `precompute:newyork`（脚本内判断 22:00）<br>• `verify:newyork`（脚本内判断 23:00） | DevOps | ✅ |
| 5 | **Server Component** | 拆分 `CalculatorPageOptimized`：<br>• `CalculatorServer` 从 KV 读取**当天**数据并渲染<br>• 缺文件时回退即时计算（开发模式） | FE | ✅ |
| 6 | **Client 组件** | `CalculatorClient` 仅处理交互；若地点=纽约且日期=今天直接复用 SSR 数据 | FE | ✅ |
| 7 | **缓存预热** | `CalculatorServer` 读取数据后将结果放入内存缓存，客户端无需重复计算 | FE | ✅ |
| 8 | **再验证** | `export const revalidate = 3600` + `/api/cron/revalidate` (00:01 NY) 按需刷新 | FE | ✅ |
| 9 | **PWA SW** | `next-pwa.js` 中为 `/precomputed/.*\.json` 设 CacheFirst | FE | ✅ |
|10 | **测试** | 为计算和验证脚本编写单元测试；E2E 对比 SSR 输出 | QA | ✅ |

---

## 3️⃣  详细步骤
### 3.1 预计算脚本（`scripts/precompute-newyork.ts`）
```ts
// 核心逻辑
import { addDays } from "date-fns";
import { toZonedTime, formatInTimeZone } from "date-fns-tz";
// ...
export default async function precomputeTask() {
  const nowInNY = toZonedTime(new Date(), "America/New_York");
  // 只在纽约时间 22:00-22:59 之间执行
  if (nowInNY.getHours() !== 22) {
    console.log("Not 22:00 in New York for precomputation. Exiting.");
    return;
  }
  const tomorrow = addDays(nowInNY, 1);
  const tomorrowStr = formatInTimeZone(tomorrow, "America/New_York", "yyyy-MM-dd");
  // ... 调用主计算逻辑，计算 tomorrow 的数据 ...
  await kv.set(`ny-${tomorrowStr}.json`, result);
}
```

### 3.2 验证与补偿脚本（`scripts/verify-newyork.ts`）
```ts
// 核心逻辑
import { addDays } from "date-fns";
import { toZonedTime, formatInTimeZone } from "date-fns-tz";
// ...
export default async function verifyTask() {
  const nowInNY = toZonedTime(new Date(), "America/New_York");
  // 只在纽约时间 23:00-23:59 之间执行
  if (nowInNY.getHours() !== 23) {
    console.log("Not 23:00 in New York for verification. Exiting.");
    return;
  }
  const tomorrow = addDays(nowInNY, 1);
  const tomorrowStr = formatInTimeZone(tomorrow, "America/New_York", "yyyy-MM-dd");
  const data = await kv.get(`ny-${tomorrowStr}.json`);
  if (!data) {
    console.warn(`Data for ${tomorrowStr} not found. Triggering compensation job.`);
    // 直接调用主计算逻辑来补偿
    // await precomputeLogicForDate(tomorrow);
  } else {
    console.log(`Verification successful for ${tomorrowStr}.`);
  }
}
```

### 3.3 Server Component 改造
```tsx
// src/app/page.tsx (RSC)
// ...
export default async function CalculatorServer() {
  const todayStr = formatInTimeZone(new Date(), "America/New_York", "yyyy-MM-dd");
  // ... 读取 KV 中 `ny-${todayStr}.json` 的逻辑 ...
  // ... 缓存预热逻辑 ...
  return <CalculatorClient precomputed={data} />;
}
```
*（其他部分的示例代码，如客户端逻辑、SW缓存、warmCache方法等，在此方案下依然有效，故不重复展示）*

---

## 4️⃣  上线流程
1. 合并脚本与 cron 配置。
2. 部署 Preview，验证 `/precomputed` 文件生成。
3. 打开 Feature Flag，灰度 10%。
4. QA 通过后放量至 100%。
5. 更新文档，关闭 Feature Flag。

---

## 5️⃣  风险与缓解
| 风险 | 影响 | 缓解措施 |
|------|--------|-----------|
| Cron 失败 → 旧数据 | 低 | **23:00 的验证与自动补偿任务可覆盖单次失败。**若两小时任务均失败，则回退客户端计算。 |
| JSON 格式变动 | 高 | 增加版本号，向后兼容解析 |
| JSON 体积过大 | 低 | Gzip 默认启用，控制 <30 KB |
| Vercel KV 不可用 | 中 | 回退到即时计算 + 记录告警 |

---

## 6️⃣  坐标参考
* **纬度** 40.7128
* **经度** -74.0060
* **时区** America/New_York

---

> 文档更新日期：2025-06-14 — 完成 8️⃣ 再验证任务  （已更新任务完成状态） 