"use client";

import { useState, useEffect, useRef } from "react";

interface ApiCall {
  url: string;
  timestamp: number;
  method: string;
  status?: number;
}

export function ApiCallMonitor() {
  const [apiCalls, setApiCalls] = useState<ApiCall[]>([]);
  const [isVisible, setIsVisible] = useState<boolean>(false);
  const originalFetch = useRef<typeof fetch | undefined>(undefined);

  useEffect(() => {
    // 保存原始fetch函数，并绑定正确的上下文
    if (!originalFetch.current) {
      originalFetch.current = window.fetch.bind(window);
    }

    // 拦截fetch调用
    window.fetch = async (...args) => {
      const [url, options] = args;
      const method = options?.method || 'GET';
      const timestamp = Date.now();
      
      // 记录API调用
      if (typeof url === 'string' && url.includes('/api/')) {
        const newCall: ApiCall = {
          url,
          timestamp,
          method,
        };
        
        setApiCalls(prev => {
          const updated = [...prev, newCall].slice(-50); // 只保留最近50次调用
          return updated;
        });
      }

      try {
        const response = await originalFetch.current!(...args);
        
        // 更新状态码
        if (typeof url === 'string' && url.includes('/api/')) {
          setApiCalls(prev => 
            prev.map(call => 
              call.timestamp === timestamp && call.url === url 
                ? { ...call, status: response.status }
                : call
            )
          );
        }
        
        return response;
      } catch (error) {
        // 更新错误状态
        if (typeof url === 'string' && url.includes('/api/')) {
          setApiCalls(prev => 
            prev.map(call => 
              call.timestamp === timestamp && call.url === url 
                ? { ...call, status: 0 }
                : call
            )
          );
        }
        throw error;
      }
    };

    return () => {
      // 恢复原始fetch函数
      if (originalFetch.current) {
        window.fetch = originalFetch.current;
      }
    };
  }, []);

  // 计算统计信息
  const stats = {
    total: apiCalls.length,
    lastMinute: apiCalls.filter(call => Date.now() - call.timestamp < 60000).length,
    timezoneRequests: apiCalls.filter(call => call.url.includes('/api/maps/timezone')).length,
    timezoneLastMinute: apiCalls.filter(call => 
      call.url.includes('/api/maps/timezone') && Date.now() - call.timestamp < 60000
    ).length,
  };

  if (!isVisible) {
    return (
      <button
        onClick={() => setIsVisible(true)}
        className="fixed bottom-4 left-4 bg-red-500 text-white px-3 py-2 rounded-lg shadow-lg text-sm font-medium z-50 hover:bg-red-600 transition-colors"
        title="显示API调用监控"
      >
        🚨 API监控 ({stats.timezoneLastMinute}/min)
      </button>
    );
  }

  return (
    <div className="fixed bottom-4 left-4 bg-white border border-gray-300 rounded-lg shadow-xl p-4 max-w-md z-50">
      <div className="flex justify-between items-center mb-3">
        <h3 className="font-bold text-lg text-red-600">🚨 API调用监控</h3>
        <button
          onClick={() => setIsVisible(false)}
          className="text-gray-500 hover:text-gray-700"
        >
          ✕
        </button>
      </div>
      
      <div className="space-y-2 mb-4">
        <div className="grid grid-cols-2 gap-2 text-sm">
          <div className="bg-gray-50 p-2 rounded">
            <div className="font-medium">总调用数</div>
            <div className="text-lg font-bold">{stats.total}</div>
          </div>
          <div className="bg-yellow-50 p-2 rounded">
            <div className="font-medium">最近1分钟</div>
            <div className="text-lg font-bold text-yellow-600">{stats.lastMinute}</div>
          </div>
          <div className="bg-red-50 p-2 rounded">
            <div className="font-medium">时区API总数</div>
            <div className="text-lg font-bold text-red-600">{stats.timezoneRequests}</div>
          </div>
          <div className="bg-red-100 p-2 rounded">
            <div className="font-medium">时区API/分钟</div>
            <div className="text-lg font-bold text-red-700">{stats.timezoneLastMinute}</div>
          </div>
        </div>
      </div>

      <div className="max-h-40 overflow-y-auto">
        <h4 className="font-medium mb-2">最近调用记录:</h4>
        <div className="space-y-1 text-xs">
          {apiCalls.slice(-10).reverse().map((call, index) => (
            <div 
              key={`${call.timestamp}-${index}`}
              className={`p-2 rounded ${
                call.url.includes('/api/maps/timezone') 
                  ? 'bg-red-50 border border-red-200' 
                  : 'bg-gray-50'
              }`}
            >
              <div className="flex justify-between items-center">
                <span className="font-medium">
                  {call.method} {call.url.split('/').pop()}
                </span>
                <span className={`px-1 py-0.5 rounded text-xs ${
                  call.status === 200 ? 'bg-green-100 text-green-700' :
                  call.status === 0 ? 'bg-red-100 text-red-700' :
                  call.status ? 'bg-yellow-100 text-yellow-700' :
                  'bg-gray-100 text-gray-700'
                }`}>
                  {call.status || 'pending'}
                </span>
              </div>
              <div className="text-gray-500">
                {new Date(call.timestamp).toLocaleTimeString()}
              </div>
            </div>
          ))}
        </div>
      </div>

      {stats.timezoneLastMinute > 5 && (
        <div className="mt-3 p-2 bg-red-100 border border-red-300 rounded text-red-700 text-sm">
          ⚠️ 警告：时区API调用频率过高！可能存在无限循环。
        </div>
      )}
    </div>
  );
} 