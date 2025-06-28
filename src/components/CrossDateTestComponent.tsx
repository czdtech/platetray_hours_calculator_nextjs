/**
 * 跨日边界测试组件
 *
 * 用于演示和测试第三阶段的跨日边界无缝处理功能：
 * - 数据预取状态显示
 * - 缓存统计信息
 * - 活跃数据源指示
 * - 系统状态监控
 */

'use client';

import React from 'react';
import { useAdvancedPlanetaryTimeClock } from '@/hooks/useAdvancedPlanetaryTimeClock';
import { PlanetaryHoursCalculationResult } from '@/services/PlanetaryHoursCalculator';
import { AlertCircle, CheckCircle, Clock, Database, Wifi, WifiOff } from 'lucide-react';

// 简化的UI组件，暂时使用基础的div和span
const Card: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className = '' }) => (
  <div className={`bg-white rounded-lg border border-gray-200 shadow-sm ${className}`}>
    {children}
  </div>
);

const CardHeader: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className = '' }) => (
  <div className={`px-6 py-4 border-b border-gray-100 ${className}`}>
    {children}
  </div>
);

const CardTitle: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className = '' }) => (
  <h3 className={`font-semibold text-gray-900 ${className}`}>
    {children}
  </h3>
);

const CardContent: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className = '' }) => (
  <div className={`px-6 py-4 ${className}`}>
    {children}
  </div>
);

const Badge: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className = '' }) => (
  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${className}`}>
    {children}
  </span>
);

const Progress: React.FC<{ value: number; className?: string }> = ({ value, className = '' }) => (
  <div className={`w-full bg-gray-200 rounded-full ${className}`}>
    <div
      className="bg-blue-600 h-full rounded-full transition-all duration-300 ease-in-out"
      style={{ width: `${Math.min(100, Math.max(0, value))}%` }}
    />
  </div>
);

interface CrossDateTestComponentProps {
  data: PlanetaryHoursCalculationResult | null;
  coordinates: {
    latitude: number;
    longitude: number;
  } | null;
  currentDate: Date | null;
}

export function CrossDateTestComponent({
  data,
  coordinates,
  currentDate
}: CrossDateTestComponentProps) {
  const clockState = useAdvancedPlanetaryTimeClock({
    data,
    coordinates,
    currentDate,
    enableCrossDate: true,
    enablePreciseMode: true,
    prefetchThresholdMs: 30 * 60 * 1000 // 30分钟预取
  });

  const formatDuration = (ms: number): string => {
    if (ms <= 0) return '0秒';

    const hours = Math.floor(ms / (1000 * 60 * 60));
    const minutes = Math.floor((ms % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((ms % (1000 * 60)) / 1000);

    if (hours > 0) {
      return `${hours}小时${minutes}分钟`;
    } else if (minutes > 0) {
      return `${minutes}分钟${seconds}秒`;
    } else {
      return `${seconds}秒`;
    }
  };

  const getDataSourceBadgeColor = (source: string) => {
    switch (source) {
      case 'today': return 'bg-blue-500 text-white';
      case 'tomorrow': return 'bg-green-500 text-white';
      case 'yesterday': return 'bg-orange-500 text-white';
      default: return 'bg-gray-500 text-white';
    }
  };

  const getPrefetchStatusIcon = (status: string) => {
    switch (status) {
      case 'success': return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'prefetching': return <Clock className="h-4 w-4 text-blue-500 animate-spin" />;
      case 'error': return <AlertCircle className="h-4 w-4 text-red-500" />;
      default: return <Database className="h-4 w-4 text-gray-400" />;
    }
  };

  return (
    <div className="space-y-4 p-4">
      <h2 className="text-xl font-bold mb-4">🌅 第三阶段：跨日边界无缝处理测试</h2>

      {/* 当前行星时状态 */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center gap-2">
            <Clock className="h-5 w-5" />
            当前行星时状态
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <div className="text-sm text-gray-600">当前行星时</div>
              <div className="text-lg font-semibold">
                {clockState.currentHour ? (
                  `${clockState.currentHour.ruler} (第${clockState.currentHour.hourNumberOverall}时)`
                ) : (
                  <span className="text-gray-400">未在行星时内</span>
                )}
              </div>
            </div>
            <div>
              <div className="text-sm text-gray-600">下一个行星时</div>
              <div className="text-lg font-semibold">
                {clockState.nextHour ? (
                  `${clockState.nextHour.ruler} (第${clockState.nextHour.hourNumberOverall}时)`
                ) : (
                  <span className="text-gray-400">需要明日数据</span>
                )}
              </div>
            </div>
          </div>

          <div>
            <div className="text-sm text-gray-600 mb-1">
              剩余时间: {formatDuration(clockState.timeUntilNext)}
            </div>
            <Progress value={clockState.progressPercent} className="h-2" />
            <div className="text-xs text-gray-500 mt-1">
              进度: {clockState.progressPercent.toFixed(1)}%
            </div>
          </div>

          {clockState.isTransitioning && (
            <Badge className="bg-yellow-500 text-white">
              ⚡ 正在切换中
            </Badge>
          )}
        </CardContent>
      </Card>

      {/* 跨日处理状态 */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center gap-2">
            <Database className="h-5 w-5" />
            跨日处理状态
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-600">数据源:</span>
            <Badge className={getDataSourceBadgeColor(clockState.crossDateInfo.activeDataSource)}>
              {clockState.crossDateInfo.activeDataSource === 'today' && '今日'}
              {clockState.crossDateInfo.activeDataSource === 'tomorrow' && '明日'}
              {clockState.crossDateInfo.activeDataSource === 'yesterday' && '昨日'}
            </Badge>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="flex items-center gap-2">
              <span className="text-sm">明日数据:</span>
              {clockState.crossDateInfo.tomorrowDataAvailable ? (
                <CheckCircle className="h-4 w-4 text-green-500" />
              ) : (
                <AlertCircle className="h-4 w-4 text-gray-400" />
              )}
              <span className="text-xs text-gray-500">
                {clockState.crossDateInfo.tomorrowDataAvailable ? '已准备' : '未准备'}
              </span>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-sm">昨日数据:</span>
              {clockState.crossDateInfo.yesterdayDataAvailable ? (
                <CheckCircle className="h-4 w-4 text-green-500" />
              ) : (
                <AlertCircle className="h-4 w-4 text-gray-400" />
              )}
              <span className="text-xs text-gray-500">
                {clockState.crossDateInfo.yesterdayDataAvailable ? '已准备' : '未准备'}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-600">预取状态:</span>
            {getPrefetchStatusIcon(clockState.crossDateInfo.isPrefetchingTomorrow ? 'prefetching' : 'idle')}
            <span className="text-sm">
              {clockState.crossDateInfo.isPrefetchingTomorrow ? '正在预取明日数据' : '待机'}
            </span>
          </div>

          {clockState.crossDateInfo.isCrossDateSensitive && (
            <Badge className="bg-orange-500 text-white">
              🚨 跨日敏感期 - 即将切换到明日数据
            </Badge>
          )}
        </CardContent>
      </Card>

      {/* 缓存统计 */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg">📊 缓存统计</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <div className="text-2xl font-bold text-blue-600">
                {clockState.crossDateInfo.cacheStats.totalDays}
              </div>
              <div className="text-xs text-gray-600">缓存天数</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-green-600">
                {clockState.crossDateInfo.cacheStats.memoryUsage}KB
              </div>
              <div className="text-xs text-gray-600">内存使用</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-purple-600">
                {clockState.crossDateInfo.cacheStats.lastCleanup
                  ? new Date(clockState.crossDateInfo.cacheStats.lastCleanup).toLocaleTimeString()
                  : 'N/A'
                }
              </div>
              <div className="text-xs text-gray-600">上次清理</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 系统状态 */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center gap-2">
            {clockState.systemInfo.isOnline ? (
              <Wifi className="h-5 w-5 text-green-500" />
            ) : (
              <WifiOff className="h-5 w-5 text-red-500" />
            )}
            系统状态
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <div className="text-sm text-gray-600">工作模式</div>
              <Badge className={clockState.systemInfo.mode === 'precise' ? 'bg-green-500' : 'bg-blue-500'}>
                {clockState.systemInfo.mode === 'precise' ? '精确模式' : '标准模式'}
              </Badge>
            </div>
            <div>
              <div className="text-sm text-gray-600">连接状态</div>
              <Badge className={clockState.systemInfo.isOnline ? 'bg-green-500' : 'bg-red-500'}>
                {clockState.systemInfo.isOnline ? '在线' : '离线'}
              </Badge>
            </div>
          </div>

          <div>
            <div className="text-sm text-gray-600">最后更新</div>
            <div className="text-sm font-mono">
              {clockState.systemInfo.lastUpdate.toLocaleTimeString()}
            </div>
          </div>

          {clockState.systemInfo.hasIssues && (
            <div className="mt-3">
              <div className="text-sm text-gray-600 mb-2">系统问题:</div>
              <div className="space-y-1">
                {clockState.systemInfo.errors.map((error, index) => (
                  <div key={index} className="text-xs bg-red-50 text-red-700 p-2 rounded">
                    🚨 {error}
                  </div>
                ))}
                {clockState.systemInfo.warnings.map((warning, index) => (
                  <div key={index} className="text-xs bg-yellow-50 text-yellow-700 p-2 rounded">
                    ⚠️ {warning}
                  </div>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* 实时更新时间戳 */}
      <div className="text-xs text-gray-500 text-center">
        当前时间: {clockState.currentTime.toLocaleString()}
      </div>
    </div>
  );
}
