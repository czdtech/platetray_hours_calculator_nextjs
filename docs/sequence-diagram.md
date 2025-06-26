# 时序图 (Sequence Diagram)

## 概述
本文档展示了行星时计算器应用中关键操作的时间序列，包括应用初始化、用户交互和后台定时任务的完整时序流程。

## 应用交互时序图

```mermaid
sequenceDiagram
    participant U as 用户
    participant B as 浏览器
    participant C as CalculatorPage
    participant PH as PlanetaryHours服务
    participant G as Google Maps API
    participant SC as SunCalc库
    participant KV as Vercel KV/缓存
    participant SW as Service Worker

    Note over U,SW: 应用初始化阶段
    U->>B: 访问页面
    B->>C: 加载应用
    C->>SW: 检查预计算缓存
    alt 有缓存数据
        SW-->>C: 返回缓存的JSON
        C->>C: 使用预计算数据快速渲染
    else 无缓存数据
        C->>PH: 请求计算当前位置行星时
        PH->>SC: 计算天文数据
        SC-->>PH: 返回日出日落时间
        PH->>PH: 计算24小时行星时
        PH-->>C: 返回行星时数据
    end
    C-->>B: 显示初始页面
    B-->>U: 页面加载完成

    Note over U,SW: 用户交互阶段
    U->>C: 更改位置
    C->>G: 发起地理编码请求
    G-->>C: 返回坐标信息
    C->>G: 请求时区信息
    G-->>C: 返回时区数据
    C->>PH: 使用新位置重新计算

    alt 缓存中有数据
        PH->>KV: 检查缓存
        KV-->>PH: 返回缓存结果
    else 缓存中无数据
        PH->>SC: 重新计算天文数据
        SC-->>PH: 返回计算结果
        PH->>KV: 保存到缓存
    end

    PH-->>C: 返回新的行星时数据
    C-->>B: 更新UI显示
    B-->>U: 显示新的计算结果

    Note over U,SW: 后台定时任务
    rect rgb(255, 248, 225)
        Note over KV: 每日22:00 UTC-5 (NY时间)
        KV->>PH: 触发预计算任务
        PH->>SC: 计算纽约次日行星时
        SC-->>PH: 返回计算结果
        PH->>KV: 保存JSON文件到public目录
        PH->>SW: 更新Service Worker缓存
    end

    rect rgb(240, 248, 255)
        Note over KV: 每日23:00 UTC-5 (NY时间)
        KV->>KV: 验证预计算文件
        alt 文件缺失
            KV->>PH: 触发补偿计算
            PH->>SC: 重新计算
            SC-->>PH: 返回结果
            PH->>KV: 保存文件
        end
    end

    Note over U,SW: 用户切换日期
    U->>C: 选择不同日期
    C->>PH: 计算指定日期行星时
    PH->>KV: 检查缓存
    alt 缓存命中
        KV-->>PH: 返回缓存数据
    else 缓存未命中
        PH->>SC: 实时计算
        SC-->>PH: 返回结果
        PH->>KV: 保存新缓存
    end
    PH-->>C: 返回行星时数据
    C-->>U: 更新显示
```

## 关键时序分析

### 1. 应用初始化流程 (0-2秒)
- **首屏加载优化**：优先检查预计算缓存
- **渐进式渲染**：有缓存时立即显示，无缓存时实时计算
- **零闪烁体验**：预计算数据避免CLS（累积布局偏移）

### 2. 用户交互响应 (100-500毫秒)
- **位置更改**：地理编码 → 时区查询 → 重新计算
- **缓存优先策略**：先检查缓存，缓存未命中时才实时计算
- **UI即时反馈**：加载状态确保用户感知操作进度

### 3. 后台定时任务 (每日执行)
- **22:00预计算**：生成纽约次日数据，更新缓存
- **23:00验证任务**：检查文件完整性，缺失时补偿计算
- **00:01重新验证**：触发ISR revalidate确保数据新鲜度

### 4. 缓存命中策略
- **内存缓存**：最快响应，适用于重复计算
- **文件缓存**：预计算JSON，适用于常见查询
- **分布式缓存**：Vercel KV，适用于全球用户

## 性能特征

### 响应时间目标
- **LCP (最大内容绘制)** < 1秒
- **FID (首次输入延迟)** < 100毫秒
- **CLS (累积布局偏移)** = 0
- **INP (交互到下次绘制)** < 200毫秒

### 容错机制
- **降级策略**：API失败时使用默认位置
- **重试机制**：网络错误时的指数退避重试
- **离线支持**：Service Worker缓存已访问数据
- **错误边界**：组件级错误隔离，避免全局崩溃

### 监控点
- **API调用频率**：避免超出Google Maps配额
- **缓存命中率**：监控各级缓存效果
- **计算耗时**：SunCalc库的性能表现
- **用户体验指标**：Core Web Vitals实时监控

创建日期: ${new Date().toLocaleDateString('zh-CN')}
