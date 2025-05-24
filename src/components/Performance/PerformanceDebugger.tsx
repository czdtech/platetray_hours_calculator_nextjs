"use client";

import { useState, useEffect } from 'react';

interface PerformanceEntry {
  metric: string;
  value: number;
  rating: string;
  pathname: string;
  timestamp: number;
}

/**
 * 性能调试器组件
 * 提供性能数据的可视化界面
 */
export function PerformanceDebugger() {
  const [isOpen, setIsOpen] = useState(false);
  const [performanceData, setPerformanceData] = useState<PerformanceEntry[]>([]);
  const [currentMetrics, setCurrentMetrics] = useState<Record<string, any>>({});

  useEffect(() => {
    const loadPerformanceData = () => {
      const historyKey = 'performance-history';
      const history = JSON.parse(localStorage.getItem(historyKey) || '[]');
      setPerformanceData(history);
    };

    loadPerformanceData();

    // 定期更新数据
    const interval = setInterval(loadPerformanceData, 2000);
    return () => clearInterval(interval);
  }, []);

  const clearPerformanceData = () => {
    localStorage.removeItem('performance-history');
    setPerformanceData([]);
    console.log('🗑️ [Performance] 性能数据已清除');
  };

  const exportData = () => {
    const dataStr = JSON.stringify(performanceData, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `performance-data-${Date.now()}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const getLatestMetrics = () => {
    const metrics: Record<string, PerformanceEntry> = {};
    performanceData.forEach(entry => {
      if (!metrics[entry.metric] || entry.timestamp > metrics[entry.metric].timestamp) {
        metrics[entry.metric] = entry;
      }
    });
    return metrics;
  };

  const getMetricColor = (rating: string) => {
    switch (rating) {
      case 'good': return 'text-green-600';
      case 'needs-improvement': return 'text-yellow-600';
      case 'poor': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  const latestMetrics = getLatestMetrics();

  // 只在开发环境中显示
  if (process.env.NODE_ENV !== 'development') {
    return null;
  }

  return (
    <>
      {/* 浮动按钮 */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-4 right-4 z-50 bg-purple-600 hover:bg-purple-700 text-white p-3 rounded-full shadow-lg transition-colors duration-200"
        title="性能调试器"
      >
        📊
      </button>

      {/* 调试面板 */}
      {isOpen && (
        <div className="fixed inset-0 z-40 bg-black bg-opacity-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[80vh] overflow-hidden">
            <div className="flex items-center justify-between p-4 border-b">
              <h2 className="text-xl font-bold text-gray-800">性能调试器</h2>
              <div className="flex gap-2">
                <button
                  onClick={exportData}
                  className="px-3 py-1 bg-blue-600 text-white rounded text-sm hover:bg-blue-700"
                >
                  导出数据
                </button>
                <button
                  onClick={clearPerformanceData}
                  className="px-3 py-1 bg-red-600 text-white rounded text-sm hover:bg-red-700"
                >
                  清除数据
                </button>
                <button
                  onClick={() => setIsOpen(false)}
                  className="px-3 py-1 bg-gray-600 text-white rounded text-sm hover:bg-gray-700"
                >
                  关闭
                </button>
              </div>
            </div>

            <div className="p-4 overflow-y-auto max-h-[calc(80vh-120px)]">
              {/* 当前指标概览 */}
              <div className="mb-6">
                <h3 className="text-lg font-semibold mb-3">当前性能指标</h3>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {Object.entries(latestMetrics).map(([metric, data]) => (
                    <div key={metric} className="bg-gray-50 p-3 rounded-lg">
                      <div className="text-sm font-medium text-gray-600">{metric}</div>
                      <div className={`text-lg font-bold ${getMetricColor(data.rating)}`}>
                        {data.value.toFixed(2)}ms
                      </div>
                      <div className="text-xs text-gray-500 capitalize">{data.rating}</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* 性能历史 */}
              <div>
                <h3 className="text-lg font-semibold mb-3">性能历史 ({performanceData.length} 条记录)</h3>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="bg-gray-100">
                        <th className="text-left p-2">时间</th>
                        <th className="text-left p-2">页面</th>
                        <th className="text-left p-2">指标</th>
                        <th className="text-left p-2">值</th>
                        <th className="text-left p-2">评级</th>
                      </tr>
                    </thead>
                    <tbody>
                      {performanceData.slice(-20).reverse().map((entry, index) => (
                        <tr key={index} className="border-b">
                          <td className="p-2 text-gray-600">
                            {new Date(entry.timestamp).toLocaleTimeString()}
                          </td>
                          <td className="p-2 text-gray-800 font-mono text-xs">
                            {entry.pathname}
                          </td>
                          <td className="p-2 font-medium">{entry.metric}</td>
                          <td className="p-2">{entry.value.toFixed(2)}ms</td>
                          <td className={`p-2 capitalize ${getMetricColor(entry.rating)}`}>
                            {entry.rating}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* 性能建议 */}
              <div className="mt-6">
                <h3 className="text-lg font-semibold mb-3">性能建议</h3>
                <div className="bg-blue-50 p-4 rounded-lg">
                  <ul className="text-sm space-y-2">
                    <li>• 在控制台中运行 <code className="bg-gray-200 px-1 rounded">exportPerformanceData()</code> 获取详细报告</li>
                    <li>• 关注CLS值，确保布局稳定性</li>
                    <li>• 监控LCP，优化最大内容绘制时间</li>
                    <li>• 使用Network面板分析资源加载</li>
                    <li>• 使用Performance面板分析渲染性能</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}