# ⚠️ 时区转换陷阱：`toZonedTime` 不是"UTC ➜ 目标时区"

> 记录一次真实踩坑，避免后续再犯。

## 背景

项目大量使用 [date-fns-tz](https://github.com/marnusw/date-fns-tz) 做时区格式化/转换。直觉上，我们会想用 `toZonedTime(dateUTC, TZ)` 把 **UTC 时间** 转成 **目标时区的本地时间**。但事实并非如此。

```ts
import { toZonedTime } from 'date-fns-tz';

const utc = new Date('2025-06-15T14:24:00Z');
const ny  = toZonedTime(utc, 'America/New_York');

console.log(utc.toISOString()); // 2025-06-15T14:24:00.000Z
console.log(ny.toISOString());  // 2025-06-15T02:24:00.000Z  ❌ 回跳 12小时
```

原因：`toZonedTime` 假设 **输入时间** 已在 **系统时区**，再把它解释为 *目标时区的本地时间* 并转换到当前时区。因此在服务器（Asia/Shanghai）运行时，`utc` 被当成北京时间 22:24，再映射到纽约 EDT（UTC-4）→ 02:24，导致跨日回跳。

## 正确做法

1. **只做格式化，不做 Date 对象转换**
   ```ts
   import { formatInTimeZone } from 'date-fns-tz';

   const str = formatInTimeZone(utc, 'America/New_York', "yyyy-MM-dd HH:mm:ss");
   // 输出纽约本地时间字符串，可直接展示
   ```

2. **需要 Date 对象时**，先格式化带偏移的 ISO 字符串再 `new Date()`：
   ```ts
   import { formatInTimeZone } from 'date-fns-tz';

   function utcToNY(utc: Date) {
     const iso = formatInTimeZone(utc, 'America/New_York', "yyyy-MM-dd'T'HH:mm:ss.SSSXXX");
     return new Date(iso); // 拿到与 utc 同一时刻的 NY 本地表示
   }
   ```

## 实践中的修复

- `src/utils/time.ts` 实现 `toNewYorkTime` 采用 **格式化 + new Date**。
- `src/services/PlanetaryHoursCalculator.ts` 不再用 `toZonedTime` 生成 `sunriseLocal` 等字段，防止跨日错位。
- `CalculatorServer.tsx` 校验 `requestedDate` 与文件名一致，否则重算。

## Checklist

- [ ] 遇到时区转换需求时，确认数据来源（UTC 还是本地）。
- [ ] **不要**把 `toZonedTime` 用在 *纯 UTC ➜ 目标时区* 场景。
- [ ] 若要转换成 Date 对象，使用 *格式化 +
  `new Date()`* 或 `utcToZonedTime`（没有副作用，需 polyfill 或自行实现）。 