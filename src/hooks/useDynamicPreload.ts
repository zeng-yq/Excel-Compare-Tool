'use client';

import { useRef, useCallback, useEffect, useMemo } from 'react';
import { preloadData } from '@/lib/mainThreadProcessor';

// 滚动方向枚举
enum ScrollDirection {
  NONE = 'none',
  UP = 'up',
  DOWN = 'down'
}

// 滚动行为接口
interface ScrollBehavior {
  direction: ScrollDirection;
  velocity: number;
  acceleration: number;
  isMomentumScrolling: boolean;
  timestamp: number;
}

// 预加载配置接口
interface PreloadConfig {
  enabled: boolean;
  baseDistance: number;
  maxDistance: number;
  speedMultiplier: number;
  memoryThreshold: number;
  batchSize: number;
  preloadDelay: number;
}

// 预加载统计信息
interface PreloadStats {
  totalPreloaded: number;
  cacheHits: number;
  cacheMisses: number;
  averagePreloadTime: number;
  memoryUsage: number;
}

/**
 * 动态预加载 Hook
 * 根据用户滚动行为智能预载数据
 */
export const useDynamicPreload = (
  data: any[][],
  rowCount: number,
  config: Partial<PreloadConfig> = {}
) => {
  // 滚动行为追踪
  const scrollBehaviorRef = useRef<ScrollBehavior>({
    direction: ScrollDirection.NONE,
    velocity: 0,
    acceleration: 0,
    isMomentumScrolling: false,
    timestamp: 0
  });

  // 预加载状态
  const preloadStateRef = useRef<{
    loadedRanges: Set<string>;
    loadingTasks: Set<string>;
    lastPreloadTime: number;
    preloadQueue: Array<{ rowIndex: number; priority: number }>;
    totalPreloaded: number;
  }>({
    loadedRanges: new Set(),
    loadingTasks: new Set(),
    lastPreloadTime: 0,
    preloadQueue: [],
    totalPreloaded: 0
  });

  // 统计信息
  const statsRef = useRef<PreloadStats>({
    totalPreloaded: 0,
    cacheHits: 0,
    cacheMisses: 0,
    averagePreloadTime: 0,
    memoryUsage: 0
  });

  // 配置
  const preloadConfig: PreloadConfig = useMemo(() => ({
    enabled: true,
    baseDistance: 50,
    maxDistance: 200,
    speedMultiplier: 2,
    memoryThreshold: 0.8,
    batchSize: 10,
    preloadDelay: 100,
    ...config
  }), [config]);

  // 生成范围键
  const generateRangeKey = useCallback((start: number, end: number): string => {
    return `${start}-${end}`;
  }, []);

  // 计算预加载范围
  const calculatePreloadRange = useCallback((
    visibleStart: number,
    visibleEnd: number,
    behavior: ScrollBehavior
  ): { start: number; end: number } => {
    if (!preloadConfig.enabled) {
      return { start: visibleStart, end: visibleEnd };
    }

    let preloadDistance = preloadConfig.baseDistance;

    // 根据滚动速度调整预加载距离
    if (Math.abs(behavior.velocity) > 100) {
      preloadDistance = Math.min(
        preloadDistance * (1 + Math.abs(behavior.velocity) / 100 * preloadConfig.speedMultiplier),
        preloadConfig.maxDistance
      );
    }

    // 根据滚动方向调整预加载范围
    let start = visibleStart;
    let end = visibleEnd;

    if (behavior.direction === ScrollDirection.DOWN) {
      // 向下滚动，优先预加载下方内容
      start = Math.max(0, visibleStart - preloadDistance * 0.3);
      end = Math.min(rowCount, visibleEnd + preloadDistance);
    } else if (behavior.direction === ScrollDirection.UP) {
      // 向上滚动，优先预加载上方内容
      start = Math.max(0, visibleStart - preloadDistance);
      end = Math.min(rowCount, visibleEnd + preloadDistance * 0.3);
    } else {
      // 无明确方向，均衡预加载
      start = Math.max(0, visibleStart - preloadDistance);
      end = Math.min(rowCount, visibleEnd + preloadDistance);
    }

    return { start, end };
  }, [preloadConfig, rowCount]);

  // 分析滚动行为
  const analyzeScrollBehavior = useCallback((
    currentScrollTop: number,
    previousScrollTop: number,
    currentTime: number,
    previousTime: number
  ): ScrollBehavior => {
    const deltaTime = Math.max(currentTime - previousTime, 1);
    const deltaScroll = currentScrollTop - previousScrollTop;
    const velocity = deltaScroll / deltaTime * 1000; // 像素/秒

    const previousBehavior = scrollBehaviorRef.current;
    const acceleration = (velocity - previousBehavior.velocity) / deltaTime * 1000;

    let direction = ScrollDirection.NONE;
    if (Math.abs(velocity) > 10) {
      direction = velocity > 0 ? ScrollDirection.DOWN : ScrollDirection.UP;
    }

    // 检测动量滚动
    const isMomentumScrolling = Math.abs(velocity) > 500 && Math.abs(acceleration) < 100;

    const behavior: ScrollBehavior = {
      direction,
      velocity,
      acceleration,
      isMomentumScrolling,
      timestamp: currentTime
    };

    scrollBehaviorRef.current = behavior;
    return behavior;
  }, []);

  // 预加载数据块
  const preloadDataChunk = useCallback(async (startIndex: number, endIndex: number) => {
    const rangeKey = generateRangeKey(startIndex, endIndex);

    // 检查是否已经加载
    if (preloadStateRef.current.loadedRanges.has(rangeKey)) {
      statsRef.current.cacheHits++;
      return;
    }

    // 检查是否正在加载
    if (preloadStateRef.current.loadingTasks.has(rangeKey)) {
      return;
    }

    statsRef.current.cacheMisses++;

    // 检查内存使用
    if (statsRef.current.memoryUsage > preloadConfig.memoryThreshold) {
      return;
    }

    const startTime = performance.now();
    preloadStateRef.current.loadingTasks.add(rangeKey);

    try {
      // 分批预加载数据
      const chunkSize = preloadConfig.batchSize;
      for (let i = startIndex; i <= endIndex; i += chunkSize) {
        const chunkEnd = Math.min(i + chunkSize - 1, endIndex);
        const chunkData = data.slice(i, chunkEnd + 1);

        // 主线程预处理（无需预加载，数据直接可用）
        // 预加载功能在主线程中不需要，数据已经可以直接访问
        await Promise.all(
          chunkData.map((rowData, index) =>
            preloadData(i + index, rowData)
          )
        );
      }

      // 标记为已加载
      preloadStateRef.current.loadedRanges.add(rangeKey);
      preloadStateRef.current.totalPreloaded++;

      // 更新统计信息
      const loadTime = performance.now() - startTime;
      const totalLoadTime = statsRef.current.averagePreloadTime * (statsRef.current.totalPreloaded - 1) + loadTime;
      statsRef.current.averagePreloadTime = totalLoadTime / statsRef.current.totalPreloaded;

    } catch (error) {
      // 预加载失败，静默处理
    } finally {
      preloadStateRef.current.loadingTasks.delete(rangeKey);
      preloadStateRef.current.lastPreloadTime = performance.now();
    }
  }, [data, generateRangeKey, preloadConfig]);

  // 智能预加载调度器
  const schedulePreload = useCallback((
    visibleStart: number,
    visibleEnd: number,
    behavior: ScrollBehavior
  ) => {
    const { start, end } = calculatePreloadRange(visibleStart, visibleEnd, behavior);

    // 清理超出范围的老数据
    const cleanupStart = Math.max(0, start - preloadConfig.maxDistance);
    const cleanupEnd = Math.min(rowCount, end + preloadConfig.maxDistance);

    preloadStateRef.current.loadedRanges.forEach((rangeKey) => {
      const [rangeStart, rangeEnd] = rangeKey.split('-').map(Number);
      if (rangeEnd < cleanupStart || rangeStart > cleanupEnd) {
        preloadStateRef.current.loadedRanges.delete(rangeKey);
      }
    });

    // 延迟执行预加载，避免阻塞主线程
    setTimeout(() => {
      preloadDataChunk(start, end);
    }, preloadConfig.preloadDelay);
  }, [calculatePreloadRange, preloadDataChunk, preloadConfig, rowCount]);

  // 处理滚动事件
  const handleScroll = useCallback((
    scrollTop: number,
    visibleStart: number,
    visibleEnd: number
  ) => {
    const currentTime = performance.now();
    const previousScrollTop = scrollBehaviorRef.current.timestamp > 0
      ? (scrollBehaviorRef.current as any).lastScrollTop || scrollTop
      : scrollTop;

    // 保存当前滚动位置用于下次计算
    (scrollBehaviorRef.current as any).lastScrollTop = scrollTop;

    const previousTime = scrollBehaviorRef.current.timestamp;
    const behavior = analyzeScrollBehavior(scrollTop, previousScrollTop, currentTime, previousTime);

    // 调度预加载
    if (preloadConfig.enabled) {
      schedulePreload(visibleStart, visibleEnd, behavior);
    }
  }, [analyzeScrollBehavior, schedulePreload, preloadConfig.enabled]);

  // 预加载特定行（手动触发）
  const preloadRows = useCallback(async (rowIndices: number[]) => {
    if (!preloadConfig.enabled) return;

    // 按范围分组以优化批量处理
    const ranges: Array<[number, number]> = [];
    let currentRange: [number, number] | null = null;

    for (const rowIndex of rowIndices) {
      if (currentRange === null) {
        currentRange = [rowIndex, rowIndex];
      } else if (rowIndex === currentRange[1] + 1) {
        currentRange[1] = rowIndex;
      } else {
        ranges.push(currentRange);
        currentRange = [rowIndex, rowIndex];
      }
    }

    if (currentRange) {
      ranges.push(currentRange);
    }

    // 并行预加载所有范围
    await Promise.all(
      ranges.map(([start, end]) => preloadDataChunk(start, end))
    );
  }, [preloadConfig.enabled, preloadDataChunk]);

  // 清理预加载缓存
  const clearPreloadCache = useCallback(() => {
    preloadStateRef.current.loadedRanges.clear();
    preloadStateRef.current.loadingTasks.clear();
    preloadStateRef.current.preloadQueue = [];
    statsRef.current.totalPreloaded = 0;
    statsRef.current.cacheHits = 0;
    statsRef.current.cacheMisses = 0;
    statsRef.current.averagePreloadTime = 0;
  }, []);

  // 获取预加载统计信息
  const getPreloadStats = useCallback((): PreloadStats => ({ ...statsRef.current }), []);

  // 更新内存使用情况
  const updateMemoryUsage = useCallback((memoryUsage: number) => {
    statsRef.current.memoryUsage = memoryUsage;

    // 如果内存使用超过阈值，清理部分缓存
    if (memoryUsage > preloadConfig.memoryThreshold) {
      const loadedRanges = Array.from(preloadStateRef.current.loadedRanges);
      const toRemove = Math.floor(loadedRanges.length * 0.3); // 清理30%的缓存

      for (let i = 0; i < toRemove; i++) {
        const randomIndex = Math.floor(Math.random() * loadedRanges.length);
        preloadStateRef.current.loadedRanges.delete(loadedRanges[randomIndex]);
        loadedRanges.splice(randomIndex, 1);
      }
    }
  }, [preloadConfig.memoryThreshold]);

  // 组件卸载时清理
  useEffect(() => {
    return () => {
      clearPreloadCache();
    };
  }, [clearPreloadCache]);

  return {
    handleScroll,
    preloadRows,
    clearPreloadCache,
    getPreloadStats,
    updateMemoryUsage,
    getScrollBehavior: () => scrollBehaviorRef.current
  };
};