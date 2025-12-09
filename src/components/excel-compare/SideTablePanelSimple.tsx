'use client';

import React, { useRef, useMemo, useCallback, useState, useEffect, useImperativeHandle, forwardRef } from 'react';
import VirtualExcelTable from './VirtualExcelTable';
import { cn } from '@/lib/utils';

// 操作类型样式映射
const sideDiffStyles = {
  KEEP: 'bg-gray-50 dark:bg-gray-800',
  MODIFY: 'bg-amber-50 dark:bg-amber-950',
  ADD: '', // 左侧ADD行去掉背景颜色，只保留斜线
  DELETE: '', // 右侧DELETE行去掉背景颜色，只保留斜线
  LEFT_DELETE: 'bg-red-50 dark:bg-red-950', // 左侧DELETE行保持红色背景
  RIGHT_ADD: 'bg-green-50 dark:bg-green-950' // 右侧ADD行保持绿色背景
};

// 单元格差异样式
const cellDiffStyles = {
  MODIFIED: 'bg-amber-200 dark:bg-amber-800 font-medium text-amber-900 dark:text-amber-100',
  UNCHANGED: 'bg-transparent'
};

/**
 * 比较两个单元格是否相等
 */
const areCellsEqual = (cell1: any, cell2: any): boolean => {
  // 处理 null/undefined/空字符串的情况
  const val1 = cell1 === null || cell1 === undefined || cell1 === '' ? '' : String(cell1).trim();
  const val2 = cell2 === null || cell2 === undefined || cell2 === '' ? '' : String(cell2).trim();

  return val1.toLowerCase() === val2.toLowerCase();
};

/**
 * 检测 MODIFY 行中哪些单元格发生了变化
 */
const detectCellChanges = (
  rowData: any[],
  originalRow: any[],
  modifiedRow: any[],
  side: 'left' | 'right'
): boolean[] => {
  if (!rowData || !originalRow || !modifiedRow) {
    return new Array(rowData?.length || 0).fill(false);
  }

  // 根据表格侧别选择对比数据
  const compareData = side === 'left' ? originalRow : modifiedRow;

  return rowData.map((cell, index) => {
    const originalCell = originalRow[index];
    const modifiedCell = modifiedRow[index];

    // 如果是 MODIFY 行，检查单元格是否真的发生了变化
    return !areCellsEqual(originalCell, modifiedCell);
  });
};

/**
 * 单侧表格面板组件 - 基于VirtualExcelTable扩展，处理差异显示
 */
interface SideTablePanelProps {
  data: any[][];
  rowNumbers: (number | null)[];
  diffTypes: ('KEEP' | 'MODIFY' | 'ADD' | 'DELETE')[];
  maxColumns: number;
  title: string;
  side?: 'left' | 'right'; // 标识是左侧还是右侧表格
  onScroll?: (e: React.UIEvent<HTMLDivElement>) => void;
  onRowClick?: (rowIndex: number, row: any[]) => void;
  onHorizontalScroll?: (e: React.UIEvent<HTMLDivElement>) => void; // 新增横向滚动处理
  estimateRowHeight?: number | ((index: number) => number);
  maxRows?: number;
  className?: string;
  // 添加原始数据和修改后数据，用于单元格级别差异检测
  originalData?: any[][];
  modifiedData?: any[][];
}

const SideTablePanelSimple = forwardRef<HTMLDivElement, SideTablePanelProps>(({
  data,
  rowNumbers,
  diffTypes,
  maxColumns,
  title,
  side,
  onScroll,
  onHorizontalScroll,
  onRowClick,
  estimateRowHeight = 32,
  maxRows,
  className,
  originalData,
  modifiedData
}, ref) => {
  const tableRef = useRef<HTMLDivElement>(null);
  const headerScrollRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // 添加斜线阴影样式
  useEffect(() => {
    // 检查是否已经添加了样式
    if (document.getElementById('add-line-shadow-style')) return;

    const style = document.createElement('style');
    style.id = 'add-line-shadow-style';
    style.textContent = `
      .add-line-shadow::before {
        content: '';
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background-image: repeating-linear-gradient(
          45deg,
          transparent,
          transparent 2px,
          rgba(34, 197, 94, 0.1) 2px,
          rgba(34, 197, 94, 0.1) 4px
        );
        pointer-events: none;
        z-index: 1;
      }
      .dark .add-line-shadow::before {
        background-image: repeating-linear-gradient(
          45deg,
          transparent,
          transparent 2px,
          rgba(34, 197, 94, 0.2) 2px,
          rgba(34, 197, 94, 0.2) 4px
        );
      }
      .delete-line-shadow::before {
        content: '';
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background-image: repeating-linear-gradient(
          45deg,
          transparent,
          transparent 2px,
          rgba(239, 68, 68, 0.1) 2px,
          rgba(239, 68, 68, 0.1) 4px
        );
        pointer-events: none;
        z-index: 1;
      }
      .dark .delete-line-shadow::before {
        background-image: repeating-linear-gradient(
          45deg,
          transparent,
          transparent 2px,
          rgba(239, 68, 68, 0.2) 2px,
          rgba(239, 68, 68, 0.2) 4px
        );
      }
    `;
    document.head.appendChild(style);

    return () => {
      // 清理样式
      if (document.getElementById('add-line-shadow-style')) {
        document.head.removeChild(style);
      }
    };
  }, []);

  // 暴露滚动容器引用给父组件
  useImperativeHandle(ref, () => tableRef.current!, []);

  // 计算容器宽度，用于自适应布局
  const [containerWidth, setContainerWidth] = useState(0);

  useEffect(() => {
    const updateWidth = () => {
      if (containerRef.current) {
        const width = containerRef.current.clientWidth;
        setContainerWidth(width);
      }
    };

    updateWidth();

    const resizeObserver = new ResizeObserver(updateWidth);
    if (containerRef.current) {
      resizeObserver.observe(containerRef.current);
    }

    return () => resizeObserver.disconnect();
  }, []);

  // 计算列宽：少列时自适应容器宽度，多列时使用固定宽度
  const rowNumberWidth = 64;
  const minColumnWidth = 120; // 最小列宽
  const maxColumnWidth = 300; // 最大列宽，防止列过宽

  // 计算自适应列宽
  const availableWidth = containerWidth - rowNumberWidth;
  const adaptiveColumnWidth = maxColumns > 0 ? Math.min(
    Math.max(minColumnWidth, availableWidth / maxColumns),
    maxColumnWidth
  ) : minColumnWidth;

  // 当列数较少（列能适应容器）时使用自适应宽度，否则使用固定最小宽度
  const useAdaptiveWidth = maxColumns * minColumnWidth <= availableWidth;
  const averageColumnWidth = useAdaptiveWidth ? adaptiveColumnWidth : minColumnWidth;
  const totalWidth = rowNumberWidth + maxColumns * averageColumnWidth;

  // 生成表头数据
  const headerData = useMemo(() => {
    const headers = [];
    for (let i = 0; i < maxColumns; i++) {
      let label = '';
      let columnIndex = i;
      while (columnIndex >= 0) {
        label = String.fromCharCode(65 + (columnIndex % 26)) + label;
        columnIndex = Math.floor(columnIndex / 26) - 1;
      }
      headers.push(label);
    }
    return headers;
  }, [maxColumns]);

  // 同步横向滚动
  const handleDataScroll = useCallback((e: React.UIEvent<HTMLDivElement>) => {
    const scrollContainer = e.currentTarget;
    const scrollLeft = scrollContainer.scrollLeft;

    // 同步表头的横向滚动
    if (headerScrollRef.current) {
      headerScrollRef.current.style.transform = `translateX(-${scrollLeft}px)`;
    }

    // 调用外部传入的垂直滚动处理函数（用于左右表格垂直同步）
    onScroll?.(e);

    // 调用外部传入的横向滚动处理函数（用于左右表格横向同步）
    onHorizontalScroll?.(e);
  }, [onScroll, onHorizontalScroll]);

  return (
    <div ref={containerRef} className={cn('flex-1 min-w-0', className)}>
      {/* 面板标题 - 只在没有文件名时显示 */}
      {title && (
        <div className="mb-4">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
            {title}
          </h3>
        </div>
      )}

      {/* 表格容器 */}
      <div className="bg-white dark:bg-gray-900">
        {/* 自定义表头 - 使用两层结构实现冻结和滚动 */}
        <div className="sticky top-0 z-20 bg-gray-100 dark:bg-gray-800 border-b-2 border-gray-300 dark:border-gray-600 overflow-hidden">
          <div className="flex">
            {/* 行号表头 - 冻结在左侧，不跟随滚动 */}
            <div
              className="px-2 py-1 text-center text-xs font-semibold border-r border-gray-300 dark:border-gray-600 bg-gray-100 dark:bg-gray-800 flex-shrink-0 sticky left-0 z-30"
              style={{ width: '64px' }}
            >
              #
            </div>

            {/* 可横向滚动的数据列表头 - 跟随数据区域滚动 */}
            <div
              ref={headerScrollRef}
              className="flex"
              style={{
                width: `${maxColumns * averageColumnWidth}px`,
                transition: 'none' // 移除过渡动画，实现完全同步
              }}
            >
              {headerData.map((header, index) => (
                <div
                  key={index}
                  className="px-2 py-1 text-center text-xs font-semibold border-l border-gray-300 dark:border-gray-600 bg-gray-100 dark:bg-gray-800 flex-shrink-0"
                  style={{
                    width: averageColumnWidth,
                    minWidth: minColumnWidth,
                    maxWidth: maxColumnWidth
                  }}
                >
                  {header}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* 虚拟化表格数据区域 */}
        <div
          ref={tableRef}
          className="overflow-auto"
          onScroll={handleDataScroll}
          style={{
            maxHeight: '600px',
            minHeight: 'auto',
            overflowX: 'auto', // 确保横向滚动可用
            overflowY: 'auto'  // 确保纵向滚动可用
          }}
        >
          {/* 简化版的数据渲染 */}
          <div style={{
            minHeight: `${(data.length * Number(estimateRowHeight))}px`,
            minWidth: `${totalWidth}px`, // 确保有最小宽度
            width: `${totalWidth}px`     // 固定宽度以支持横向滚动
          }}>
            {data.map((rowData, index) => {
              const diffType = diffTypes[index];
              const rowNumber = rowNumbers[index];
              // 根据左右侧别和操作类型确定样式
              let rowStyle = sideDiffStyles.KEEP;
              if (diffType === 'ADD' && side === 'right') {
                rowStyle = sideDiffStyles.RIGHT_ADD; // 右侧ADD行使用绿色背景
              } else if (diffType === 'DELETE' && side === 'left') {
                rowStyle = sideDiffStyles.LEFT_DELETE; // 左侧DELETE行保持红色背景
              } else if (sideDiffStyles[diffType]) {
                rowStyle = sideDiffStyles[diffType]; // 使用其他预设样式
              }

              const isEmpty = !rowData || rowData.length === 0;
              // 只有右侧表格的删除行需要隐藏内容，左侧表格应该显示原始数据
              const isRightSideDelete = diffType === 'DELETE' && side === 'right'; // 只对右侧删除行隐藏内容
              // 左侧表格的 ADD 行需要显示斜线阴影区域
              const isLeftSideAdd = diffType === 'ADD' && side === 'left';
              // 右侧表格的 DELETE 行需要显示红色斜线阴影区域
              const isRightSideDeleteLine = diffType === 'DELETE' && side === 'right';

              // 对于 MODIFY 行，检测单元格级别的变化
              const cellChanges = diffType === 'MODIFY' && originalData && modifiedData
                ? detectCellChanges(
                    rowData,
                    originalData[index] || [],
                    modifiedData[index] || [],
                    side || 'left'
                  )
                : new Array(maxColumns).fill(false);

              return (
                <div
                  key={index}
                  className={cn(
                    'flex border-b transition-colors relative h-full',
                    // 整行背景色设置
                    diffType === 'KEEP' ? 'bg-gray-50 dark:bg-gray-800' :
                    diffType === 'MODIFY' ? 'bg-amber-50 dark:bg-amber-950' :
                    diffType === 'ADD' && side === 'right' ? 'bg-green-50 dark:bg-green-950' :
                    diffType === 'DELETE' && side === 'left' ? 'bg-red-50 dark:bg-red-950' :
                    'bg-white dark:bg-gray-900',
                    // 为左侧 ADD 行添加斜线阴影
                    isLeftSideAdd ? 'add-line-shadow' : '',
                    // 为右侧 DELETE 行添加红色斜线阴影
                    isRightSideDeleteLine ? 'delete-line-shadow' : ''
                  )}
                  onClick={() => onRowClick?.(index, rowData)}
                >
                  {/* 行号列 - 冻结在左侧，不跟随横向滚动 */}
                  <div
                    className={cn(
                      'px-2 py-1 text-center text-xs font-medium border-r border-gray-200 dark:border-gray-700 flex-shrink-0 sticky left-0 z-20 flex items-center justify-center',
                      // 行号列文字颜色，背景色继承父元素
                      diffType === 'KEEP' ? 'text-gray-700 dark:text-gray-300' :
                      diffType === 'MODIFY' ? 'text-amber-700 dark:text-amber-300 font-semibold' :
                      diffType === 'ADD' && side === 'right' ? 'text-green-700 dark:text-green-300' :
                      diffType === 'ADD' ? 'text-green-700 dark:text-green-300' :
                      diffType === 'DELETE' && side === 'left' ? 'text-red-700 dark:text-red-300' :
                      diffType === 'DELETE' ? 'text-red-700 dark:text-red-300' :
                      'text-gray-700 dark:text-gray-300',
                      rowNumber ? '' : 'text-transparent'
                    )}
                    style={{
                      width: `${rowNumberWidth}px`,
                      position: 'sticky',
                      left: 0,
                      zIndex: 20,
                      height: '100%' // 确保高度填满外层容器
                    }}
                  >
                    {isLeftSideAdd ? '' : (rowNumber || '')}
                  </div>

                  {/* 可横向滚动的数据单元格区域 */}
                  <div className="flex" style={{
                    width: `${maxColumns * averageColumnWidth}px`,
                    height: '100%' // 确保高度填满外层容器
                  }}>
                    {Array.from({ length: maxColumns }, (_, colIndex) => {
                      const cellValue = rowData[colIndex];
                      const isEmptyCell = cellValue === null || cellValue === undefined || cellValue === '';
                      const isCellModified = cellChanges[colIndex];

                      return (
                        <div
                          key={colIndex}
                          className={cn(
                            'px-2 py-1 text-xs border-l border-gray-100 dark:border-gray-800 flex-shrink-0 truncate flex items-center',
                            // 对于 MODIFY 行，只对发生变化的单元格应用高亮背景
                            diffType === 'MODIFY' && isCellModified
                              ? 'bg-amber-200 dark:bg-amber-800 font-medium text-amber-900 dark:text-amber-100'
                              : 'bg-transparent',
                            // 文字颜色设置
                            isRightSideDelete ? 'text-transparent' :
                            isEmptyCell ? 'text-gray-400 dark:text-gray-600 italic' :
                            (diffType === 'MODIFY' && isCellModified)
                              ? 'text-amber-900 dark:text-amber-100'
                              : 'text-gray-900 dark:text-gray-100'
                          )}
                          style={{
                            width: averageColumnWidth,
                            minWidth: minColumnWidth,
                            maxWidth: maxColumnWidth,
                            height: '100%' // 确保高度填满父容器
                          }}
                          title={isRightSideDelete ? '' : (cellValue?.toString() || '')}
                        >
                          {isRightSideDelete ? '' : (isLeftSideAdd ? '' : (isEmptyCell ? '(空)' : cellValue?.toString() || ''))}
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
});

SideTablePanelSimple.displayName = 'SideTablePanelSimple';

export default SideTablePanelSimple;