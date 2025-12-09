'use client';

import React, { useRef, useEffect, useMemo, useCallback } from 'react';
import { cn } from '@/lib/utils';
import VirtualDiffContainer from './VirtualDiffContainer';
import { useEnhancedScrollSync } from '@/hooks/useEnhancedScrollSync';
import { useSeparatedData, ViewRow } from './hooks/useSeparatedData';
import { globalCacheManager } from '@/lib/cache/PerformanceCacheManager';
import { useDictionary } from '@/hooks/useDictionary';
import { detectCellChanges, formatData } from '@/lib/mainThreadProcessor';

// 性能配置接口
interface PerformanceConfig {
  enableVirtualization: boolean;
  enableCaching: boolean;
  enablePerformanceMonitoring: boolean;
  maxRows: number;
  memoryThreshold: number;
}

// 默认性能配置
const DEFAULT_PERFORMANCE_CONFIG: PerformanceConfig = {
  enableVirtualization: true,
  enableCaching: true,
  enablePerformanceMonitoring: true,
  maxRows: 100000,
  memoryThreshold: 0.8
};

/**
 * 优化版双表格对比组件配置选项
 */
interface DualDiffTableConfig {
  // 表格配置
  estimateRowHeight?: number | ((index: number) => number);
  syncSpeed?: number;

  // 性能配置
  performance?: Partial<PerformanceConfig>;

  // 文件名显示
  fileNames?: {
    left?: string;
    right?: string;
  };
}

/**
 * 优化版双表格对比组件
 * 集成所有性能优化功能
 */
interface DualDiffTableOptimizedProps {
  diffResult: ViewRow[];
  className?: string;
  config?: DualDiffTableConfig;
  // 回调函数（保持向后兼容）
  onPerformanceMetrics?: (metrics: any) => void;
  onRowClick?: (side: 'left' | 'right', rowIndex: number, row: any[]) => void;
  // 向后兼容的独立参数
  estimateRowHeight?: number | ((index: number) => number);
  syncSpeed?: number;
  leftFileName?: string;
  rightFileName?: string;
  performanceConfig?: Partial<PerformanceConfig>;
}

const DualDiffTableOptimized: React.FC<DualDiffTableOptimizedProps> = ({
  diffResult,
  className,
  config,
  // 向后兼容：优先使用 config，然后使用独立参数
  estimateRowHeight,
  syncSpeed,
  leftFileName,
  rightFileName,
  performanceConfig,
  onPerformanceMetrics,
  onRowClick
}) => {
  const { dictionary } = useDictionary();
  const leftTableRef = useRef<HTMLDivElement>(null);
  const rightTableRef = useRef<HTMLDivElement>(null);
  const leftScrollContainerRef = useRef<HTMLDivElement>(null);
  const rightScrollContainerRef = useRef<HTMLDivElement>(null);

  // 统一配置合并：优先使用 config，然后是独立参数，最后使用默认值
  const finalConfig = useMemo(() => {
    const merged = {
      // 表格配置默认值
      estimateRowHeight: 32 as number | ((index: number) => number),
      syncSpeed: 1,
      // 文件名默认值
      fileNames: { left: undefined as string | undefined, right: undefined as string | undefined },
      // 性能配置默认值
      performance: DEFAULT_PERFORMANCE_CONFIG
    };

    // 应用 config 对象
    if (config) {
      if (config.estimateRowHeight !== undefined) merged.estimateRowHeight = config.estimateRowHeight;
      if (config.syncSpeed !== undefined) merged.syncSpeed = config.syncSpeed;
      if (config.fileNames) {
        merged.fileNames = { ...merged.fileNames, ...config.fileNames };
      }
      if (config.performance) {
        merged.performance = { ...merged.performance, ...config.performance };
      }
    }

    // 应用向后兼容的独立参数（覆盖 config）
    if (estimateRowHeight !== undefined) merged.estimateRowHeight = estimateRowHeight;
    if (syncSpeed !== undefined) merged.syncSpeed = syncSpeed;
    if (leftFileName !== undefined) merged.fileNames.left = leftFileName;
    if (rightFileName !== undefined) merged.fileNames.right = rightFileName;
    if (performanceConfig) {
      merged.performance = { ...merged.performance, ...performanceConfig };
    }

    return merged;
  }, [config, estimateRowHeight, syncSpeed, leftFileName, rightFileName, performanceConfig]);

  // 解构最终配置
  const { estimateRowHeight: finalRowHeight, syncSpeed: finalSyncSpeed, fileNames, performance: perfConfig } = finalConfig;

  // 分离数据
  const {
    leftData,
    rightData,
    leftRowNumbers,
    rightRowNumbers,
    maxColumns,
    diffTypes,
    statistics,
    cellChanges,
    formatCellValue,
    getColumnLabel,
    originalDiffResult,
    processedDiffResult
  } = useSeparatedData(diffResult);

  // 增强版滚动同步
  const {
    handleLeftScroll,
    handleRightScroll,
    handleLeftHorizontalScroll,
    handleRightHorizontalScroll,
    scrollToPosition,
    getMetrics: getScrollMetrics,
    resetMetrics: resetScrollMetrics
  } = useEnhancedScrollSync(leftScrollContainerRef, rightScrollContainerRef, {
    syncSpeed: finalSyncSpeed,
    debounceMs: 8,
    maxDelta: 3,
    enableVelocityPrediction: true,
    enableMomentumScrolling: true
  });

  // 提取原始和修改后的数据
  const { originalData, modifiedData } = useMemo(() => {
    const origData: any[][] = [];
    const modData: any[][] = [];

    processedDiffResult.forEach(row => {
      origData.push(row.original.data || []);
      modData.push(row.modified.data || []);
    });

    return { originalData: origData, modifiedData: modData };
  }, [processedDiffResult]);

  // 异步处理数据（主线程处理）
  const processedDataRef = useRef<{
    leftData: any[][];
    rightData: any[][];
    cellChanges: boolean[][];
  } | null>(null);

  // 数据预处理
  useEffect(() => {
    const processData = async () => {
      try {
        // 使用主线程进行数据预处理
        const processedLeftData = formatData(leftData, 'excel');
        const processedRightData = formatData(rightData, 'excel');

        // 计算单元格差异（异步）
        let cellChanges: boolean[][] = [];
        if (perfConfig.enableCaching) {
          cellChanges = new Array(leftData.length).fill(null).map(() =>
            new Array(maxColumns).fill(false)
          );

          // 分批处理以避免阻塞
          for (let i = 0; i < leftData.length; i += 100) {
            const batchEnd = Math.min(i + 100, leftData.length);

            for (let j = i; j < batchEnd; j++) {
              cellChanges[j] = detectCellChanges(
                originalData[j] || [],
                modifiedData[j] || []
              );
            }

            // 让出控制权，避免长时间阻塞UI
            await new Promise(resolve => setTimeout(resolve, 0));
          }
        }

        processedDataRef.current = {
          leftData: processedLeftData,
          rightData: processedRightData,
          cellChanges
        };

      } catch (error) {
        console.error('数据预处理失败:', error);
        processedDataRef.current = {
          leftData,
          rightData,
          cellChanges: []
        };
      }
    };

    processData();
  }, [leftData, rightData, originalData, modifiedData, maxColumns, perfConfig]);

  // 性能监控
  const performanceMetricsRef = useRef<any>({
    renderTime: 0,
    memoryUsage: 0,
    cacheHitRate: 0,
    scrollSyncMetrics: { syncCount: 0, averageSyncTime: 0 }
  });

  // 收集性能指标
  const collectPerformanceMetrics = useCallback(() => {
    const cacheMetrics = globalCacheManager.getMetrics();
    const scrollMetrics = getScrollMetrics();

    let memoryUsage = 0;
    if (typeof performance !== 'undefined' && (performance as any).memory) {
      memoryUsage = (performance as any).memory.usedJSHeapSize / (performance as any).memory.jsHeapSizeLimit;
    }

    const metrics = {
      renderTime: performanceMetricsRef.current.renderTime,
      memoryUsage,
      cacheHitRate: cacheMetrics.viewCache.hitRate,
      totalCacheSize: cacheMetrics.totalCacheSize,
      scrollSyncMetrics: scrollMetrics,
      // Worker stats removed - now using main thread processing
      dataStats: {
        leftRowCount: leftData.length,
        rightRowCount: rightData.length,
        columnCount: maxColumns,
        diffStats: statistics
      }
    };

    performanceMetricsRef.current = metrics;
    onPerformanceMetrics?.(metrics);

    return metrics;
  }, [getScrollMetrics, leftData.length, rightData.length, maxColumns, statistics, onPerformanceMetrics]);

  // 行点击处理
  const handleRowClick = useCallback((side: 'left' | 'right', rowIndex: number, row: any[]) => {
    onRowClick?.(side, rowIndex, row);
  }, [onRowClick]);

  // 滚动到特定行
  const scrollToRow = useCallback((rowIndex: number) => {
    scrollToPosition('left', rowIndex, true);
    scrollToPosition('right', rowIndex, false); // 右侧不使用动画以保持同步
  }, [scrollToPosition]);

  // 内存监控和清理
  useEffect(() => {
    if (!perfConfig.enablePerformanceMonitoring) return;

    const interval = setInterval(() => {
      const metrics = collectPerformanceMetrics();

      // 检查内存使用率
      if (metrics.memoryUsage > perfConfig.memoryThreshold) {
        globalCacheManager.performIntelligentCleanup();
      }

      // 检查滚动同步性能
      if (metrics.scrollSyncMetrics.averageSyncTime > 16) {
        resetScrollMetrics();
      }

    }, 5000);

    return () => clearInterval(interval);
  }, [perfConfig, collectPerformanceMetrics, resetScrollMetrics]);

  // 组件卸载时清理
  useEffect(() => {
    return () => {
      if (perfConfig.enableCaching) {
        globalCacheManager.performIntelligentCleanup();
      }
    };
  }, [perfConfig]);

  // 渲染性能监控
  const renderStartTime = React.useRef(performance.now());

  React.useEffect(() => {
    const renderTime = performance.now() - renderStartTime.current;
    performanceMetricsRef.current.renderTime = renderTime;
  });

  // 使用预处理后的数据
  const displayData = useMemo(() => {
    return processedDataRef.current || {
      leftData,
      rightData,
      cellChanges: cellChanges || new Array(leftData.length).fill(null).map(() =>
        new Array(maxColumns).fill(false)
      )
    };
  }, [leftData, rightData, maxColumns, cellChanges]);

  return (
    <div className={cn('w-full', className)}>
      {/* 性能监控面板已隐藏 */}

      {/* 优化后的虚拟化差异容器 */}
      <VirtualDiffContainer
        leftData={displayData.leftData}
        rightData={displayData.rightData}
        diffTypes={diffTypes}
        cellChanges={cellChanges} // 使用直接从 useSeparatedData 获取的 cellChanges
        maxColumns={maxColumns}
        leftFileName={fileNames.left}
        rightFileName={fileNames.right}
        onRowClick={handleRowClick}
        onPerformanceMetrics={collectPerformanceMetrics}
        estimateRowHeight={finalRowHeight}
        overscan={50}
        enableHeader={true}
        maxRows={perfConfig.maxRows}
        enableCellDiff={perfConfig.enableCaching}
        enableDynamicPreload={true}
        enablePerformanceMonitoring={perfConfig.enablePerformanceMonitoring}
        leftRowNumbers={leftRowNumbers}
        rightRowNumbers={rightRowNumbers}
        scrollSyncConfig={{
          syncSpeed: finalSyncSpeed,
          debounceMs: 8,
          maxDelta: 3,
          enableVelocityPrediction: true,
          enableMomentumScrolling: true
        }}
        preloadConfig={{
          enabled: true,
          baseDistance: 50,
          speedMultiplier: 2,
          memoryThreshold: perfConfig.memoryThreshold
        }}
        className="min-h-[400px]"
      />

      {/* 性能统计信息面板已隐藏 */}
    </div>
  );
};

DualDiffTableOptimized.displayName = 'DualDiffTableOptimized';

export default DualDiffTableOptimized;