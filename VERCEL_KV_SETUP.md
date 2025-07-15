# Vercel KV 存储配置说明

> **⚠️ 重要更新**：从 2024 年开始，Vercel KV 已迁移到 Marketplace 集成方式，由 Upstash 提供支持。不再通过 Storage 标签直接创建。

## 📋 配置步骤

### 1. 通过 Vercel Marketplace 安装 Redis 集成

在 Vercel 仪表板中：

1. 进入项目 → **Integrations** 标签
2. 点击 **"Browse Marketplace"**
3. 在 "Native Integrations" 部分找到 **Redis** 集成（由 Upstash 提供）
4. 点击 **"Install"**
5. 选择合适的计费方案（免费方案可用）
6. 点击 **"Continue"**
7. 提供数据库名称：`planetary-hours-cache`
8. 点击 **"Create"**

### 2. 连接到项目

创建数据库后：

1. 选择要连接的项目：`platetray_hours_calculator_nextjs`
2. 系统会自动配置环境变量
3. 点击完成设置

### 3. 环境变量自动配置

集成安装后，Vercel 会自动设置以下环境变量：
- `KV_REST_API_URL`
- `KV_REST_API_TOKEN`
- `KV_URL` (用于 Redis 客户端连接)

### 4. 验证配置

部署完成后，访问：
- `https://planetaryhours.org/api/cron/daily-precompute` 测试预计算
- `https://planetaryhours.org/api/cron/force-precompute-today` 强制刷新今日数据

### 5. 监控日志

在 Vercel 仪表板中：
1. 进入项目 → Functions 标签
2. 查看 `/api/cron/daily-precompute` 函数日志
3. 确认看到以下日志：
   - `✅ 已写入KV存储: ny-YYYY-MM-DD`
   - `✅ [预计算] 成功从KV存储加载: ny-YYYY-MM-DD`

## 🔧 技术细节

### 存储策略

1. **KV存储（生产环境优先）**
   - 键格式：`ny-YYYY-MM-DD` 
   - 过期时间：7天
   - 数据类型：完整的 PlanetaryHoursCalculationResult 对象

2. **本地文件（开发环境回退）**
   - 路径：`public/precomputed/ny-YYYY-MM-DD.json`
   - 用于开发环境和静态文件回退

3. **即时计算（最后回退）**
   - 当所有预计算数据都不可用时
   - 实时计算当前时间的行星时数据

### 预计算调度

- **每日预计算**：UTC 06:00 (纽约时间 01:00-02:00)
- **缓存重新验证**：UTC 06:05
- **数据覆盖**：当天 + 未来6天

## 🚨 故障排除

### 常见问题

1. **KV 存储不可用**
   - 检查环境变量是否正确设置
   - 验证 KV 数据库是否已创建
   - 查看 Vercel 项目的 Storage 设置

2. **预计算任务失败**
   - 检查 cron 任务是否正确配置
   - 查看 Functions 日志中的错误信息
   - 手动触发 `/api/cron/force-precompute-today` 测试

3. **数据不同步**
   - 确认时区设置正确
   - 检查智能数据选择逻辑
   - 验证缓存过期时间设置

### 调试命令

```bash
# 检查 KV 存储状态
curl https://planetaryhours.org/api/health

# 手动触发预计算
curl -X POST https://planetaryhours.org/api/cron/daily-precompute

# 强制刷新今日数据
curl -X POST https://planetaryhours.org/api/cron/force-precompute-today
```

## 📊 性能监控

- **存储读写延迟**：< 100ms
- **预计算任务执行时间**：< 10s
- **缓存命中率**：> 90%
- **数据更新频率**：每日一次

配置完成后，系统将自动处理数据的生成、存储和读取，确保每天都有最新的行星时数据。