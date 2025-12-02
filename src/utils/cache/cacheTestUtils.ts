/**
 * 缓存测试工具
 *
 * 用于验证动态TTL策略在不同行星时状态下的行为
 */

import { PlanetaryHoursCalculationResult } from '@/services/PlanetaryHoursCalculator';
import { calculateDynamicTTL, TTLCalculationResult } from './dynamicTTL';
import { createLogger } from '@/utils/unified-logger';

const logger = createLogger('CacheTestUtils');

export interface TTLTestScenario {
  name: string;
  description: string;
  testTime: Date;
  expectedBehavior: 'normal' | 'sensitive' | 'cross-day';
  expectedTTLRange: {
    min: number;
    max: number;
  };
}

/**
 * 生成测试场景
 * 模拟不同时间点访问页面时的TTL计算结果
 */
export function generateTestScenarios(planetaryData: PlanetaryHoursCalculationResult): TTLTestScenario[] {
  const { planetaryHours } = planetaryData;

  const scenarios: TTLTestScenario[] = [];

  // 为每个行星时生成测试场景
  planetaryHours.forEach((hour) => {
    const startTime = hour.startTime.getTime();
    const endTime = hour.endTime.getTime();
    const duration = endTime - startTime;

    // 场景1：行星时开始后10分钟（正常期）
    scenarios.push({
      name: `${hour.ruler}_start_10min`,
      description: `${hour.ruler}行星时开始后10分钟 (正常期)`,
      testTime: new Date(startTime + 10 * 60 * 1000),
      expectedBehavior: 'normal',
      expectedTTLRange: {
        min: Math.floor((duration - 13 * 60 * 1000) / 1000), // 剩余时间 - 安全边际
        max: 7200 // 最大2小时
      }
    });

    // 场景2：行星时结束前3分钟（敏感期）
    scenarios.push({
      name: `${hour.ruler}_end_3min`,
      description: `${hour.ruler}行星时结束前3分钟 (敏感期)`,
      testTime: new Date(endTime - 3 * 60 * 1000),
      expectedBehavior: 'sensitive',
      expectedTTLRange: {
        min: 30,
        max: 30
      }
    });

    // 场景3：行星时中间时间（正常期）
    scenarios.push({
      name: `${hour.ruler}_middle`,
      description: `${hour.ruler}行星时中间时间 (正常期)`,
      testTime: new Date(startTime + duration / 2),
      expectedBehavior: 'normal',
      expectedTTLRange: {
        min: Math.floor((duration / 2 - 3 * 60 * 1000) / 1000),
        max: 7200
      }
    });
  });

  // 场景4：在第一个行星时之前（跨日边界）
  const firstHour = planetaryHours[0];
  scenarios.push({
    name: 'before_first_hour',
    description: '第一个行星时之前 (跨日边界)',
    testTime: new Date(firstHour.startTime.getTime() - 30 * 60 * 1000),
    expectedBehavior: 'cross-day',
    expectedTTLRange: {
      min: 600, // 10分钟
      max: 600
    }
  });

  return scenarios;
}

/**
 * 执行TTL测试
 * 对所有场景进行TTL计算并验证结果
 */
export function runTTLTests(
  planetaryData: PlanetaryHoursCalculationResult,
  scenarios?: TTLTestScenario[]
): TTLTestResult[] {
  const testScenarios = scenarios || generateTestScenarios(planetaryData);
  const results: TTLTestResult[] = [];

  logger.info(`开始TTL测试，共${testScenarios.length}个场景`);

  testScenarios.forEach(scenario => {
    try {
      const ttlResult = calculateDynamicTTL(planetaryData, scenario.testTime);

      const isWithinRange =
        ttlResult.ttlSeconds >= scenario.expectedTTLRange.min &&
        ttlResult.ttlSeconds <= scenario.expectedTTLRange.max;

      const behaviorMatches =
        (scenario.expectedBehavior === 'sensitive' && ttlResult.isSensitivePeriod) ||
        (scenario.expectedBehavior === 'normal' && !ttlResult.isSensitivePeriod) ||
        (scenario.expectedBehavior === 'cross-day' && ttlResult.details.currentHourIndex === -1);

      const result: TTLTestResult = {
        scenario,
        ttlResult,
        passed: isWithinRange && behaviorMatches,
        issues: []
      };

      if (!isWithinRange) {
        result.issues.push(`TTL ${ttlResult.ttlSeconds}秒超出预期范围 ${scenario.expectedTTLRange.min}-${scenario.expectedTTLRange.max}秒`);
      }

      if (!behaviorMatches) {
        result.issues.push(`行为不匹配：预期 ${scenario.expectedBehavior}，实际 ${ttlResult.isSensitivePeriod ? 'sensitive' : 'normal'}`);
      }

      results.push(result);

      logger.info(`场景 ${scenario.name}: ${result.passed ? '✅ 通过' : '❌ 失败'}`, {
        ttl: ttlResult.ttlSeconds,
        expected: scenario.expectedTTLRange,
        issues: result.issues
      });

    } catch (error) {
      const result: TTLTestResult = {
        scenario,
        ttlResult: null,
        passed: false,
        issues: [`计算错误: ${error instanceof Error ? error.message : String(error)}`]
      };

      results.push(result);
      logger.error(`场景 ${scenario.name}: ❌ 错误`, error instanceof Error ? error : new Error(String(error)));
    }
  });

  const passedCount = results.filter(r => r.passed).length;
  logger.info(`TTL测试完成: ${passedCount}/${results.length} 通过`);

  return results;
}

export interface TTLTestResult {
  scenario: TTLTestScenario;
  ttlResult: TTLCalculationResult | null;
  passed: boolean;
  issues: string[];
}

/**
 * 打印测试报告
 */
export function printTestReport(results: TTLTestResult[]): void {
  console.log('\n📊 TTL测试报告');
  console.log('================');

  const passed = results.filter(r => r.passed).length;
  const total = results.length;

  console.log(`\n总体结果: ${passed}/${total} 通过 (${Math.round(passed/total*100)}%)`);

  console.log('\n✅ 通过的测试:');
  results.filter(r => r.passed).forEach(result => {
    console.log(`  - ${result.scenario.name}: ${result.ttlResult?.ttlSeconds}秒`);
  });

  console.log('\n❌ 失败的测试:');
  results.filter(r => !r.passed).forEach(result => {
    console.log(`  - ${result.scenario.name}:`);
    result.issues.forEach(issue => {
      console.log(`    • ${issue}`);
    });
  });

  console.log('\n');
}

/**
 * 模拟一天中的TTL变化
 * 用于可视化缓存策略的动态特性
 */
export function simulateDailyTTLChanges(
  planetaryData: PlanetaryHoursCalculationResult,
  intervalMinutes: number = 15
): DailyTTLPoint[] {
  const points: DailyTTLPoint[] = [];
  const { planetaryHours } = planetaryData;

  if (planetaryHours.length === 0) return points;

  const startTime = planetaryHours[0].startTime.getTime();
  const endTime = planetaryHours[planetaryHours.length - 1].endTime.getTime();
  const intervalMs = intervalMinutes * 60 * 1000;

  for (let time = startTime; time <= endTime; time += intervalMs) {
    const testTime = new Date(time);
    const ttlResult = calculateDynamicTTL(planetaryData, testTime);

    points.push({
      time: testTime,
      ttlSeconds: ttlResult.ttlSeconds,
      isSensitive: ttlResult.isSensitivePeriod,
      currentHourIndex: ttlResult.details.currentHourIndex,
      remainingMinutes: Math.round(ttlResult.remainingMs / 1000 / 60)
    });
  }

  return points;
}

export interface DailyTTLPoint {
  time: Date;
  ttlSeconds: number;
  isSensitive: boolean;
  currentHourIndex: number;
  remainingMinutes: number;
}

/**
 * 测试多地点缓存隔离
 */
export function testMultiLocationCacheIsolation() {
  console.log('🌍 开始测试多地点缓存隔离...');

  const testDate = new Date('2025-06-28T12:00:00Z');

  // 测试不同城市的缓存键生成
  const locations = [
    { name: '纽约', lat: 40.7128, lng: -74.0060, tz: 'America/New_York' },
    { name: '洛杉矶', lat: 34.0522, lng: -118.2437, tz: 'America/Los_Angeles' },
    { name: '伦敦', lat: 51.5074, lng: -0.1278, tz: 'Europe/London' },
    { name: '东京', lat: 35.6762, lng: 139.6503, tz: 'Asia/Tokyo' },
    { name: '悉尼', lat: -33.8688, lng: 151.2093, tz: 'Australia/Sydney' }
  ];

  // 模拟MemoryCache的generateKey方法
  const generateKey = (date: Date, latitude: number, longitude: number, timezone: string): string => {
    const dateStr = date.toISOString().split('T')[0];
    const latRounded = Math.round(latitude * 1000) / 1000;
    const lonRounded = Math.round(longitude * 1000) / 1000;
    return `${dateStr}_${latRounded}_${lonRounded}_${timezone}`;
  };

  const cacheKeys = locations.map(loc => ({
    location: loc.name,
    key: generateKey(testDate, loc.lat, loc.lng, loc.tz)
  }));

  console.log('📍 各地点缓存键：');
  cacheKeys.forEach(({ location, key }) => {
    console.log(`  ${location}: ${key}`);
  });

  // 验证所有缓存键都不相同
  const uniqueKeys = new Set(cacheKeys.map(item => item.key));
  const allUnique = uniqueKeys.size === cacheKeys.length;

  console.log(`✅ 缓存键唯一性检查: ${allUnique ? '通过' : '失败'}`);
  console.log(`   生成了 ${cacheKeys.length} 个键，其中 ${uniqueKeys.size} 个唯一`);

  // 测试同城不同精度的情况
  console.log('\n🏙️ 测试同城不同位置：');
  const manhattanCenter = { lat: 40.7580, lng: -73.9855 }; // 时代广场
  const manhattanEast = { lat: 40.7505, lng: -73.9934 };   // 帝国大厦
  const brooklyn = { lat: 40.6782, lng: -73.9442 };        // 布鲁克林

  const nycKeys = [
    { name: '时代广场', key: generateKey(testDate, manhattanCenter.lat, manhattanCenter.lng, 'America/New_York') },
    { name: '帝国大厦', key: generateKey(testDate, manhattanEast.lat, manhattanEast.lng, 'America/New_York') },
    { name: '布鲁克林', key: generateKey(testDate, brooklyn.lat, brooklyn.lng, 'America/New_York') }
  ];

  nycKeys.forEach(({ name, key }) => {
    console.log(`  ${name}: ${key}`);
  });

  const nycUniqueKeys = new Set(nycKeys.map(item => item.key));
  console.log(`✅ 纽约不同区域隔离检查: ${nycUniqueKeys.size === nycKeys.length ? '通过' : '失败'}`);

  return {
    multiLocationIsolation: allUnique,
    sameCityIsolation: nycUniqueKeys.size === nycKeys.length,
    totalLocations: cacheKeys.length,
    uniqueKeys: uniqueKeys.size
  };
}
