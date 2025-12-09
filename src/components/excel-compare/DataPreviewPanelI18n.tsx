'use client';

import React, { useMemo } from 'react';
import VirtualExcelTable from './VirtualExcelTable';
import { Button } from '@/components/ui/button';
import { Trash2, FileSpreadsheet, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import SheetSelectorI18n from './SheetSelectorI18n';
import type { DataPreviewPanelProps } from '@/types/excel';
import { ExcelParser } from '@/lib/excelParser';
import { useDictionary } from '@/hooks/useDictionary';
import Image from 'next/image';

/**
 * 数据预览面板组件（支持国际化 + 虚拟化版本）
 * 显示解析后的Excel数据，支持Sheet切换和重新上传
 * 使用虚拟滚动技术大幅提升大数据性能
 */
export default function DataPreviewPanelI18n({
  excelData,
  fileName,
  onSheetChange,
  onReupload,
  loading = false,
  className
}: DataPreviewPanelProps) {
  const { dictionary, loading: dictLoading } = useDictionary();
  const t = dictionary?.excelUpload?.preview || {};

  // 获取当前Sheet的数据
  const currentSheetData = useMemo(() => {
    return excelData.data[excelData.activeSheet] || [];
  }, [excelData.data, excelData.activeSheet]);

  // 获取Sheet统计信息
  const sheetStats = useMemo(() => {
    return ExcelParser.getSheetStatistics(excelData, excelData.activeSheet);
  }, [excelData]);

  // 获取预览数据（移除行数限制，显示所有行）
  const previewData = useMemo(() => {
    return currentSheetData;
  }, [currentSheetData]);

  // 判断是否有数据
  const hasData = previewData.length > 0 &&
    previewData.some(row => row && row.length > 0 && row.some(cell => cell !== null && cell !== ''));

  // 获取表格列数（取数据行和表头中的最大值）
  const columnCount = useMemo(() => {
    const maxColumnsInData = Math.max(
      ...previewData.map(row => row ? row.length : 0)
    );
    return Math.max(sheetStats.totalColumns, maxColumnsInData);
  }, [sheetStats, previewData]);

  if (loading || dictLoading) {
    return (
      <div className={cn('flex flex-col items-center justify-center p-8 bg-gray-50 dark:bg-gray-900 rounded-lg', className)}>
        <Loader2 className="h-8 w-8 animate-spin text-blue-500 mb-4" />
        <p className="text-gray-600 dark:text-gray-400">{t.loading || '正在解析Excel文件...'}</p>
      </div>
    );
  }

  return (
    <div className={cn('flex flex-col bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 h-fit', className)}>
      {/* 文件名信息栏 - 样式和对比结果表格一致 */}
      <div className="flex-shrink-0 border-b border-gray-200 dark:border-gray-700 bg-gray-100 dark:bg-gray-800 p-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Image src="/favicon.svg" alt="Logo" width={16} height={16} />
            <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
              {fileName}
            </span>
          </div>
          {/* 删除按钮移到右上角 */}
          <button
            onClick={onReupload}
            className="p-1.5 rounded-md hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300"
            title={t.reupload || '删除'}
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* 数据预览区域 */}
      <div className="flex flex-col overflow-hidden flex-1">
        {!hasData ? (
          // 空数据状态
          <div className="flex flex-col items-center justify-center h-full p-8 text-gray-500 dark:text-gray-400">
            <FileSpreadsheet className="h-12 w-12 mb-4 opacity-50" />
            <p className="text-lg font-medium mb-2">{t.emptyWorksheet || '当前工作表无数据'}</p>
            <p className="text-sm">
              {sheetStats.totalRows === 0
                ? t.emptyWorksheetMessage || '工作表为空'
                : t.noDataMessage || '工作表仅包含格式或空单元格'
              }
            </p>
            {excelData.sheetNames.length > 1 && (
              <p className="text-sm mt-2">
                {t.emptyWorksheetTryOther || '尝试切换到其他工作表查看数据'}
              </p>
            )}
          </div>
        ) : (
          // 虚拟化Excel表格
          <div className="w-full h-[500px] overflow-hidden">
            <VirtualExcelTable
              data={previewData}
              columnCount={columnCount}
              estimateRowHeight={32}
              overscan={50}
              enableHeader={true}
              className="w-full"
            />
          </div>
        )}
      </div>

      {/* 底部固定工具栏 */}
      <div className="flex-shrink-0 border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-3 sm:space-y-0">
          {/* Sheet选择器 */}
          <SheetSelectorI18n
            sheetNames={excelData.sheetNames}
            activeSheet={excelData.activeSheet}
            onSheetChange={onSheetChange}
          />

          {/* 数据统计 */}
          <div className="flex items-center space-x-4 text-xs sm:text-sm text-gray-600 dark:text-gray-400">
            <span>{sheetStats.totalRows} {t.rows || '行'}</span>
            {sheetStats.totalColumns > 0 && (
              <span>{sheetStats.totalColumns} {t.columns || '列'}</span>
            )}
            {!sheetStats.hasData && (
              <span className="text-orange-500 dark:text-orange-400">
                ({t.emptyWorksheet || '工作表为空'})
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}