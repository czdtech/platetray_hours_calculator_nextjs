# 🌗 CurrentHourDisplay 渲染判定规则

记录"当前行星时"卡片何时显示 / 隐藏的决策树，避免未来修改 UI 时误改逻辑。

---

## 判定目标
| 场景 | 是否显示 `Current Planetary Hour` 卡片 | 说明 |
|------|--------------------------------------|------|
| **今天** & 已过日出 | ✅ | 正常实时小时 |
| **今天** & 日出前（夜段，属于昨日行星时） | ❌ | 仅显示 Day Ruler + before-sunrise 提示 |
| **昨天**（含凌晨跨夜段） | ✅ | 显示昨夜实时小时，高亮于列表 |
| **更早过去日期** | ❌ | Day Ruler + past-date 说明 |
| **未来任何日期** | ❌ | Day Ruler + future-date 说明 |

> *行星日* 以 **日出到次日日出** 为界，因此今日日出前仍计入昨日行星日，故 UI 选择"今天"时不应显示实时小时；而切到"昨天"则需要高亮昨夜时段。

---

## 关键布尔量
| 变量 | 计算方式 | 意义 |
|-------|----------|------|
| `currentHour` | `useCurrentLivePlanetaryHour` 产出 | 当前时段（可能为 null） |
| `isSelectedDateToday` | 选中日期 == 今日？ | 今日视图判断 |
| `isSelectedDateFuture` | 选中日期 > 今日？ | 未来视图判断 |
| `_isSameDate` | 行星时数据日期 == 选中日期？ | 是否跨夜  |
| `isPreSunrise` | `isSelectedDateToday && (beforeSunrise or isBeforeSunrise)` | 今日清晨日出前 |
| `shouldShowPreSunriseMessage` | `!_isSameDate || isPreSunrise` | 显示夜段提示 |

---

## 显示公式
```ts
const showCurrentHour = !!currentHour
                    && _isSameDate        // 数据日期匹配页面日期
                    && !isSelectedDateFuture; // 不是未来日期
```

- "今日清晨"时 `_isSameDate=false` → 不显示。
- "昨天夜段"时 `_isSameDate=true` → 显示昨夜小时。
- 未来日期 `isSelectedDateFuture=true` → 不显示。

---

## 提示文案选择
1. `shouldShowPreSunriseMessage` 为 **true** → 显示"It's early morning, before today's sunrise ..."
2. `isSelectedDatePast` → "You're viewing planetary hours for X. "Current hour" is only shown for today's date."
3. `isSelectedDateFuture` → "You're viewing planetary hours for X. "Current hour" will be available on this date."

---

## TDD Checklist
- [ ] 今日日出前：今日页面无实时小时；昨日页面有实时小时。
- [ ] 今日日出后：今日页面有实时小时。
- [ ] 未来日期：无实时小时，提示将来可用。
- [ ] 过去日期：无实时小时，提示仅今日可见。

遵守以上规则，确保 UI 行为与行星日定义一致。 