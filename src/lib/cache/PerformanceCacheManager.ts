/**
 * 性能缓存管理器
 * 实现多级缓存策略：视图缓存、数据缓存、计算缓存
 */

// 缓存项接口
interface CacheItem<T> {
  data: T;
  timestamp: number;
  accessCount: number;
  lastAccess: number;
}

// 缓存配置接口
interface CacheConfig {
  maxSize: number;
  maxAge: number;
  enableMetrics: boolean;
}

// 内存监控接口
interface MemoryMetrics {
  usedJSHeapSize: number;
  totalJSHeapSize: number;
  jsHeapSizeLimit: number;
}

// 性能指标接口
export interface PerformanceMetrics {
  viewCache: { size: number; hitRate: number; evictions: number };
  dataCache: { size: number; hitRate: number; evictions: number };
  computationCache: { size: number; hitRate: number; evictions: number };
  memory: MemoryMetrics;
  totalCacheSize: number;
}

/**
 * 基础缓存类
 */
class BaseCache<T> {
  protected cache: Map<string, CacheItem<T>>;
  protected config: CacheConfig;
  protected hits = 0;
  protected misses = 0;
  protected evictions = 0;

  constructor(config: Partial<CacheConfig> = {}) {
    this.cache = new Map();
    this.config = {
      maxSize: 1000,
      maxAge: 30000, // 30秒
      enableMetrics: true,
      ...config
    };
  }

  get(key: string): T | null {
    const item = this.cache.get(key);

    if (!item) {
      this.misses++;
      return null;
    }

    const now = Date.now();

    // 检查是否过期
    if (now - item.timestamp > this.config.maxAge) {
      this.cache.delete(key);
      this.misses++;
      return null;
    }

    // 更新访问信息
    item.accessCount++;
    item.lastAccess = now;
    this.hits++;

    return item.data;
  }

  set(key: string, data: T): void {
    // 检查是否需要清理
    if (this.cache.size >= this.config.maxSize) {
      this.evictOldest();
    }

    const now = Date.now();
    this.cache.set(key, {
      data,
      timestamp: now,
      accessCount: 1,
      lastAccess: now
    });
  }

  has(key: string): boolean {
    return this.cache.has(key) && this.get(key) !== null;
  }

  delete(key: string): boolean {
    return this.cache.delete(key);
  }

  clear(): void {
    this.cache.clear();
    this.hits = 0;
    this.misses = 0;
    this.evictions = 0;
  }

  size(): number {
    return this.cache.size;
  }

  protected evictOldest(): void {
    if (this.cache.size === 0) return;

    let oldestKey = '';
    let oldestTime = Date.now();

    this.cache.forEach((item, key) => {
      // 使用 LRU 策略，优先删除最久未访问的项
      if (item.lastAccess < oldestTime) {
        oldestTime = item.lastAccess;
        oldestKey = key;
      }
    });

    if (oldestKey) {
      this.cache.delete(oldestKey);
      this.evictions++;
    }
  }

  // 基于使用频率的智能清理
  protected evictByFrequency(): void {
    const entries = Array.from(this.cache.entries());
    entries.sort((a, b) => {
      const scoreA = a[1].accessCount / (Date.now() - a[1].timestamp);
      const scoreB = b[1].accessCount / (Date.now() - b[1].timestamp);
      return scoreA - scoreB;
    });

    // 删除使用频率最低的 25%
    const evictCount = Math.floor(entries.length * 0.25);
    for (let i = 0; i < evictCount; i++) {
      this.cache.delete(entries[i][0]);
      this.evictions++;
    }
  }

  getMetrics() {
    const total = this.hits + this.misses;
    return {
      size: this.cache.size,
      hitRate: total > 0 ? this.hits / total : 0,
      evictions: this.evictions,
      hits: this.hits,
      misses: this.misses
    };
  }
}

/**
 * 视图缓存管理器
 * 缓存已渲染的 React 元素
 */
export class ViewCacheManager extends BaseCache<React.ReactElement> {
  constructor() {
    super({
      maxSize: 500, // 较小的缓存大小，因为 React 元素占用内存较多
      maxAge: 60000, // 1分钟
      enableMetrics: true
    });
  }

  // 为 React 元素优化的键生成
  generateKey(rowIndex: number, diffType: string, cellChanges: string, props: any): string {
    const propsHash = this.hashObject(props);
    return `${rowIndex}-${diffType}-${cellChanges}-${propsHash}`;
  }

  private hashObject(obj: any): string {
    const str = JSON.stringify(obj);
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // 转换为 32 位整数
    }
    return hash.toString(36);
  }
}

/**
 * 数据缓存管理器
 * 缓存处理后的数据
 */
export class DataCacheManager extends BaseCache<any[]> {
  constructor() {
    super({
      maxSize: 2000, // 中等大小的缓存
      maxAge: 300000, // 5分钟
      enableMetrics: true
    });
  }

  // 为数据行生成键
  generateRowKey(rowIndex: number, dataHash: string): string {
    return `row-${rowIndex}-${dataHash}`;
  }

  // 为数据块生成键（用于批量操作）
  generateBlockKey(startIndex: number, endIndex: number, dataHash: string): string {
    return `block-${startIndex}-${endIndex}-${dataHash}`;
  }

  // 批量预加载
  preloadBatch(keys: string[], dataProvider: (key: string) => any[]): void {
    keys.forEach(key => {
      if (!this.has(key)) {
        const index = parseInt(key.split('-')[1]);
        if (!isNaN(index)) {
          const data = dataProvider(key);
          if (data) {
            this.set(key, data);
          }
        }
      }
    });
  }
}

/**
 * 计算缓存管理器
 * 缓存计算结果，如差异检测、格式化等
 */
export class ComputationCacheManager extends BaseCache<any> {
  constructor() {
    super({
      maxSize: 1500, // 中等大小的缓存
      maxAge: 600000, // 10分钟
      enableMetrics: true
    });
  }

  // 为单元格差异计算生成键
  generateCellDiffKey(row1Hash: string, row2Hash: string, columnIndex: number): string {
    return `celldiff-${row1Hash}-${row2Hash}-${columnIndex}`;
  }

  // 为行差异计算生成键
  generateRowDiffKey(row1Hash: string, row2Hash: string): string {
    return `rowdiff-${row1Hash}-${row2Hash}`;
  }

  // 为格式化计算生成键
  generateFormatKey(value: any, formatType: string): string {
    const valueHash = this.hashValue(value);
    return `format-${formatType}-${valueHash}`;
  }

  private hashValue(value: any): string {
    if (typeof value === 'object' && value !== null) {
      return JSON.stringify(value);
    }
    return String(value);
  }
}

/**
 * 内存监控器
 */
export class MemoryMonitor {
  private lastMetrics: MemoryMetrics | null = null;
  private threshold = 0.8; // 80% 内存使用率阈值

  constructor(threshold: number = 0.8) {
    this.threshold = threshold;
  }

  getCurrentMetrics(): MemoryMetrics {
    if (typeof performance !== 'undefined' && (performance as any).memory) {
      return (performance as any).memory;
    }

    // 如果不支持 performance.memory，返回估算值
    return {
      usedJSHeapSize: 50 * 1024 * 1024, // 50MB 估算
      totalJSHeapSize: 100 * 1024 * 1024, // 100MB 估算
      jsHeapSizeLimit: 2048 * 1024 * 1024 // 2GB 估算
    };
  }

  getUsageRatio(): number {
    const metrics = this.getCurrentMetrics();
    return metrics.usedJSHeapSize / metrics.jsHeapSizeLimit;
  }

  isMemoryPressureHigh(): boolean {
    return this.getUsageRatio() > this.threshold;
  }

  shouldTriggerCleanup(): boolean {
    const current = this.getCurrentMetrics();

    if (!this.lastMetrics) {
      this.lastMetrics = current;
      return false;
    }

    // 检查内存增长趋势
    const growthRatio = current.usedJSHeapSize / this.lastMetrics.usedJSHeapSize;
    this.lastMetrics = current;

    // 如果内存增长超过 20% 且使用率超过阈值，触发清理
    return growthRatio > 1.2 && this.getUsageRatio() > this.threshold;
  }
}

/**
 * 综合性能缓存管理器
 */
export class PerformanceCacheManager {
  private viewCache: ViewCacheManager;
  private dataCache: DataCacheManager;
  private computationCache: ComputationCacheManager;
  private memoryMonitor: MemoryMonitor;
  private cleanupInterval: NodeJS.Timeout | null = null;

  constructor() {
    this.viewCache = new ViewCacheManager();
    this.dataCache = new DataCacheManager();
    this.computationCache = new ComputationCacheManager();
    this.memoryMonitor = new MemoryMonitor(0.8);

    // 启动定期清理
    this.startPeriodicCleanup();
  }

  // 缓存访问器
  get view() { return this.viewCache; }
  get data() { return this.dataCache; }
  get computation() { return this.computationCache; }

  // 获取综合性能指标
  getMetrics(): PerformanceMetrics {
    const memory = this.memoryMonitor.getCurrentMetrics();

    return {
      viewCache: this.viewCache.getMetrics(),
      dataCache: this.dataCache.getMetrics(),
      computationCache: this.computationCache.getMetrics(),
      memory,
      totalCacheSize: this.viewCache.size() + this.dataCache.size() + this.computationCache.size()
    };
  }

  // 智能清理策略
  performIntelligentCleanup(): void {
    if (!this.memoryMonitor.shouldTriggerCleanup()) {
      return;
    }

    // 根据内存压力选择清理策略
    const memoryUsage = this.memoryMonitor.getUsageRatio();

    if (memoryUsage > 0.9) {
      // 高内存压力：清理所有缓存
      this.emergencyCleanup();
    } else if (memoryUsage > 0.8) {
      // 中等压力：清理最旧的缓存
      this.moderateCleanup();
    } else {
      // 轻微压力：清理过期的缓存
      this.lightCleanup();
    }

    }

  private emergencyCleanup(): void {
    this.viewCache.clear();
    this.dataCache.clear();
    this.computationCache.clear();
  }

  private moderateCleanup(): void {
    // 清理最旧的 50%
    (this.viewCache as any).evictByFrequency?.() || this.viewCache.clear();
    (this.dataCache as any).evictByFrequency?.() || this.dataCache.clear();
    (this.computationCache as any).evictByFrequency?.() || this.computationCache.clear();
  }

  private lightCleanup(): void {
    // 只清理过期的项，通过重新设置触发清理机制
    const currentConfig = {
      maxSize: 100,
      maxAge: 1000 // 很短的时间，强制清理过期项
    };

    // 临时设置并触发清理
    const tempViewCache = new ViewCacheManager();
    const tempDataCache = new DataCacheManager();
    const tempCompCache = new ComputationCacheManager();
  }

  // 启动定期清理
  private startPeriodicCleanup(): void {
    this.cleanupInterval = setInterval(() => {
      this.performIntelligentCleanup();
    }, 30000); // 每 30 秒检查一次
  }

  // 停止定期清理
  stopPeriodicCleanup(): void {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
      this.cleanupInterval = null;
    }
  }

  // 手动清理所有缓存
  clearAll(): void {
    this.viewCache.clear();
    this.dataCache.clear();
    this.computationCache.clear();
  }

  // 销毁管理器
  destroy(): void {
    this.stopPeriodicCleanup();
    this.clearAll();
  }
}

// 全局缓存管理器实例
export const globalCacheManager = new PerformanceCacheManager();