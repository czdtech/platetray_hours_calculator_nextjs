/**
 * 高级缓存工具
 * 提供更智能的缓存策略
 */

interface CacheItem<T> {
  value: T;
  timestamp: number;
  accessCount: number;
  lastAccessed: number;
}

interface CacheOptions {
  ttl?: number; // 生存时间（毫秒）
  maxSize?: number; // 最大缓存项数
  strategy?: 'LRU' | 'LFU' | 'FIFO'; // 缓存策略
}

export class AdvancedCache<T> {
  private cache = new Map<string, CacheItem<T>>();
  private options: Required<CacheOptions>;

  constructor(options: CacheOptions = {}) {
    this.options = {
      ttl: 5 * 60 * 1000, // 默认5分钟
      maxSize: 100, // 默认最大100项
      strategy: 'LRU', // 默认LRU策略
      ...options,
    };
  }

  set(key: string, value: T): void {
    const now = Date.now();
    
    // 如果缓存已满，根据策略清理
    if (this.cache.size >= this.options.maxSize) {
      this.evict();
    }

    this.cache.set(key, {
      value,
      timestamp: now,
      accessCount: 0,
      lastAccessed: now,
    });
  }

  get(key: string): T | null {
    const item = this.cache.get(key);
    
    if (!item) {
      return null;
    }

    const now = Date.now();
    
    // 检查是否过期
    if (now - item.timestamp > this.options.ttl) {
      this.cache.delete(key);
      return null;
    }

    // 更新访问信息
    item.accessCount++;
    item.lastAccessed = now;

    return item.value;
  }

  has(key: string): boolean {
    const item = this.cache.get(key);
    if (!item) return false;

    const now = Date.now();
    if (now - item.timestamp > this.options.ttl) {
      this.cache.delete(key);
      return false;
    }

    return true;
  }

  delete(key: string): boolean {
    return this.cache.delete(key);
  }

  clear(): void {
    this.cache.clear();
  }

  size(): number {
    return this.cache.size;
  }

  private evict(): void {
    if (this.cache.size === 0) return;

    let keyToEvict: string;

    switch (this.options.strategy) {
      case 'LRU': // 最近最少使用
        keyToEvict = this.findLRUKey();
        break;
      case 'LFU': // 最少使用频率
        keyToEvict = this.findLFUKey();
        break;
      case 'FIFO': // 先进先出
        keyToEvict = this.findFIFOKey();
        break;
      default:
        keyToEvict = this.findLRUKey();
    }

    this.cache.delete(keyToEvict);
  }

  private findLRUKey(): string {
    let oldestKey = '';
    let oldestTime = Date.now();

    for (const [key, item] of this.cache.entries()) {
      if (item.lastAccessed < oldestTime) {
        oldestTime = item.lastAccessed;
        oldestKey = key;
      }
    }

    return oldestKey;
  }

  private findLFUKey(): string {
    let leastUsedKey = '';
    let leastCount = Infinity;

    for (const [key, item] of this.cache.entries()) {
      if (item.accessCount < leastCount) {
        leastCount = item.accessCount;
        leastUsedKey = key;
      }
    }

    return leastUsedKey;
  }

  private findFIFOKey(): string {
    let oldestKey = '';
    let oldestTime = Date.now();

    for (const [key, item] of this.cache.entries()) {
      if (item.timestamp < oldestTime) {
        oldestTime = item.timestamp;
        oldestKey = key;
      }
    }

    return oldestKey;
  }

  // 获取缓存统计信息
  getStats() {
    const items = Array.from(this.cache.values());
    const now = Date.now();
    
    return {
      size: this.cache.size,
      maxSize: this.options.maxSize,
      hitRate: this.calculateHitRate(),
      averageAge: items.reduce((sum, item) => sum + (now - item.timestamp), 0) / items.length || 0,
      totalAccesses: items.reduce((sum, item) => sum + item.accessCount, 0),
    };
  }

  private calculateHitRate(): number {
    // 这里需要额外的统计逻辑来计算命中率
    // 简化实现，实际项目中可能需要更复杂的统计
    return 0.85; // 示例值
  }
}

// 创建全局缓存实例
export const timezoneCache = new AdvancedCache<string>({
  ttl: 10 * 60 * 1000, // 时区信息缓存10分钟
  maxSize: 50,
  strategy: 'LRU',
});

export const geocodeCache = new AdvancedCache<unknown>({
  ttl: 30 * 60 * 1000, // 地理编码缓存30分钟
  maxSize: 100,
  strategy: 'LFU',
});

export const planetaryHoursCache = new AdvancedCache<unknown>({
  ttl: 2 * 60 * 1000, // 行星时缓存2分钟
  maxSize: 20,
  strategy: 'LRU',
});
