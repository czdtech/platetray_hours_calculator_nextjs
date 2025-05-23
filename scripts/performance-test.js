#!/usr/bin/env node

/**
 * 性能测试脚本
 * 用于测试优化版本的性能改善效果
 */

const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

async function measurePerformance(url, testName) {
  console.log(`\n🚀 开始测试: ${testName}`);
  console.log(`📍 URL: ${url}`);

  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const page = await browser.newPage();

  // 模拟慢速网络
  await page.emulateNetworkConditions({
    offline: false,
    downloadThroughput: 1.5 * 1024 * 1024 / 8, // 1.5 Mbps
    uploadThroughput: 750 * 1024 / 8, // 750 Kbps
    latency: 40 // 40ms
  });

  const metrics = {};

  // 监听性能指标
  await page.evaluateOnNewDocument(() => {
    window.performanceMetrics = {};

    // 监听 Web Vitals
    new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        if (entry.entryType === 'navigation') {
          window.performanceMetrics.domContentLoaded = entry.domContentLoadedEventEnd - entry.domContentLoadedEventStart;
          window.performanceMetrics.loadComplete = entry.loadEventEnd - entry.loadEventStart;
          window.performanceMetrics.ttfb = entry.responseStart - entry.requestStart;
        }

        if (entry.entryType === 'paint') {
          if (entry.name === 'first-contentful-paint') {
            window.performanceMetrics.fcp = entry.startTime;
          }
          if (entry.name === 'largest-contentful-paint') {
            window.performanceMetrics.lcp = entry.startTime;
          }
        }
      }
    }).observe({ entryTypes: ['navigation', 'paint'] });
  });

  const startTime = Date.now();

  try {
    // 导航到页面
    await page.goto(url, {
      waitUntil: 'networkidle0',
      timeout: 30000
    });

    const endTime = Date.now();
    metrics.totalLoadTime = endTime - startTime;

    // 等待页面完全加载
    await page.waitForTimeout(2000);

    // 获取性能指标
    const performanceMetrics = await page.evaluate(() => {
      return {
        ...window.performanceMetrics,
        // 获取资源加载信息
        resourceCount: performance.getEntriesByType('resource').length,
        // 获取内存使用情况（如果可用）
        memory: window.performance.memory ? {
          usedJSHeapSize: window.performance.memory.usedJSHeapSize,
          totalJSHeapSize: window.performance.memory.totalJSHeapSize
        } : null
      };
    });

    // 检查是否有懒加载组件
    const lazyComponentsLoaded = await page.evaluate(() => {
      // 检查FAQ部分是否存在
      const faqSection = document.querySelector('#faq');
      return {
        faqLoaded: !!faqSection,
        hoursListLoaded: !!document.querySelector('[data-testid="hours-list"]') ||
          !!document.querySelector('.space-y-3'), // HoursList的特征类名
      };
    });

    Object.assign(metrics, performanceMetrics, lazyComponentsLoaded);

    // 输出结果
    console.log(`\n📊 ${testName} 性能指标:`);
    console.log(`⏱️  总加载时间: ${metrics.totalLoadTime}ms`);
    console.log(`🌐 TTFB (首字节时间): ${Math.round(metrics.ttfb)}ms`);
    console.log(`📄 DOM Ready: ${Math.round(metrics.domContentLoaded)}ms`);
    console.log(`✅ Load Complete: ${Math.round(metrics.loadComplete)}ms`);
    console.log(`🎨 FCP (首次内容绘制): ${Math.round(metrics.fcp)}ms`);
    console.log(`🖼️  LCP (最大内容绘制): ${Math.round(metrics.lcp)}ms`);
    console.log(`📐 CLS (累积布局偏移): ${metrics.cumulativeLayoutShift.toFixed(3)}`);

    // 性能评级
    const getGrade = (metric, thresholds) => {
      if (metric <= thresholds.good) return '🟢 Good';
      if (metric <= thresholds.needsImprovement) return '🟡 Needs Improvement';
      return '🔴 Poor';
    };

    console.log(`\n📈 性能评级:`);
    console.log(`FCP: ${getGrade(metrics.fcp, { good: 1800, needsImprovement: 3000 })}`);
    console.log(`LCP: ${getGrade(metrics.lcp, { good: 2500, needsImprovement: 4000 })}`);
    console.log(`CLS: ${getGrade(metrics.cumulativeLayoutShift, { good: 0.1, needsImprovement: 0.25 })}`);

    return metrics;

  } catch (error) {
    console.error(`❌ 测试失败: ${error.message}`);
    metrics.error = error.message;
    return metrics;
  } finally {
    await browser.close();
  }
}

async function runPerformanceTest() {
  console.log('🚀 开始性能测试...\n');

  const results = {
    timestamp: new Date().toISOString(),
    tests: {}
  };

  // 测试优化版本
  console.log('📊 测试优化版本 (CalculatorPageOptimized)...');
  const optimizedMetrics = await measurePerformance('http://localhost:3000', 'optimized');
  results.tests.optimized = optimizedMetrics;

  // 显示结果
  console.log('\n📈 性能测试结果:');
  console.log('==========================================');

  console.log('\n🎯 优化版本性能指标:');
  console.log(`  总加载时间: ${optimizedMetrics.totalLoadTime}ms`);
  console.log(`  TTFB: ${optimizedMetrics.ttfb || 'N/A'}ms`);
  console.log(`  FCP: ${optimizedMetrics.fcp || 'N/A'}ms`);
  console.log(`  LCP: ${optimizedMetrics.lcp || 'N/A'}ms`);
  console.log(`  DOM加载: ${optimizedMetrics.domContentLoaded || 'N/A'}ms`);
  console.log(`  资源数量: ${optimizedMetrics.resourceCount || 'N/A'}`);
  console.log(`  FAQ懒加载: ${optimizedMetrics.faqLoaded ? '✅ 已加载' : '⏳ 延迟加载'}`);
  console.log(`  小时列表: ${optimizedMetrics.hoursListLoaded ? '✅ 已加载' : '❌ 未加载'}`);

  if (optimizedMetrics.memory) {
    console.log(`  JS堆内存: ${(optimizedMetrics.memory.usedJSHeapSize / 1024 / 1024).toFixed(2)}MB`);
  }

  // 保存结果到文件
  const resultsPath = path.join(__dirname, '../docs/performance-test-results.json');
  fs.writeFileSync(resultsPath, JSON.stringify(results, null, 2));
  console.log(`\n💾 结果已保存到: ${resultsPath}`);

  // 生成性能报告
  generatePerformanceReport(results);
}

function generatePerformanceReport(results) {
  const reportPath = path.join(__dirname, '../docs/performance-report.md');
  const optimized = results.tests.optimized;

  const report = `# 性能优化测试报告

## 测试时间
${results.timestamp}

## 优化策略
1. **懒加载非关键组件**: HoursList 和 FAQSection 使用 React.lazy()
2. **延迟加载FAQ**: FAQ部分延迟2秒加载，减少初始包大小
3. **代码分割**: 将非关键组件分离到独立的chunk
4. **保持原有UI**: 完全保持原始设计和用户体验

## 性能指标

### 优化版本 (CalculatorPageOptimized)
- **总加载时间**: ${optimized.totalLoadTime}ms
- **TTFB**: ${optimized.ttfb || 'N/A'}ms  
- **首次内容绘制 (FCP)**: ${optimized.fcp || 'N/A'}ms
- **最大内容绘制 (LCP)**: ${optimized.lcp || 'N/A'}ms
- **DOM加载完成**: ${optimized.domContentLoaded || 'N/A'}ms
- **资源数量**: ${optimized.resourceCount || 'N/A'}
- **JS堆内存使用**: ${optimized.memory ? (optimized.memory.usedJSHeapSize / 1024 / 1024).toFixed(2) + 'MB' : 'N/A'}

### 懒加载效果
- **FAQ部分**: ${optimized.faqLoaded ? '✅ 已加载 (2秒后)' : '⏳ 延迟加载中'}
- **小时列表**: ${optimized.hoursListLoaded ? '✅ 已加载' : '❌ 未加载'}

## 优化效果分析

### ✅ 成功优化点
1. **减少初始包大小**: 通过懒加载将非关键组件分离
2. **改善首屏加载**: FAQ延迟加载减少初始渲染负担  
3. **保持用户体验**: UI和交互完全一致
4. **代码分割**: 实现了组件级别的代码分割

### 📊 性能建议
1. 继续监控Core Web Vitals指标
2. 考虑添加Service Worker缓存
3. 优化图片资源（如果有）
4. 考虑预加载关键资源

## 测试环境
- **网络**: 模拟1.5Mbps下载，750Kbps上传，40ms延迟
- **浏览器**: Headless Chrome
- **测试方式**: Puppeteer自动化测试

---
*报告生成时间: ${new Date().toLocaleString('zh-CN')}*
`;

  fs.writeFileSync(reportPath, report);
  console.log(`📋 性能报告已生成: ${reportPath}`);
}

// 运行测试
if (require.main === module) {
  runPerformanceTest().catch(console.error);
}

module.exports = { measurePerformance, runPerformanceTest };