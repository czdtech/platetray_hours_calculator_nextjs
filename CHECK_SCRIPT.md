# 🔍 线上配置检查脚本

## 📋 检查清单 - 请按顺序执行

### 🚀 1. 部署更新到线上
```bash
# 提交并推送代码
git add .
git commit -m "添加调试工具和日志，用于排查城市按钮线上问题"
git push origin main

# 等待Vercel自动部署完成（约2-3分钟）
```

### 🌐 2. 访问调试页面
```
访问: https://your-domain.com/debug
```

### 🔧 3. 浏览器开发者工具检查

#### 3.1 打开开发者工具
- 按 F12 或右键 → 检查
- 切换到 **Network** 标签
- 勾选 **Preserve log** 保留日志
- 勾选 **Disable cache** 禁用缓存

#### 3.2 控制台检查
- 切换到 **Console** 标签
- 查看是否有 JavaScript 错误
- 清空控制台准备测试

#### 3.3 测试城市按钮
1. 点击 **London** 按钮
2. 观察 Console 中的调试日志（应该看到 `[CITY_DEBUG]` 和 `[MAIN_DEBUG]` 开头的日志）
3. 观察 Network 中是否有新的 API 请求
4. 重复测试 **Dubai** 和 **Sydney** 按钮

### 📊 4. API直接测试

#### 4.1 控制台测试命令
```javascript
// 在浏览器控制台运行以下代码

// 1. 测试时区API
console.log('🧪 测试时区API...');
fetch('/api/maps/timezone?location=51.5074,-0.1278&timestamp=' + Math.floor(Date.now() / 1000), {
  headers: { 'Cache-Control': 'no-cache' }
})
.then(response => {
  console.log('✅ 时区API响应状态:', response.status);
  console.log('📋 响应头:', {
    'cache-control': response.headers.get('cache-control'),
    'x-vercel-cache': response.headers.get('x-vercel-cache'),
    'cf-cache-status': response.headers.get('cf-cache-status'),
    'cf-ray': response.headers.get('cf-ray')
  });
  return response.json();
})
.then(data => console.log('📦 时区API数据:', data))
.catch(error => console.error('❌ 时区API错误:', error));

// 2. 测试会话API
console.log('🧪 测试会话API...');
fetch('/api/maps/session/start')
.then(response => response.json())
.then(data => console.log('📦 会话API数据:', data))
.catch(error => console.error('❌ 会话API错误:', error));

// 3. 检查环境变量
console.log('🔍 环境信息:', {
  NODE_ENV: process.env.NODE_ENV,
  userAgent: navigator.userAgent.substring(0, 100),
  timestamp: new Date().toISOString()
});

// 4. 检查缓存
if ('caches' in window) {
  caches.keys().then(names => console.log('💾 当前缓存:', names));
}

// 5. 检查Service Worker
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.getRegistrations().then(registrations => {
    console.log('⚙️ Service Worker状态:', registrations.map(reg => ({
      scope: reg.scope,
      state: reg.active?.state
    })));
  });
}
```

#### 4.2 健康检查API
```
访问: https://your-domain.com/api/health
```

### 💻 5. cURL命令测试（可选）

```bash
# 1. 测试时区API缓存行为
curl -I "https://your-domain.com/api/maps/timezone?location=51.5074,-0.1278&timestamp=$(date +%s)"

# 2. 测试主页缓存
curl -I "https://your-domain.com/"

# 3. 测试健康检查
curl "https://your-domain.com/api/health" | jq

# 4. 测试带缓存破坏的请求
curl "https://your-domain.com/api/maps/timezone?location=51.5074,-0.1278&timestamp=$(date +%s)&_nocache=$(date +%s)"
```

### 📝 6. 记录检查结果

请将以下信息记录下来：

#### ✅ 成功指标
- [ ] 调试页面正常显示
- [ ] 点击城市按钮时控制台有 `[CITY_DEBUG]` 日志
- [ ] 点击城市按钮时控制台有 `[MAIN_DEBUG]` 日志  
- [ ] Network面板显示时区API请求（/api/maps/timezone）
- [ ] 时区API返回200状态码且有正确数据
- [ ] 页面UI正确更新显示选中的城市

#### ❌ 问题指标
- [ ] 控制台有JavaScript错误
- [ ] 点击按钮无任何日志输出
- [ ] API请求失败或超时
- [ ] API请求被缓存（304状态码或cf-cache-status: HIT）
- [ ] UI不更新或显示错误数据

### 🚨 7. 常见问题诊断

#### 问题1: 看不到调试日志
**可能原因**: console被移除或CSP阻止
**解决**: 检查Network面板，确认部署是否包含最新代码

#### 问题2: API请求失败
**可能原因**: 环境变量缺失或网络问题
**解决**: 检查 `/api/health` 端点的响应

#### 问题3: API被过度缓存
**可能原因**: Cloudflare缓存设置问题
**解决**: 添加缓存破坏参数或清理CDN缓存

#### 问题4: 点击无响应
**可能原因**: JavaScript执行被阻止或事件未绑定
**解决**: 检查CSP头和console错误信息

### 📤 8. 结果报告

请将检查结果发送给我，包括：
1. 调试页面的截图
2. 控制台日志截图（点击城市按钮后）
3. Network面板截图（显示API请求）
4. 任何错误信息的完整截图
5. `/api/health` 端点的响应数据

---

## 🎯 快速诊断命令

如果你只想快速检查，可以在浏览器控制台运行：

```javascript
// 一键诊断脚本
(async function quickDiagnosis() {
  console.log('🔍 开始快速诊断...');
  
  // 检查基本环境
  console.log('📊 环境信息:', {
    url: window.location.href,
    userAgent: navigator.userAgent.substring(0, 50),
    timestamp: new Date().toISOString()
  });
  
  // 测试API
  try {
    const response = await fetch('/api/health');
    const data = await response.json();
    console.log('✅ 健康检查通过:', data);
  } catch (error) {
    console.error('❌ 健康检查失败:', error);
  }
  
  // 模拟城市点击
  console.log('🧪 模拟城市选择...');
  const event = new Event('click');
  const buttons = document.querySelectorAll('button[aria-label*="Switch to"]');
  if (buttons.length > 0) {
    console.log(`找到 ${buttons.length} 个城市按钮`);
    buttons[0].dispatchEvent(event);
  } else {
    console.log('⚠️ 未找到城市按钮');
  }
  
  console.log('🏁 快速诊断完成');
})();
```