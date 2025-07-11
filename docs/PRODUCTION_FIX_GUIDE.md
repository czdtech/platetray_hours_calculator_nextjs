# 🚨 生产环境日期不一致问题修复指南

## 问题描述

生产环境显示的是 **June 28, 2025**，而本地开发环境显示正确的 **July 11, 2025**。

## 根本原因分析

1. **预计算文件缺失**：线上环境的 `ny-2025-07-11.json` 预计算文件不存在（返回404）
2. **Cron作业异常**：Vercel的cron作业可能没有正常执行
3. **缓存问题**：可能存在CDN或边缘缓存导致的陈旧数据

## 📋 修复检查清单

### 🔧 立即修复步骤

#### 1. 手动触发预计算数据生成

```bash
# 方法1: 访问手动触发接口
curl https://planetaryhours.org/api/cron/force-precompute-today

# 方法2: 访问原有cron接口
curl https://planetaryhours.org/api/cron/precompute-newyork
```

#### 2. 验证修复结果

```bash
# 检查预计算文件是否生成成功
curl https://planetaryhours.org/precomputed/ny-2025-07-11.json

# 检查主页是否显示正确日期
curl -s https://planetaryhours.org | grep -o "July [0-9]*, 2025"
```

#### 3. 清理缓存

- **Cloudflare**: 清除所有缓存或特定URL缓存
- **Vercel**: 重新部署或清除Edge Cache
- **浏览器**: 硬刷新 (Ctrl+F5) 或清除缓存

### 🔍 深度排查步骤

#### 1. 检查Vercel Cron作业状态

```bash
# 在Vercel Dashboard中查看
- 进入项目 → Functions → Cron Jobs
- 检查最近的执行日志
- 确认cron表达式正确: "0 2 * * *" 和 "0 3 * * *"
```

#### 2. 检查环境变量

确保生产环境中设置了必要的环境变量：

```bash
# Vercel KV相关环境变量（如果使用KV存储）
VERCEL_KV_REST_API_URL=xxx
VERCEL_KV_REST_API_TOKEN=xxx

# 或其他KV提供商
UPSTASH_REDIS_REST_URL=xxx
UPSTASH_REDIS_REST_TOKEN=xxx
```

#### 3. 检查时区计算

验证服务器环境中的时区计算是否正确：

```javascript
console.log('Server UTC time:', new Date().toISOString())
console.log(
  'Server NY time:',
  formatInTimeZone(new Date(), 'America/New_York', 'yyyy-MM-dd HH:mm:ss')
)
```

### 📦 部署修复版本

#### 1. 部署包含增强日志的版本

当前代码已包含详细的调试日志，重新部署后检查Vercel日志：

```javascript
// CalculatorServer.tsx 中的日志输出
[CalculatorServer] 当前UTC时间: 2025-07-11T09:24:26.221Z
[CalculatorServer] 计算得出的纽约日期: 2025-07-11
[CalculatorServer] 纽约当前时间: Fri Jul 11 2025 05:24:26 GMT-0400 (EDT)
```

#### 2. 使用新的手动触发接口

部署后可以访问：

```
https://planetaryhours.org/api/cron/force-precompute-today
```

### 🕐 Cron作业配置验证

当前配置（`vercel.json`）：

```json
{
  "crons": [
    {
      "path": "/api/cron/precompute-newyork",
      "schedule": "0 2 * * *" // UTC 02:00 = NY 22:00 (EST) 或 21:00 (EDT)
    },
    {
      "path": "/api/cron/precompute-newyork",
      "schedule": "0 3 * * *" // UTC 03:00 = NY 23:00 (EST) 或 22:00 (EDT)
    }
  ]
}
```

**⚠️ 注意**: 由于夏令时，当前EDT时区下：

- UTC 02:00 = EDT 22:00 (夏令时)
- UTC 03:00 = EDT 23:00 (夏令时)

### 📊 监控和预防

#### 1. 添加健康检查

在项目中添加健康检查接口：

```javascript
// /api/health/precomputed
{
  "status": "ok",
  "todayFile": "ny-2025-07-11.json",
  "fileExists": true,
  "lastGenerated": "2025-07-11T02:00:00Z"
}
```

#### 2. 监控告警

- 设置Vercel函数执行失败告警
- 设置预计算文件缺失检查
- 设置日期显示监控

### 🚀 快速恢复步骤

如果问题再次出现：

1. **立即访问**: `https://planetaryhours.org/api/cron/force-precompute-today`
2. **清除缓存**: Cloudflare + Vercel + 浏览器
3. **验证修复**: 检查主页日期显示
4. **检查日志**: Vercel函数日志中的详细信息

### 📝 后续优化

1. **添加回退机制**: 如果当日预计算文件不存在，自动生成
2. **缓存策略优化**: 设置合适的缓存头，避免陈旧数据
3. **监控增强**: 自动检测和告警系统
4. **数据验证**: 增加预计算数据的完整性检查

---

## ✅ 验证清单

修复完成后，确认以下项目：

- [ ] 主页显示正确日期 (July 11, 2025)
- [ ] 预计算文件可访问 (`/precomputed/ny-2025-07-11.json`)
- [ ] Cron作业正常执行
- [ ] 日志输出正常
- [ ] 缓存已清理
- [ ] 多个浏览器验证

## 🆘 紧急联系

如果上述步骤无法解决问题：

1. 检查Vercel项目状态
2. 查看Cloudflare SSL/DNS设置
3. 验证域名配置
4. 回滚到最近稳定版本
