'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';
import { useVirtualizer } from '@tanstack/react-virtual';
import {
  getColumnLabel,
  formatCellValue,
  isCellEmpty
} from './utils/excelUtils';
import {
  DiffType
} from './constants/styles';

// 性能监控接口
interface PerformanceMetrics {
  renderTime: number;
  rowCount: number;
  cacheHitRate: number;
}

// 缓存接口
interface RowCache {
  data: Map<string, React.ReactElement>;
  maxAge: number;
  maxSize: number;
}

// 视图缓存管理器
class ViewCacheManager {
  private cache: RowCache;
  private accessTimes: Map<string, number>;

  constructor(maxSize: number = 1000, maxAge: number = 30000) {
    this.cache = {
      data: new Map(),
      maxAge,
      maxSize
    };
    this.accessTimes = new Map();
  }

  get(key: string): React.ReactElement | null {
    const item = this.cache.data.get(key);
    if (item) {
      const now = Date.now();
      const accessTime = this.accessTimes.get(key) || 0;

      if (now - accessTime < this.cache.maxAge) {
        this.accessTimes.set(key, now);
        return item;
      } else {
        this.cache.data.delete(key);
        this.accessTimes.delete(key);
      }
    }
    return null;
  }

  set(key: string, value: React.ReactElement): void {
    if (this.cache.data.size >= this.cache.maxSize) {
      this.evictOldest();
    }

    this.cache.data.set(key, value);
    this.accessTimes.set(key, Date.now());
  }

  private evictOldest(): void {
    let oldestKey = '';
    let oldestTime = Date.now();

    this.accessTimes.forEach((time, key) => {
      if (time < oldestTime) {
        oldestTime = time;
        oldestKey = key;
      }
    });

    if (oldestKey) {
      this.cache.data.delete(oldestKey);
      this.accessTimes.delete(oldestKey);
    }
  }

  clear(): void {
    this.cache.data.clear();
    this.accessTimes.clear();
  }

  getMetrics(): { size: number; hitRate: number } {
    return {
      size: this.cache.data.size,
      hitRate: 0 // 需要在实际使用中统计
    };
  }
}

// 虚拟化差异行组件 - 使用 React.memo 优化性能
interface VirtualDiffRowProps {
  row: any[];
  diffType: DiffType;
  cellChanges: boolean[];
  style: React.CSSProperties;
  columnCount: number;
  onRowClick?: (rowIndex: number, row: any[]) => void;
  rowIndex: number;
  rowNumberWidth?: number;
  minColumnWidth?: number;
  averageColumnWidth?: number;
  side?: 'left' | 'right';
  enableCellDiff?: boolean;
  originalRowNumber?: number | null;
}

const VirtualDiffRow = React.memo<VirtualDiffRowProps>(({
  row,
  diffType,
  cellChanges,
  style,
  columnCount,
  onRowClick,
  rowIndex,
  rowNumberWidth = 64,
  minColumnWidth = 120,
  averageColumnWidth = 120,
  side = 'left',
  enableCellDiff = true,
  originalRowNumber
}) => {
  const handleClick = React.useCallback(() => {
    onRowClick?.(rowIndex, row);
  }, [onRowClick, rowIndex, row]);

  // 使用静态缓存避免重复渲染
  const cachedContent = React.useMemo(() => {
    return (
      <div className={cn(
        'flex border-b transition-colors relative h-full',
        // 横线边框颜色设置：确保所有行都有边框，MODIFY行使用更明显的边框
        diffType === 'ADD' || diffType === 'DELETE'
          ? ((diffType === 'ADD' && side === 'right') || (diffType === 'DELETE' && side === 'left'))
            ? 'border-gray-300 dark:border-gray-600'
            : 'border-gray-100 dark:border-gray-800'
          : diffType === 'MODIFY'
            ? 'border-gray-400 dark:border-gray-500'  // MODIFY行使用更深的边框确保可见
            : 'border-gray-300 dark:border-gray-600',
        // 整行背景色设置
        diffType === 'KEEP' ? 'bg-gray-50 dark:bg-gray-800' :
        diffType === 'MODIFY' ? 'bg-yellow-50 dark:bg-yellow-950' :
        diffType === 'ADD' ? (side === 'left' ? 'bg-white dark:bg-gray-900' : 'bg-green-100 dark:bg-green-900') :
        diffType === 'DELETE' ? (side === 'left' ? 'bg-red-100 dark:bg-red-900' : 'bg-white dark:bg-gray-900') :
        'bg-white dark:bg-gray-900',
        diffType === 'ADD' && side === 'left' ? 'add-line-shadow' : '',
        diffType === 'DELETE' && side === 'right' ? 'delete-line-shadow' : ''
      )}>
        {/* 冻结的行号列 */}
        <div
          className={cn(
            'px-2 py-1 text-center text-xs font-medium border-r border-gray-200 dark:border-gray-700 flex-shrink-0 sticky left-0 z-40 flex items-center justify-center',
            diffType === 'ADD' && side === 'left' ? 'add-line-shadow-sticky' : '',
            diffType === 'DELETE' && side === 'right' ? 'delete-line-shadow-sticky-right' : '',
            // 行号列背景色，确保不透明
            diffType === 'KEEP' ? 'bg-gray-50 dark:bg-gray-800' :
            diffType === 'MODIFY' ? 'bg-yellow-50 dark:bg-yellow-950' :
            diffType === 'ADD' ? (side === 'left' ? 'bg-white dark:bg-gray-900' : 'bg-green-100 dark:bg-green-900') :
            diffType === 'DELETE' ? (side === 'left' ? 'bg-red-100 dark:bg-red-900' : 'bg-white dark:bg-gray-900') :
            'bg-white dark:bg-gray-900',
            // 行号列文字颜色
            diffType === 'KEEP' ? 'text-gray-500 dark:text-gray-400' :
            diffType === 'MODIFY' ? 'text-yellow-700 dark:text-yellow-300' :
            diffType === 'ADD' ? 'text-green-700 dark:text-green-300' :
            diffType === 'DELETE' ? 'text-red-700 dark:text-red-300' :
            'text-gray-500 dark:text-gray-400'
          )}
          style={{
            width: `${rowNumberWidth}px`,
            height: '100%', // 确保高度填满外层容器
            backgroundColor: 'inherit', // 确保背景色不透明
            backdropFilter: 'none' // 禁用背景模糊
          }}
        >
          {(diffType === 'ADD' && side === 'left') || (diffType === 'DELETE' && side === 'right') ? '' : (originalRowNumber || '')}
        </div>

        {/* 数据单元格 */}
        <div className="flex" style={{
          width: `${columnCount * averageColumnWidth}px`,
          height: '100%' // 确保高度填满外层容器
        }}>
          {Array.from({ length: columnCount }, (_, colIndex) => {
            const cellValue = row[colIndex];
            const isEmpty = isCellEmpty(cellValue);
            const hasCellDiff = enableCellDiff && cellChanges[colIndex];

            return (
              <div
                key={colIndex}
                className={cn(
                  'px-2 py-1 text-xs flex-shrink-0 truncate flex items-center',
                  // 边框颜色设置：除了ADD行和DELETE行，其他行使用灰色边框
                  // 对于ADD和DELETE行，只有有数据的一侧才有边框
                  (diffType === 'ADD' || diffType === 'DELETE')
                    ? ((diffType === 'ADD' && side === 'right') || (diffType === 'DELETE' && side === 'left'))
                      ? 'border-l border-gray-300 dark:border-gray-600'
                      : 'border-l border-transparent'
                    : 'border-l border-gray-300 dark:border-gray-600',
                  // 对于 MODIFY 行，只对发生变化的单元格应用高亮背景
                  diffType === 'MODIFY' && hasCellDiff
                    ? 'bg-yellow-200 dark:bg-yellow-800 font-medium text-yellow-900 dark:text-yellow-100'
                    : 'bg-transparent',
                  // 文字颜色设置
                  isEmpty ? 'text-gray-400 dark:text-gray-600 italic' : 'text-gray-900 dark:text-gray-100'
                )}
                style={{
                  width: averageColumnWidth,
                  minWidth: minColumnWidth,
                  height: '100%' // 确保高度填满父容器
                }}
                title={formatCellValue(cellValue)}
              >
                {(diffType === 'ADD' && side === 'left') || (diffType === 'DELETE' && side === 'right') ? '' : (isEmpty ? '(空)' : formatCellValue(cellValue))}
              </div>
            );
          })}
        </div>
      </div>
    );
  }, [row, diffType, cellChanges, columnCount, rowNumberWidth, minColumnWidth, averageColumnWidth, side, enableCellDiff, originalRowNumber]);

  return (
    <div
      style={style}
      onClick={handleClick}
    >
      {cachedContent}
    </div>
  );
});

VirtualDiffRow.displayName = 'VirtualDiffRow';

// 主虚拟化差异表格组件
interface VirtualDiffTableProps {
  data: any[][];
  diffTypes: DiffType[];
  cellChanges?: boolean[][]; // 单元格级别的变化
  columnCount: number;
  className?: string;
  onRowClick?: (rowIndex: number, row: any[]) => void;
  onScroll?: (e: React.UIEvent<HTMLDivElement>) => void; // 添加滚动事件处理器
  onScrollElementRef?: (element: HTMLDivElement | null) => void; // 滚动容器引用回调
  estimateRowHeight?: number | ((index: number) => number);
  overscan?: number;
  enableHeader?: boolean;
  maxRows?: number;
  side?: 'left' | 'right';
  enableCellDiff?: boolean;
  onPerformanceMetrics?: (metrics: PerformanceMetrics) => void;
  // 动态预加载参数
  enableDynamicPreload?: boolean;
  scrollSpeedThreshold?: number;
  // 原始行号信息
  rowNumbers?: (number | null)[];
}

const VirtualDiffTable = React.forwardRef<HTMLDivElement, VirtualDiffTableProps>(({
  data,
  diffTypes,
  cellChanges,
  columnCount,
  className,
  onRowClick,
  onScroll,
  onScrollElementRef,
  estimateRowHeight = 32,
  overscan = 30,
  enableHeader = true,
  maxRows,
  side = 'left',
  enableCellDiff = true,
  onPerformanceMetrics,
  enableDynamicPreload = true,
  scrollSpeedThreshold = 100,
  rowNumbers,
  ...props
}, ref) => {
  const tableContainerRef = React.useRef<HTMLDivElement>(null);
  const headerScrollRef = React.useRef<HTMLDivElement>(null);
  const viewCacheRef = React.useRef(new ViewCacheManager());
  const lastScrollTimeRef = React.useRef(Date.now());
  const scrollSpeedRef = React.useRef(0);
  const renderStartTimeRef = React.useRef(0);

  // 限制显示行数
  const limitedData = React.useMemo(() => {
    return maxRows ? data.slice(0, maxRows) : data;
  }, [data, maxRows]);

  // 滚动同步和性能监控
  const handleDataScroll = React.useCallback((e: React.UIEvent<HTMLDivElement>) => {
    const scrollContainer = e.currentTarget;
    const scrollLeft = scrollContainer.scrollLeft;
    const currentTime = Date.now();

    // 计算滚动速度
    const timeDelta = currentTime - lastScrollTimeRef.current;
    if (timeDelta > 0) {
      scrollSpeedRef.current = Math.abs(scrollContainer.scrollTop - (scrollContainer as any).lastScrollTop) / timeDelta * 1000;
      (scrollContainer as any).lastScrollTop = scrollContainer.scrollTop;
    }
    lastScrollTimeRef.current = currentTime;

    // 同步表头滚动
    if (headerScrollRef.current) {
      requestAnimationFrame(() => {
        if (headerScrollRef.current) {
          headerScrollRef.current.style.transform = `translateX(-${scrollLeft}px)`;
        }
      });
    }

    // 调用父组件的滚动处理器
    onScroll?.(e);
  }, [onScroll]);

  // 动态计算预加载范围
  const calculateDynamicOverscan = React.useCallback(() => {
    if (!enableDynamicPreload) return overscan;

    const baseOverscan = overscan;
    const speedMultiplier = Math.min(scrollSpeedRef.current / scrollSpeedThreshold, 3);
    const deviceMemory = (navigator as any).deviceMemory || 4;
    const memoryMultiplier = deviceMemory > 4 ? 1.5 : 1;

    return Math.floor(baseOverscan * speedMultiplier * memoryMultiplier);
  }, [enableDynamicPreload, overscan, scrollSpeedThreshold]);

  // 计算行高
  const getRowHeight = React.useCallback((index: number) => {
    if (typeof estimateRowHeight === 'function') {
      return estimateRowHeight(index);
    }
    return estimateRowHeight;
  }, [estimateRowHeight]);

  // 计算容器宽度
  const [containerWidth, setContainerWidth] = React.useState(0);

  React.useEffect(() => {
    const updateWidth = () => {
      if (tableContainerRef.current) {
        const width = tableContainerRef.current.clientWidth;
        setContainerWidth(width);
      }
    };

    updateWidth();

    const resizeObserver = new ResizeObserver(updateWidth);
    if (tableContainerRef.current) {
      resizeObserver.observe(tableContainerRef.current);
    }

    return () => resizeObserver.disconnect();
  }, []);

  // 设置滚动元素引用
  React.useEffect(() => {
    if (onScrollElementRef) {
      onScrollElementRef(tableContainerRef.current);
    }
  }, [onScrollElementRef]);

  // 计算列宽配置
  const rowNumberWidth = 64;
  const minColumnWidth = 120;
  const maxColumnWidth = 300;
  const availableWidth = containerWidth - rowNumberWidth;
  const adaptiveColumnWidth = columnCount > 0 ? Math.min(
    Math.max(minColumnWidth, availableWidth / columnCount),
    maxColumnWidth
  ) : minColumnWidth;
  const useAdaptiveWidth = columnCount * minColumnWidth <= availableWidth;
  const averageColumnWidth = useAdaptiveWidth ? adaptiveColumnWidth : minColumnWidth;
  const totalWidth = rowNumberWidth + columnCount * averageColumnWidth;

  // 创建虚拟化器
  const dynamicOverscan = calculateDynamicOverscan();

  const rowVirtualizer = useVirtualizer({
    count: limitedData.length,
    getScrollElement: React.useCallback(() => tableContainerRef.current, []),
    estimateSize: getRowHeight,
    overscan: dynamicOverscan,
    scrollPaddingStart: 0,
    scrollPaddingEnd: 200,
    // 启用滚动缓存优化
    scrollToFn: (offset, element) => {
      if (element && 'scrollTo' in element) {
        (element as HTMLElement).scrollTo({ top: offset, behavior: 'auto' });
      }
    },
  });

  // 性能监控
  React.useEffect(() => {
    renderStartTimeRef.current = performance.now();
    const viewCache = viewCacheRef.current; // 保存 ref 的当前值

    return () => {
      const renderTime = performance.now() - renderStartTimeRef.current;
      if (onPerformanceMetrics) {
        onPerformanceMetrics({
          renderTime,
          rowCount: limitedData.length,
          cacheHitRate: viewCache.getMetrics().hitRate
        });
      }
    };
  }, [limitedData.length, onPerformanceMetrics]);

  // 表头组件
  const TableHeader = React.useMemo(() => {
    if (!enableHeader) return null;

    return (
      <div className="sticky top-0 z-20 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 overflow-hidden">
        <div className="flex" style={{ width: `${totalWidth}px` }}>
          <div
            className="px-2 py-1 text-center text-xs font-semibold text-gray-700 dark:text-gray-300 border-r border-gray-300 dark:border-gray-600 bg-gray-100 dark:bg-gray-800 flex-shrink-0 sticky left-0 z-40 shadow-sm"
            style={{
              width: `${rowNumberWidth}px`,
              background: 'linear-gradient(to right, rgb(243 244 246), rgb(243 244 246))' // 强制实体背景色
            }}
          >
            #
          </div>
          <div
            ref={headerScrollRef}
            className="flex"
            style={{ width: `${columnCount * averageColumnWidth}px` }}
          >
            {Array.from({ length: columnCount }, (_, index) => (
              <div
                key={index}
                className="px-2 py-1 text-center text-xs font-semibold text-gray-700 dark:text-gray-300 border-l border-gray-300 dark:border-gray-600 bg-gray-100 dark:bg-gray-800 flex-shrink-0"
                style={{ width: averageColumnWidth, minWidth: minColumnWidth }}
              >
                {getColumnLabel(index)}
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }, [enableHeader, columnCount, rowNumberWidth, minColumnWidth, averageColumnWidth, totalWidth]);

  return (
    <div
      ref={ref}
      className={cn('relative w-full flex flex-col h-full', className)}
      {...props}
    >
  
      {TableHeader}

      {/* 滚动容器 */}
      <div
        ref={tableContainerRef}
        className="flex-1 overflow-auto"
        style={{
          minHeight: '200px',
          maxHeight: '600px',
          width: '100%',
          overflowX: 'auto',
          overflowY: 'auto',
          // 启用硬件加速
          transform: 'translateZ(0)',
          scrollBehavior: 'auto',
          isolation: 'isolate'
        }}
        onScroll={handleDataScroll}
      >
        {/* 虚拟化内容区域 */}
        <div
          style={{
            height: `${rowVirtualizer.getTotalSize()}px`,
            width: `${totalWidth}px`,
            minWidth: `${totalWidth}px`,
            position: 'relative'
          }}
        >
          {rowVirtualizer.getVirtualItems().map((virtualRow) => {
            const rowData = limitedData[virtualRow.index] || [];
            const diffType = diffTypes[virtualRow.index] || 'KEEP';
            const rowCellChanges = cellChanges?.[virtualRow.index] || new Array(columnCount).fill(false);

            return (
              <div
                key={`${virtualRow.index}-${virtualRow.start}`}
                style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  width: `${totalWidth}px`,
                  height: `${virtualRow.size}px`,
                  transform: `translateY(${virtualRow.start}px)`,
                  willChange: 'transform'
                }}
              >
                <VirtualDiffRow
                  row={rowData}
                  diffType={diffType}
                  cellChanges={rowCellChanges}
                  style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    width: `${totalWidth}px`,
                    height: `${virtualRow.size}px`
                  }}
                  columnCount={columnCount}
                  onRowClick={onRowClick}
                  rowIndex={virtualRow.index}
                  rowNumberWidth={rowNumberWidth}
                  minColumnWidth={minColumnWidth}
                  averageColumnWidth={averageColumnWidth}
                  side={side}
                  enableCellDiff={enableCellDiff}
                  originalRowNumber={rowNumbers?.[virtualRow.index]}
                />
              </div>
            );
          })}
        </div>
      </div>

      {/* 数据截断提示 */}
      {maxRows && data.length > maxRows && (
        <div className="text-center py-1 text-xs text-gray-500 dark:text-gray-400 bg-blue-50 dark:bg-blue-950 border-t border-gray-200 dark:border-gray-700 flex-shrink-0">
          ... 显示前 {maxRows} 行，共 {data.length} 行数据 ...
        </div>
      )}
    </div>
  );
});

VirtualDiffTable.displayName = 'VirtualDiffTable';

// 重新导出类型以保持兼容性
export type { DiffType, CellDiffType } from './constants/styles';

export default VirtualDiffTable;