# Google AdSense 显示问题排查/修复清单

> 目的：在常规浏览器与默认隐私设置下，确保行星时计算器站点的 Google 广告能正常渲染。

---

## 一、可立即修复的站点自身问题

| 序号 | 问题 | 影响 | 修复要点 |
|------|------|------|----------|
| 1 | **React 运行时异常 #418** | 页面渲染链中断，`<ins class="adsbygoogle">` 无法挂载 | 在开发模式 `yarn dev` 下复现，查看完整错误堆栈并修复组件逻辑 |
| 2 | **Content-Security-Policy 过严** | 广告脚本 / iframe 被 CSP 阻断 | 在 `script-src` & `frame-src` 中加入：<br>• `https://pagead2.googlesyndication.com`<br>• `https://googleads.g.doubleclick.net`<br>• `https://tpc.googlesyndication.com`<br>• `https://fundingchoicesmessages.google.com`<br>并确保 `'unsafe-inline'` 或 `nonce` 允许 Google 动态脚本 |
| 3 | **Ads 代码嵌入顺序/属性** | 脚本加载顺序错误，广告位无法刷新 | 使用官方最新片段，保持 `async` 与 `crossorigin="anonymous"`；确认 `data-ad-slot`、`data-ad-format` 正确 |
| 4 | **Cookie Consent/FundingChoices 配置** | GDPR 同意逻辑阻塞广告请求 | 确保 Consent Mode 初始化在 *所有* Ads 脚本之前，并在用户同意后调用相应 API |
| 5 | **next/head 元数据冲突** | 重复/冲突的 meta 可能影响脚本执行 | 保留 `charset`、`viewport`，审查重复 http-equiv 标签 |

---

## 二、不可控外部因素（无法 100% 解决）

1. **浏览器隐私防护**（Firefox ETP、Brave Shields 等）：会主动拦截第三方广告脚本。
2. **用户安装的广告拦截扩展**：直接屏蔽 `googlesyndication*`、`doubleclick*` 域名。
3. **网络运营商 / 区域性过滤**：部分 ISP 或公司网络对广告域名做 DNS 过滤。
4. **Google Ads 脚本自身警告**：如 `unreachable code after return`，由 Google 维护，站点无法修改。

---

## 三、验证步骤

1. **本地/测试环境**：关闭隐私防护 & 广告拦截扩展，打开 DevTools ➜ Network，过滤 `googlesyndication`，确认请求成功（状态 200 而非 `blocked:csp`）。
2. **生产环境**：部署更新后的 CSP，使用多浏览器（Chrome / Edge / Firefox 默认模式）访问，确认广告渲染。

---

## 四、后续

- 上述 5 项完成后，应能在绝大多数浏览器中正常加载 Google AdSense。
- 对于仍被隐私/拦截场景阻止的用户，可考虑在 UI 提供简要提示或隐藏广告位以避免空白空间。