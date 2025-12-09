'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';
import { useVirtualizer } from '@tanstack/react-virtual';
import {
  getColumnLabel,
  formatCellValue,
  calculateColumnWidth,
  isCellEmpty,
  getCellDisplayText
} from './utils/excelUtils';
import {
  BORDER_STYLES,
  LAYOUT_STYLES,
  TEXT_STYLES,
  SPACING_STYLES,
  SIZES,
  BACKGROUND_STYLES
} from './constants/styles';

// 虚拟化Excel行组件
const VirtualExcelRow = React.memo(({
  row,
  style,
  columnCount,
  onRowClick,
  rowIndex,
  originalRowIndex,
  rowNumberWidth = SIZES.ROW_NUMBER_WIDTH,
  minColumnWidth = SIZES.COLUMN_WIDTH_MIN,
  averageColumnWidth = SIZES.COLUMN_WIDTH_DEFAULT,
}: {
  row: any[];
  style: React.CSSProperties;
  columnCount: number;
  onRowClick?: (rowIndex: number, row: any[]) => void;
  rowIndex: number;
  originalRowIndex?: number; // 原始行号，用于显示正确的行号
  rowNumberWidth?: number;
  minColumnWidth?: number;
  averageColumnWidth?: number;
}) => {
  const handleClick = React.useCallback(() => {
    onRowClick?.(rowIndex, row);
  }, [onRowClick, rowIndex, row]);

  return (
    <div
      style={style}
      className={cn(
        LAYOUT_STYLES.FLEX_ROW,
        BORDER_STYLES.BORDER_BOTTOM,
        'transition-colors',
        'data-[state=selected]:bg-muted'
      )}
      onClick={handleClick}
    >
      {/* 行号列 */}
      <div
        className={cn(
          SPACING_STYLES.PX_2,
          SPACING_STYLES.PY_1,
          TEXT_STYLES.TEXT_CENTER,
          TEXT_STYLES.TEXT_XS,
          TEXT_STYLES.TEXT_GRAY_500,
          TEXT_STYLES.FONT_MEDIUM,
          BORDER_STYLES.BORDER_RIGHT,
          LAYOUT_STYLES.FLEX_SHRINK_0
        )}
        style={{ width: `${rowNumberWidth}px` }}
      >
        {(originalRowIndex !== undefined ? originalRowIndex : rowIndex) + 1}
      </div>

      {/* 数据单元格 */}
      {Array.from({ length: columnCount }, (_, colIndex) => {
        const cellValue = row[colIndex];
        const isEmpty = isCellEmpty(cellValue);

        return (
          <div
            key={colIndex}
            className={cn(
              SPACING_STYLES.PX_2,
              SPACING_STYLES.PY_1,
              TEXT_STYLES.TEXT_XS,
              BORDER_STYLES.BORDER_LEFT,
              LAYOUT_STYLES.FLEX_SHRINK_0,
              TEXT_STYLES.TRUNCATE,
              isEmpty ? cn(TEXT_STYLES.TEXT_GRAY_500, TEXT_STYLES.ITALIC) : TEXT_STYLES.TEXT_GRAY_900
            )}
            style={{
              width: averageColumnWidth,
              minWidth: minColumnWidth
            }}
            title={formatCellValue(cellValue)}
          >
            {getCellDisplayText(cellValue)}
          </div>
        );
      })}
    </div>
  );
});

VirtualExcelRow.displayName = 'VirtualExcelRow';

/**
 * 虚拟Excel表格组件
 * 专为Excel数据预览设计，支持虚拟滚动、冻结功能
 */
const VirtualExcelTable = React.forwardRef<
  HTMLDivElement,
  {
    data: any[][];
    columnCount: number;
    className?: string;
    onRowClick?: (rowIndex: number, row: any[]) => void;
    estimateRowHeight?: number | ((index: number) => number);
    overscan?: number;
    enableHeader?: boolean;
    maxRows?: number; // 限制显示的最大行数
    comparisonResult?: any;
    selectedColumn?: string;
    panelSide?: 'left' | 'right';
    onColumnChange?: (column: string) => void;
    showOnlySame?: boolean;
    showOnlyDifferent?: boolean;
  }
>(({
  data,
  columnCount,
  className,
  onRowClick,
  estimateRowHeight = SIZES.ROW_HEIGHT,
  overscan = 5,
  enableHeader = true,
  maxRows,
  comparisonResult,
  selectedColumn,
  panelSide = 'left',
  onColumnChange,
  showOnlySame = false,
  showOnlyDifferent = false,
  ...props
}, ref) => {
  const tableContainerRef = React.useRef<HTMLDivElement>(null);
  const headerScrollRef = React.useRef<HTMLDivElement>(null);

  // 将列字母转换为数字索引
  const columnLetterToNumber = React.useCallback((columnLetter: string) => {
    if (!columnLetter || columnLetter.length === 0) return 0;
    const letter = columnLetter.toUpperCase();
    let result = 0;
    for (let i = 0; i < letter.length; i++) {
      result = result * 26 + (letter.charCodeAt(i) - 'A'.charCodeAt(0) + 1);
    }
    return result - 1; // 转换为0-based索引
  }, []);

  // 计算单元格高亮状态
  const getCellHighlightClass = React.useCallback((displayRowIndex: number, colIndex: number, originalRowIndex?: number) => {
    if (!comparisonResult || !selectedColumn) return '';

    const selectedColIndex = columnLetterToNumber(selectedColumn);

    // 只高亮选中的那一列
    if (colIndex !== selectedColIndex) return '';

    const tableData = panelSide === 'left' ? comparisonResult.tableA : comparisonResult.tableB;

    // 使用原始行索引（如果提供）或显示行索引
    const rowIndexToUse = originalRowIndex !== undefined ? originalRowIndex : displayRowIndex;

    // 在表格数据中查找对应的行
    const matchedRow = tableData.find((row: any) => row.rowIndex === rowIndexToUse);

    if (!matchedRow) return '';

    if (matchedRow.status === 'SAME') {
      return 'bg-green-100'; // 绿色背景
    } else if (matchedRow.status === 'DIFF') {
      return 'bg-red-100';   // 红色背景
    }

    return '';
  }, [comparisonResult, selectedColumn, panelSide, columnLetterToNumber]);

  // 过滤和限制显示行数，同时创建行索引映射
  const { filteredData, rowIndexMap } = React.useMemo(() => {
    let result = data;
    let indexMap: number[] = []; // 过滤后的行索引 -> 原始行索引

    // 如果开启了过滤功能，则过滤数据
    if ((showOnlySame || showOnlyDifferent) && comparisonResult && selectedColumn) {
      const selectedColIndex = columnLetterToNumber(selectedColumn);
      const tableData = panelSide === 'left' ? comparisonResult.tableA : comparisonResult.tableB;

      // 获取所有符合条件的行索引
      const targetRowIndices = new Set();
      const targetStatus = showOnlySame ? 'SAME' : 'DIFF';

      tableData.forEach((row: any) => {
        if (row.status === targetStatus) {
          targetRowIndices.add(row.rowIndex);
        }
      });

      // 只显示符合条件的行，同时创建索引映射
      result = [];
      indexMap = [];
      data.forEach((row, originalIndex) => {
        if (targetRowIndices.has(originalIndex)) {
          result.push(row);
          indexMap.push(originalIndex);
        }
      });
    } else {
      // 没有过滤时，索引映射就是 0, 1, 2, ...
      result = data;
      indexMap = data.map((_, index) => index);
    }

    // 应用最大行数限制
    if (maxRows) {
      result = result.slice(0, maxRows);
      indexMap = indexMap.slice(0, maxRows);
    }

    return { filteredData: result, rowIndexMap: indexMap };
  }, [data, maxRows, showOnlySame, showOnlyDifferent, comparisonResult, selectedColumn, panelSide, columnLetterToNumber]);

  // 使用动态高度计算
  const getRowHeight = React.useCallback((index: number) => {
    if (typeof estimateRowHeight === 'function') {
      return estimateRowHeight(index);
    }
    return estimateRowHeight;
  }, [estimateRowHeight]);

  // 计算容器宽度，用于自适应布局
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

  // 使用公共函数计算列宽
  const rowNumberWidth = SIZES.ROW_NUMBER_WIDTH;
  const minColumnWidth = SIZES.COLUMN_WIDTH_MIN;
  const maxColumnWidth = SIZES.COLUMN_WIDTH_MAX;

  const averageColumnWidth = calculateColumnWidth(
    containerWidth,
    columnCount,
    minColumnWidth,
    maxColumnWidth,
    rowNumberWidth
  );

  const totalWidth = rowNumberWidth + columnCount * averageColumnWidth;

  // 同步横向滚动 - 使用节流优化性能
  const handleDataScroll = React.useCallback((e: React.UIEvent<HTMLDivElement>) => {
    const scrollContainer = e.currentTarget;
    const scrollLeft = scrollContainer.scrollLeft;

    // 使用requestAnimationFrame优化滚动同步
    if (headerScrollRef.current) {
      requestAnimationFrame(() => {
        if (headerScrollRef.current) {
          headerScrollRef.current.style.transform = `translateX(-${scrollLeft}px)`;
        }
      });
    }
  }, []);

  // 滚动到指定列的功能
  const scrollToColumn = React.useCallback((columnLetter: string) => {
    if (!tableContainerRef.current) return;

    const columnIndex = columnLetterToNumber(columnLetter);
    if (columnIndex < 0) return;

    // 计算目标列的位置
    const targetScrollLeft = rowNumberWidth + columnIndex * averageColumnWidth;

    // 获取容器的可视宽度
    const currentContainerWidth = tableContainerRef.current.clientWidth;

    // 计算滚动位置，确保目标列在可视区域中央
    const columnWidth = averageColumnWidth;
    const centeredScrollLeft = targetScrollLeft - (currentContainerWidth - columnWidth) / 2;

    // 确保滚动位置在有效范围内
    const maxScrollLeft = totalWidth - currentContainerWidth;
    const finalScrollLeft = Math.max(0, Math.min(centeredScrollLeft, maxScrollLeft));

    // 执行滚动
    tableContainerRef.current.scrollTo({
      left: finalScrollLeft,
      behavior: 'smooth'
    });
  }, [columnLetterToNumber, rowNumberWidth, averageColumnWidth, totalWidth]);

  // 当选中的列改变时，自动滚动到该列
  React.useEffect(() => {
    if (selectedColumn && onColumnChange) {
      scrollToColumn(selectedColumn);
    }
  }, [selectedColumn, scrollToColumn, onColumnChange]);

  // 创建虚拟化器 - 优化性能配置
  const rowVirtualizer = useVirtualizer({
    count: filteredData.length,
    getScrollElement: React.useCallback(() => tableContainerRef.current, []),
    estimateSize: getRowHeight,
    overscan: Math.max(overscan, SIZES.OVERSCAN_MIN), // 确保最小overscan为30
    // 启用滚动缓存优化
    scrollPaddingStart: 0,
    scrollPaddingEnd: SIZES.SCROLL_PADDING,
  });

  // 表头组件
  const TableHeader = React.useMemo(() => {
    if (!enableHeader) return null;

    return (
      <div
        className={cn(
          'sticky top-0 z-20',
          BACKGROUND_STYLES.HEADER,
          BORDER_STYLES.BORDER_BOTTOM,
          LAYOUT_STYLES.W_FULL
        )}
      >
        <div className={LAYOUT_STYLES.FLEX_ROW} style={{ width: `${totalWidth}px` }}>
          {/* 行号表头 */}
          <div
            className={cn(
              SPACING_STYLES.PX_2,
              SPACING_STYLES.PY_2,
              TEXT_STYLES.TEXT_CENTER,
              TEXT_STYLES.TEXT_XS,
              TEXT_STYLES.FONT_SEMIBOLD,
              TEXT_STYLES.TEXT_GRAY_700,
              BORDER_STYLES.HEADER_BORDER,
              BACKGROUND_STYLES.HEADER,
              LAYOUT_STYLES.FLEX_SHRINK_0
            )}
            style={{ width: `${rowNumberWidth}px` }}
          >
            #
          </div>

          {/* 数据列表头 */}
          {Array.from({ length: columnCount }, (_, index) => (
            <div
              key={index}
              className={cn(
                SPACING_STYLES.PX_2,
                SPACING_STYLES.PY_2,
                TEXT_STYLES.TEXT_CENTER,
                TEXT_STYLES.TEXT_XS,
                TEXT_STYLES.FONT_SEMIBOLD,
                TEXT_STYLES.TEXT_GRAY_700,
                BORDER_STYLES.HEADER_BORDER_LEFT,
                BACKGROUND_STYLES.HEADER,
                LAYOUT_STYLES.FLEX_SHRINK_0
              )}
              style={{
                width: averageColumnWidth,
                minWidth: minColumnWidth
              }}
            >
              {getColumnLabel(index)}
            </div>
          ))}
        </div>
      </div>
    );
  }, [enableHeader, columnCount, rowNumberWidth, minColumnWidth, averageColumnWidth, totalWidth]);

  return (
    <div
      ref={ref}
      className={cn(LAYOUT_STYLES.CONTAINER, className)}
      {...props}
    >
      {/* 表头容器 - 使用两层结构实现冻结和滚动 */}
      <div className={cn(
        'sticky top-0 z-20',
        BACKGROUND_STYLES.HEADER,
        BORDER_STYLES.BORDER_BOTTOM,
        'overflow-hidden'
      )}>
        <div className={LAYOUT_STYLES.FLEX_ROW} style={{ width: `${totalWidth}px` }}>
          {/* 行号表头 - 冻结在左侧，不跟随滚动 */}
          <div
            className={cn(
              SPACING_STYLES.PX_2,
              SPACING_STYLES.PY_2,
              TEXT_STYLES.TEXT_CENTER,
              TEXT_STYLES.TEXT_XS,
              TEXT_STYLES.FONT_SEMIBOLD,
              TEXT_STYLES.TEXT_GRAY_700,
              BORDER_STYLES.HEADER_BORDER,
              BACKGROUND_STYLES.HEADER,
              LAYOUT_STYLES.FLEX_SHRINK_0,
              'sticky left-0',
              'z-30'
            )}
            style={{ width: `${rowNumberWidth}px` }}
          >
            #
          </div>

          {/* 可横向滚动的数据列表头 - 跟随数据区域滚动 */}
          <div
            ref={headerScrollRef}
            className={LAYOUT_STYLES.FLEX_ROW}
            style={{
              width: `${columnCount * averageColumnWidth}px`,
              transition: 'none' // 移除过渡动画，实现完全同步
            }}
          >
            {Array.from({ length: columnCount }, (_, index) => (
              <div
                key={index}
                className={cn(
                  SPACING_STYLES.PX_2,
                  SPACING_STYLES.PY_2,
                  TEXT_STYLES.TEXT_CENTER,
                  TEXT_STYLES.TEXT_XS,
                  TEXT_STYLES.FONT_SEMIBOLD,
                  TEXT_STYLES.TEXT_GRAY_700,
                  BORDER_STYLES.HEADER_BORDER_LEFT,
                  BACKGROUND_STYLES.HEADER,
                  LAYOUT_STYLES.FLEX_SHRINK_0
                )}
                style={{
                  width: averageColumnWidth,
                  minWidth: minColumnWidth
                }}
              >
                {getColumnLabel(index)}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 滚动容器 - 同时支持纵向和横向滚动 */}
      <div
        ref={tableContainerRef}
        className={LAYOUT_STYLES.SCROLL_CONTAINER_OPTIMIZED}
        style={{
          minHeight: `${SIZES.CONTAINER_HEIGHT_MIN}px`,
          maxHeight: `${SIZES.CONTAINER_HEIGHT_MAX}px`,
          width: '100%',
          overflowX: 'auto', // 确保横向滚动可用
          overflowY: 'auto',  // 确保纵向滚动可用
          // 启用硬件加速
          transform: 'translateZ(0)',
          // 优化滚动性能
          scrollBehavior: 'auto',
          // 创建新的层叠上下文
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
            const rowData = filteredData[virtualRow.index] || [];
            return (
              <div
                key={`${virtualRow.index}-${virtualRow.start}`}
                className={cn(LAYOUT_STYLES.FLEX_ROW, BORDER_STYLES.BORDER_BOTTOM)}
                style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  width: `${totalWidth}px`,
                  height: `${virtualRow.size}px`,
                  transform: `translateY(${virtualRow.start}px)`,
                  willChange: 'transform' // 优化GPU加速
                }}
                onClick={() => onRowClick?.(virtualRow.index, rowData)}
              >
                {/* 冻结的行号列 - 不跟随横向滚动 */}
                <div
                  className={cn(
                    SPACING_STYLES.PX_2,
                    SPACING_STYLES.PY_1,
                    TEXT_STYLES.TEXT_CENTER,
                    TEXT_STYLES.TEXT_XS,
                    TEXT_STYLES.TEXT_GRAY_500,
                    TEXT_STYLES.FONT_MEDIUM,
                    BORDER_STYLES.BORDER_RIGHT,
                    BACKGROUND_STYLES.CONTAINER,
                    LAYOUT_STYLES.FLEX_SHRINK_0,
                    'z-20'
                  )}
                  style={{
                    position: 'sticky',
                    left: 0,
                    zIndex: 20,
                    width: `${rowNumberWidth}px`
                  }}
                >
                  {(rowIndexMap[virtualRow.index] !== undefined ? rowIndexMap[virtualRow.index] : virtualRow.index) + 1}
                </div>

                {/* 可横向滚动的数据单元格区域 - 跟随数据区域滚动 */}
                <div className={LAYOUT_STYLES.FLEX_ROW} style={{
                  width: `${columnCount * averageColumnWidth}px`
                }}>
                  {Array.from({ length: columnCount }, (_, colIndex) => {
                    const cellValue = filteredData[virtualRow.index]?.[colIndex];
                    const isEmpty = isCellEmpty(cellValue);

                    const highlightClass = getCellHighlightClass(virtualRow.index, colIndex, rowIndexMap[virtualRow.index]);

                    return (
                      <div
                        key={colIndex}
                        className={cn(
                          SPACING_STYLES.PX_2,
                          SPACING_STYLES.PY_1,
                          TEXT_STYLES.TEXT_XS,
                          BORDER_STYLES.BORDER_LEFT,
                          LAYOUT_STYLES.FLEX_SHRINK_0,
                          TEXT_STYLES.TRUNCATE,
                          isEmpty ? cn(TEXT_STYLES.TEXT_GRAY_500, TEXT_STYLES.ITALIC) : TEXT_STYLES.TEXT_GRAY_900,
                          highlightClass
                        )}
                        style={{
                          width: averageColumnWidth,
                          minWidth: minColumnWidth
                        }}
                        title={formatCellValue(cellValue)}
                      >
                        {getCellDisplayText(cellValue)}
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 数据截断提示 - 与滚动容器紧贴 */}
      {maxRows && data.length > maxRows && (
        <div className={cn(
          TEXT_STYLES.TEXT_CENTER,
          SPACING_STYLES.PY_1,
          TEXT_STYLES.TEXT_XS,
          TEXT_STYLES.TEXT_GRAY_500,
          BACKGROUND_STYLES.INFO,
          BORDER_STYLES.DIVIDER,
          LAYOUT_STYLES.FLEX_SHRINK_0
        )}>
          ... 显示前 {maxRows} 行，共 {data.length} 行数据 ...
        </div>
      )}
    </div>
  );
});

VirtualExcelTable.displayName = 'VirtualExcelTable';

export default VirtualExcelTable;