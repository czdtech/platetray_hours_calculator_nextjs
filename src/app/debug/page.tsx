'use client';

import { useState, useEffect } from 'react';
import { notFound } from 'next/navigation';

interface DebugInfo {
  environment: string;
  userAgent: string;
  timestamp: string;
  apiTests: {
    timezone: { status: string; data?: any; error?: string; cacheHeaders?: any };
    session: { status: string; data?: any; error?: string };
  };
  cacheInfo: {
    serviceWorker: boolean;
    cacheStorage: string[];
  };
  errors: string[];
}

export default function DebugPage() {
  // 生产环境返回404
  if (process.env.NODE_ENV === 'production') {
    notFound();
  }
  const [debugInfo, setDebugInfo] = useState<DebugInfo | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const testAPI = async (url: string, label: string) => {
    try {
      // 智能添加调试参数：如果URL已有参数则用&，否则用?
      const debugParam = url.includes('?') ? '&_debug=' : '?_debug=';
      const response = await fetch(url + debugParam + Date.now(), {
        headers: { 'Cache-Control': 'no-cache' }
      });
      const data = await response.json();
      
      // 获取响应头信息
      const cacheHeaders = {
        'cache-control': response.headers.get('cache-control'),
        'x-vercel-cache': response.headers.get('x-vercel-cache'),
        'cf-cache-status': response.headers.get('cf-cache-status'),
        'cf-ray': response.headers.get('cf-ray'),
      };

      return {
        status: response.ok ? 'success' : 'failed',
        data,
        cacheHeaders
      };
    } catch (error) {
      return {
        status: 'error',
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  };

  const getCacheInfo = async () => {
    const info = {
      serviceWorker: !!navigator.serviceWorker,
      cacheStorage: [] as string[]
    };

    if ('caches' in window) {
      try {
        const cacheNames = await caches.keys();
        info.cacheStorage = cacheNames;
      } catch (error) {
        console.error('Error getting cache names:', error);
      }
    }

    return info;
  };

  const collectDebugInfo = async () => {
    setIsLoading(true);
    const errors: string[] = [];

    // 添加全局错误监听
    const errorHandler = (event: ErrorEvent) => {
      errors.push(`JS Error: ${event.message} at ${event.filename}:${event.lineno}`);
    };
    window.addEventListener('error', errorHandler);

    try {
      const [timezoneTest, sessionTest, cacheInfo] = await Promise.all([
        testAPI('/api/maps/timezone?location=51.5074,-0.1278&timestamp=' + Math.floor(Date.now() / 1000), 'timezone'),
        testAPI('/api/maps/session/start', 'session'),
        getCacheInfo()
      ]);

      const info: DebugInfo = {
        environment: process.env.NODE_ENV || 'unknown',
        userAgent: navigator.userAgent,
        timestamp: new Date().toISOString(),
        apiTests: {
          timezone: timezoneTest,
          session: sessionTest
        },
        cacheInfo,
        errors
      };

      setDebugInfo(info);
    } catch (error) {
      console.error('Debug collection failed:', error);
      errors.push(`Debug collection failed: ${error}`);
    } finally {
      window.removeEventListener('error', errorHandler);
      setIsLoading(false);
    }
  };

  const testCitySelection = async () => {
    console.log('🧪 [Debug] 测试城市选择功能');
    
    // 模拟点击London按钮
    try {
      const cities = [
        { name: 'London', lat: 51.5074, lng: -0.1278, timezone: 'Europe/London' },
        { name: 'Dubai', lat: 25.2048, lng: 55.2708, timezone: 'Asia/Dubai' },
        { name: 'Sydney', lat: -33.8688, lng: 151.2093, timezone: 'Australia/Sydney' }
      ];

      for (const city of cities) {
        console.log(`🏙️ 测试城市: ${city.name}`);
        
        // 测试时区API
        const timezoneResponse = await fetch(
          `/api/maps/timezone?location=${city.lat},${city.lng}&timestamp=${Math.floor(Date.now() / 1000)}&_test=1`,
          { headers: { 'Cache-Control': 'no-cache' } }
        );
        
        const timezoneData = await timezoneResponse.json();
        console.log(`✅ ${city.name} 时区API响应:`, timezoneData);
        
        // 检查响应头
        console.log(`📋 ${city.name} 缓存头:`, {
          'cache-control': timezoneResponse.headers.get('cache-control'),
          'x-vercel-cache': timezoneResponse.headers.get('x-vercel-cache'),
          'cf-cache-status': timezoneResponse.headers.get('cf-cache-status'),
        });
      }
    } catch (error) {
      console.error('❌ 城市选择测试失败:', error);
    }
  };

  const clearAllCaches = async () => {
    if ('caches' in window) {
      try {
        const cacheNames = await caches.keys();
        await Promise.all(cacheNames.map(name => caches.delete(name)));
        console.log('✅ 所有缓存已清理');
        alert('缓存已清理，请刷新页面重新测试');
      } catch (error) {
        console.error('❌ 清理缓存失败:', error);
      }
    }
  };

  useEffect(() => {
    collectDebugInfo();
  }, []);

  if (!debugInfo && isLoading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-purple-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">正在收集调试信息...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-800 mb-8">🔍 线上调试面板</h1>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* 环境信息 */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4">📊 环境信息</h2>
            {debugInfo && (
              <div className="space-y-2 font-mono text-sm">
                <div><strong>环境:</strong> {debugInfo.environment}</div>
                <div><strong>时间:</strong> {debugInfo.timestamp}</div>
                <div><strong>用户代理:</strong> {debugInfo.userAgent.substring(0, 100)}...</div>
              </div>
            )}
          </div>

          {/* API测试结果 */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4">🔌 API测试结果</h2>
            {debugInfo && (
              <div className="space-y-4">
                <div className={`p-3 rounded ${debugInfo.apiTests.timezone.status === 'success' ? 'bg-green-100' : 'bg-red-100'}`}>
                  <div className="font-semibold">时区API:</div>
                  <div className="text-sm">状态: {debugInfo.apiTests.timezone.status}</div>
                  {debugInfo.apiTests.timezone.data && (
                    <div className="text-xs mt-1">
                      时区ID: {debugInfo.apiTests.timezone.data.timeZoneId}
                    </div>
                  )}
                  {debugInfo.apiTests.timezone.error && (
                    <div className="text-xs text-red-600 mt-1">
                      错误: {debugInfo.apiTests.timezone.error}
                    </div>
                  )}
                </div>
                
                <div className={`p-3 rounded ${debugInfo.apiTests.session.status === 'success' ? 'bg-green-100' : 'bg-red-100'}`}>
                  <div className="font-semibold">会话API:</div>
                  <div className="text-sm">状态: {debugInfo.apiTests.session.status}</div>
                  {debugInfo.apiTests.session.error && (
                    <div className="text-xs text-red-600 mt-1">
                      错误: {debugInfo.apiTests.session.error}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* 缓存信息 */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4">💾 缓存信息</h2>
            {debugInfo && (
              <div className="space-y-2 text-sm">
                <div><strong>Service Worker:</strong> {debugInfo.cacheInfo.serviceWorker ? '✅ 已启用' : '❌ 未启用'}</div>
                <div><strong>缓存存储:</strong></div>
                <ul className="list-disc list-inside ml-4">
                  {debugInfo.cacheInfo.cacheStorage.length > 0 ? 
                    debugInfo.cacheInfo.cacheStorage.map(name => (
                      <li key={name} className="text-xs">{name}</li>
                    )) : 
                    <li className="text-xs text-gray-500">无缓存存储</li>
                  }
                </ul>
              </div>
            )}
          </div>

          {/* 缓存响应头 */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4">📋 缓存响应头</h2>
            {debugInfo?.apiTests.timezone.cacheHeaders && (
              <div className="space-y-1 font-mono text-xs">
                {Object.entries(debugInfo.apiTests.timezone.cacheHeaders).map(([key, value]) => (
                  <div key={key}>
                    <strong>{key}:</strong> {String(value) || '(未设置)'}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* 错误信息 */}
          {debugInfo && debugInfo.errors.length > 0 && (
            <div className="bg-white rounded-lg shadow p-6 lg:col-span-2">
              <h2 className="text-xl font-semibold mb-4 text-red-600">❌ 错误信息</h2>
              <div className="space-y-2">
                {debugInfo.errors.map((error, index) => (
                  <div key={index} className="text-sm text-red-600 bg-red-50 p-2 rounded">
                    {error}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* 操作按钮 */}
        <div className="mt-8 flex flex-wrap gap-4">
          <button 
            onClick={collectDebugInfo}
            disabled={isLoading}
            className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700 disabled:opacity-50"
          >
            🔄 重新收集信息
          </button>
          
          <button 
            onClick={testCitySelection}
            className="bg-green-600 text-white px-6 py-2 rounded hover:bg-green-700"
          >
            🧪 测试城市选择
          </button>
          
          <button 
            onClick={clearAllCaches}
            className="bg-orange-600 text-white px-6 py-2 rounded hover:bg-orange-700"
          >
            🗑️ 清理所有缓存
          </button>
          
          <button 
            onClick={() => window.location.href = '/'}
            className="bg-purple-600 text-white px-6 py-2 rounded hover:bg-purple-700"
          >
            🏠 返回首页
          </button>
        </div>

        {/* 使用说明 */}
        <div className="mt-8 bg-blue-50 rounded-lg p-6">
          <h3 className="text-lg font-semibold mb-2">📖 使用说明</h3>
          <ol className="list-decimal list-inside space-y-1 text-sm">
            <li>首先查看环境信息确认当前环境</li>
            <li>检查API测试结果，确认接口是否正常</li>
            <li>查看缓存信息，了解缓存状态</li>
            <li>点击"测试城市选择"按钮，观察控制台输出</li>
            <li>如有问题，尝试"清理所有缓存"后重新测试</li>
          </ol>
          <p className="mt-2 text-xs text-gray-600">
            💡 提示: 打开浏览器开发者工具的Console标签查看详细日志
          </p>
        </div>
      </div>
    </div>
  );
}