'use client';

import React, { useRef, useEffect, useMemo, useCallback, useImperativeHandle, forwardRef } from 'react';
import { cn } from '@/lib/utils';
import VirtualDiffTable, { DiffType } from './VirtualDiffTable';
import { globalCacheManager } from '@/lib/cache/PerformanceCacheManager';
import Image from 'next/image';

// 定义本地的 PerformanceMetrics 接口
interface PerformanceMetrics {
  renderTime: number;
  rowCount: number;
  cacheHitRate: number;
}

// 滚动状态接口
interface ScrollState {
  scrollTop: number;
  scrollLeft: number;
  timestamp: number;
}

// 滚动同步配置
interface ScrollSyncConfig {
  syncSpeed: number; // 同步速度系数 (0-1)
  debounceMs: number; // 防抖延迟
  maxDelta: number; // 最大同步差值
  enableVelocityPrediction?: boolean; // 启用速度预测
  enableMomentumScrolling?: boolean; // 启用动量滚动
  friction?: number; // 摩擦系数（用于动量滚动）
}

// 预加载策略配置
interface PreloadConfig {
  enabled: boolean;
  baseDistance: number; // 基础预加载距离
  speedMultiplier: number; // 速度倍数
  memoryThreshold: number; // 内存阈值
}

/**
 * 虚拟化差异容器组件
 * 替换 DualDiffTable，实现高性能的双表格对比
 */
interface VirtualDiffContainerProps {
  leftData: any[][];
  rightData: any[][];
  diffTypes: DiffType[];
  cellChanges?: boolean[][];
  maxColumns: number;
  className?: string;
  estimateRowHeight?: number | ((index: number) => number);
  overscan?: number;
  enableHeader?: boolean;
  maxRows?: number;
  leftFileName?: string;
  rightFileName?: string;
  onRowClick?: (side: 'left' | 'right', rowIndex: number, row: any[]) => void;
  onPerformanceMetrics?: (metrics: PerformanceMetrics) => void;
  // 滚动同步配置
  scrollSyncConfig?: Partial<ScrollSyncConfig>;
  // 预加载配置
  preloadConfig?: Partial<PreloadConfig>;
  // 功能开关
  enableCellDiff?: boolean;
  enableDynamicPreload?: boolean;
  enablePerformanceMonitoring?: boolean;
  // 原始行号信息
  leftRowNumbers?: (number | null)[];
  rightRowNumbers?: (number | null)[];
}

const VirtualDiffContainer = forwardRef<{
  getLeftScrollElement: () => HTMLDivElement | null;
  getRightScrollElement: () => HTMLDivElement | null;
  scrollToRow: (rowIndex: number) => void;
  getPerformanceMetrics: () => PerformanceMetrics;
}, VirtualDiffContainerProps>(({
  leftData,
  rightData,
  diffTypes,
  cellChanges,
  maxColumns,
  className,
  estimateRowHeight = 32,
  overscan = 30,
  enableHeader = true,
  maxRows,
  leftFileName,
  rightFileName,
  onRowClick,
  onPerformanceMetrics,
  scrollSyncConfig = {},
  preloadConfig = {},
  enableCellDiff = true,
  enableDynamicPreload = true,
  enablePerformanceMonitoring = true,
  leftRowNumbers,
  rightRowNumbers,
  ...props
}, ref) => {
  const leftTableRef = useRef<HTMLDivElement>(null);
  const rightTableRef = useRef<HTMLDivElement>(null);
  const leftScrollContainerRef = useRef<HTMLDivElement>(null);
  const rightScrollContainerRef = useRef<HTMLDivElement>(null);

  // 滚动状态管理
  const scrollStateRef = useRef<{
    left: ScrollState;
    right: ScrollState;
    isSyncing: boolean;
    lastSyncTime: number;
  }>({
    left: { scrollTop: 0, scrollLeft: 0, timestamp: 0 },
    right: { scrollTop: 0, scrollLeft: 0, timestamp: 0 },
    isSyncing: false,
    lastSyncTime: 0
  });

  // 性能监控状态
  const performanceMetricsRef = useRef<PerformanceMetrics>({
    renderTime: 0,
    rowCount: 0,
    cacheHitRate: 0
  });

  // 合并配置 - 优化为 vimdiff 风格的即时同步
  const scrollConfig: ScrollSyncConfig = useMemo(() => ({
    syncSpeed: 1, // 完全同步，无延迟
    debounceMs: 4, // 进一步降低到 4ms 以提高响应性
    maxDelta: 2, // 降低阈值以实现更精确的同步
    enableVelocityPrediction: true, // 启用速度预测
    enableMomentumScrolling: true, // 启用动量滚动
    friction: 0.95, // 适中的摩擦系数
    ...scrollSyncConfig
  }), [scrollSyncConfig]);

  const preloadConfigMerged: PreloadConfig = useMemo(() => ({
    enabled: true,
    baseDistance: 30,
    speedMultiplier: 2,
    memoryThreshold: 0.8,
    ...preloadConfig
  }), [preloadConfig]);

  // 滚动容器引用存储 - 使用 state 存储引用
  const [leftScrollElement, setLeftScrollElement] = React.useState<HTMLDivElement | null>(null);
  const [rightScrollElement, setRightScrollElement] = React.useState<HTMLDivElement | null>(null);

  // 高性能滚动同步实现 - vimdiff 风格的即时同步
  const createScrollHandler = useCallback((
    source: 'left' | 'right',
    targetElement: HTMLDivElement | null
  ) => {
    let rafId: number | null = null;
    let lastCallTime = 0;
    let isScrollingProgrammatically = false;
    let velocity = 0;
    let lastScrollTop = 0;
    let lastScrollLeft = 0;

    return (e: React.UIEvent<HTMLDivElement>) => {
      // 如果是程序触发的滚动，则不进行同步
      if (isScrollingProgrammatically) {
        isScrollingProgrammatically = false;
        return;
      }

      const scrollContainer = e.currentTarget;
      const currentTime = performance.now();

      // 计算滚动速度
      const timeDelta = currentTime - lastCallTime;
      if (timeDelta > 0) {
        const currentScrollTop = scrollContainer.scrollTop;
        const currentScrollLeft = scrollContainer.scrollLeft;
        velocity = Math.sqrt(
          Math.pow(currentScrollTop - lastScrollTop, 2) +
          Math.pow(currentScrollLeft - lastScrollLeft, 2)
        ) / timeDelta;
        lastScrollTop = currentScrollTop;
        lastScrollLeft = currentScrollLeft;
      }

      // 极短的节流控制，确保即时响应
      if (currentTime - lastCallTime < scrollConfig.debounceMs) {
        return;
      }
      lastCallTime = currentTime;

      const newState: ScrollState = {
        scrollTop: scrollContainer.scrollTop,
        scrollLeft: scrollContainer.scrollLeft,
        timestamp: currentTime
      };

      // 更新滚动状态
      scrollStateRef.current[source] = newState;
      scrollStateRef.current.isSyncing = true;

      // 取消之前的动画帧
      if (rafId) {
        cancelAnimationFrame(rafId);
      }

      // 即时同步，无延迟
      rafId = requestAnimationFrame(() => {
        if (targetElement && scrollStateRef.current.isSyncing) {
          // 获取目标元素的当前滚动位置
          const currentTargetScrollTop = targetElement.scrollTop;
          const currentTargetScrollLeft = targetElement.scrollLeft;

          // 获取源元素的滚动位置
          const sourceScrollTop = scrollContainer.scrollTop;
          const sourceScrollLeft = scrollContainer.scrollLeft;

          // 计算差值
          const topDelta = Math.abs(currentTargetScrollTop - sourceScrollTop);
          const leftDelta = Math.abs(currentTargetScrollLeft - sourceScrollLeft);

          // 立即同步，无阈值限制，实现 vimdiff 的完美同步
          if (topDelta > scrollConfig.maxDelta || leftDelta > scrollConfig.maxDelta) {
            isScrollingProgrammatically = true;

            // 使用同步滚动确保完美同步
            targetElement.scrollTop = sourceScrollTop;
            targetElement.scrollLeft = sourceScrollLeft;

            // 使用 setTimeout 确保状态更新
            setTimeout(() => {
              isScrollingProgrammatically = false;
            }, 1);
          }
        }

        scrollStateRef.current.isSyncing = false;
        scrollStateRef.current.lastSyncTime = currentTime;
        rafId = null;
      });
    };
  }, [scrollConfig]);

  // 创建滚动处理器
  const handleLeftScroll = useMemo(() =>
    createScrollHandler('left', rightScrollElement),
    [createScrollHandler, rightScrollElement]
  );

  const handleRightScroll = useMemo(() =>
    createScrollHandler('right', leftScrollElement),
    [createScrollHandler, leftScrollElement]
  );

  
  // 行点击处理器
  const handleLeftRowClick = useCallback((rowIndex: number, row: any[]) => {
    onRowClick?.('left', rowIndex, row);
  }, [onRowClick]);

  const handleRightRowClick = useCallback((rowIndex: number, row: any[]) => {
    onRowClick?.('right', rowIndex, row);
  }, [onRowClick]);

  // 性能指标收集
  const handlePerformanceMetrics = useCallback((metrics: PerformanceMetrics) => {
    const cacheMetrics = globalCacheManager.getMetrics();
    performanceMetricsRef.current = {
      ...metrics,
      cacheHitRate: cacheMetrics.viewCache.hitRate
    };

    if (enablePerformanceMonitoring && onPerformanceMetrics) {
      onPerformanceMetrics(performanceMetricsRef.current);
    }
  }, [enablePerformanceMonitoring, onPerformanceMetrics]);

  // 内存监控和智能清理
  useEffect(() => {
    if (!enablePerformanceMonitoring) return;

    const interval = setInterval(() => {
      const metrics = globalCacheManager.getMetrics();

      // 检查内存使用率
      const memoryUsageRatio = metrics.memory.usedJSHeapSize / metrics.memory.jsHeapSizeLimit;

      if (memoryUsageRatio > 0.85) {
        globalCacheManager.performIntelligentCleanup();
      }
    }, 5000); // 每 5 秒检查一次

    return () => clearInterval(interval);
  }, [enablePerformanceMonitoring]);

  // 滚动到指定行
  const scrollToRow = useCallback((rowIndex: number) => {
    const scrollContainer = leftScrollContainerRef.current?.querySelector('[data-scroll-container]') as HTMLElement;
    if (scrollContainer) {
      const rowHeight = typeof estimateRowHeight === 'function' ? estimateRowHeight(rowIndex) : estimateRowHeight;
      const targetScrollTop = rowIndex * rowHeight;

      scrollContainer.scrollTo({
        top: targetScrollTop,
        behavior: 'smooth'
      });
    }
  }, [estimateRowHeight]);

  // 暴露给父组件的方法
  useImperativeHandle(ref, () => ({
    getLeftScrollElement: () => leftScrollContainerRef.current,
    getRightScrollElement: () => rightScrollContainerRef.current,
    scrollToRow,
    getPerformanceMetrics: () => performanceMetricsRef.current
  }), [scrollToRow]);

  // 计算单元格差异（如果未提供）
  const computedCellChanges = useMemo(() => {
    if (cellChanges) return cellChanges;

    if (!enableCellDiff) return [];

    return leftData.map((leftRow, rowIndex) => {
      const rightRow = rightData[rowIndex] || [];
      return leftRow.map((leftCell, colIndex) => {
        const rightCell = rightRow[colIndex];

        // 处理 null/undefined/空字符串
        const leftVal = leftCell === null || leftCell === undefined || leftCell === '' ? '' : String(leftCell).trim();
        const rightVal = rightCell === null || rightCell === undefined || rightCell === '' ? '' : String(rightCell).trim();

        return leftVal.toLowerCase() !== rightVal.toLowerCase();
      });
    });
  }, [leftData, rightData, cellChanges, enableCellDiff]);

  // 清理函数
  useEffect(() => {
    return () => {
      // 组件卸载时清理缓存
      if (enablePerformanceMonitoring) {
        globalCacheManager.performIntelligentCleanup();
      }

      // 清理滚动同步状态
      scrollStateRef.current = {
        left: { scrollTop: 0, scrollLeft: 0, timestamp: 0 },
        right: { scrollTop: 0, scrollLeft: 0, timestamp: 0 },
        isSyncing: false,
        lastSyncTime: 0
      };
    };
  }, [enablePerformanceMonitoring]);

  return (
    <div className={cn('w-full', className)} {...props}>
      {/* 双表格布局 */}
      <div className="flex flex-col lg:flex-row gap-6">
        {/* 左侧容器 */}
        <div className="flex-1 min-w-0 lg:min-w-[400px]">
          {/* 左侧文件名信息栏 */}
          {leftFileName && (
            <div className="flex-shrink-0 border-b border-gray-200 dark:border-gray-700 bg-gray-100 dark:bg-gray-800 p-3 rounded-t-lg mb-0">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Image src="/favicon.svg" alt="Logo" width={16} height={16} />
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300 truncate">
                    {leftFileName}
                  </span>
                </div>
                {/* 缓存指标已隐藏 */}
              </div>
            </div>
          )}

          {/* 左侧虚拟化差异表格 */}
          <div className={cn(
            'overflow-hidden bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700',
            leftFileName ? 'rounded-tl-none rounded-tr-none border-t-0' : 'rounded-lg'
          )}>
            <VirtualDiffTable
              ref={leftScrollContainerRef}
              data={leftData}
              diffTypes={diffTypes}
              cellChanges={computedCellChanges}
              columnCount={maxColumns}
              side="left"
              onRowClick={handleLeftRowClick}
              onScroll={handleLeftScroll}
              onScrollElementRef={setLeftScrollElement}
              onPerformanceMetrics={handlePerformanceMetrics}
              estimateRowHeight={estimateRowHeight}
              overscan={overscan}
              enableHeader={enableHeader}
              maxRows={maxRows}
              enableCellDiff={enableCellDiff}
              enableDynamicPreload={enableDynamicPreload}
              rowNumbers={leftRowNumbers}
              className="min-w-0"
            />
          </div>
        </div>

        {/* 右侧容器 */}
        <div className="flex-1 min-w-0 lg:min-w-[400px]">
          {/* 右侧文件名信息栏 */}
          {rightFileName && (
            <div className="flex-shrink-0 border-b border-gray-200 dark:border-gray-700 bg-gray-100 dark:bg-gray-800 p-3 rounded-t-lg mb-0">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Image src="/favicon.svg" alt="Logo" width={16} height={16} />
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300 truncate">
                    {rightFileName}
                  </span>
                </div>
                {/* 渲染时间指标已隐藏 */}
              </div>
            </div>
          )}

          {/* 右侧虚拟化差异表格 */}
          <div className={cn(
            'overflow-hidden bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700',
            rightFileName ? 'rounded-tl-none rounded-tr-none border-t-0' : 'rounded-lg'
          )}>
            <VirtualDiffTable
              ref={rightScrollContainerRef}
              data={rightData}
              diffTypes={diffTypes}
              cellChanges={computedCellChanges}
              columnCount={maxColumns}
              side="right"
              onRowClick={handleRightRowClick}
              onScroll={handleRightScroll}
              onScrollElementRef={setRightScrollElement}
              onPerformanceMetrics={handlePerformanceMetrics}
              estimateRowHeight={estimateRowHeight}
              overscan={overscan}
              enableHeader={enableHeader}
              maxRows={maxRows}
              enableCellDiff={enableCellDiff}
              enableDynamicPreload={enableDynamicPreload}
              rowNumbers={rightRowNumbers}
              className="min-w-0"
            />
          </div>
        </div>
      </div>

      {/* 性能监控面板已隐藏 */}
    </div>
  );
});

VirtualDiffContainer.displayName = 'VirtualDiffContainer';

export default VirtualDiffContainer;