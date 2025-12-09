'use client';

import React, { useState } from 'react';
import FileUploadZoneI18n from './FileUploadZoneI18n';
import DataPreviewPanelTwoColumn from './DataPreviewPanelTwoColumn';
import type { ExcelData } from '@/types/excel';
import { ExcelParser } from '@/lib/excelParser';
import { cn } from '@/lib/utils';
import { useDictionary } from '@/hooks/useDictionary';
import { Search, Loader2 } from 'lucide-react';
import { ExcelColumnIntersect } from '@/lib/diffTwoColumns';
import { Switch } from '@/components/ui/switch';

/**
 * Excel 文件上传相关类型定义
 */
interface FilePanelData {
  file: File | null;
  fileName: string;
  excelData: ExcelData | null;
  loading: boolean;
  error: string | null;
  selectedColumn: string; // 新增：选中的列
}

/**
 * Excel 文件上传区域主组件（两列对比版本）
 * 专门用于 compare-two-columns 页面，在文件名后面增加了列选择下拉框
 */
interface ExcelUploadAreaTwoColumnProps {
  className?: string;
}

export default function ExcelUploadAreaTwoColumn({ className }: ExcelUploadAreaTwoColumnProps) {
  const { dictionary } = useDictionary();

  const [leftPanel, setLeftPanel] = useState<FilePanelData>({
    file: null,
    fileName: '',
    excelData: null,
    loading: false,
    error: null,
    selectedColumn: 'A' // 默认选中 A 列
  });

  const [rightPanel, setRightPanel] = useState<FilePanelData>({
    file: null,
    fileName: '',
    excelData: null,
    loading: false,
    error: null,
    selectedColumn: 'A' // 默认选中 A 列
  });

  // 计算状态
  const [isCalculating, setIsCalculating] = useState(false);

  // 算法计算结果
  const [comparisonResult, setComparisonResult] = useState<any>(null);

  // 仅查看相同的开关状态
  const [showOnlySame, setShowOnlySame] = useState(false);

  // 仅查看不相同的开关状态
  const [showOnlyDifferent, setShowOnlyDifferent] = useState(false);

  // 处理仅查看相同开关变化（包含互斥逻辑）
  const handleShowOnlySameChange = (checked: boolean) => {
    setShowOnlySame(checked);
    if (checked) {
      setShowOnlyDifferent(false);
    }
  };

  // 处理仅查看不相同开关变化（包含互斥逻辑）
  const handleShowOnlyDifferentChange = (checked: boolean) => {
    setShowOnlyDifferent(checked);
    if (checked) {
      setShowOnlySame(false);
    }
  };

  // 处理文件上传
  const handleFileUpload = async (file: File, panel: 'left' | 'right') => {
    const setPanel = panel === 'left' ? setLeftPanel : setRightPanel;

    // 立即设置加载状态，确保动画立即显示
    setPanel(prev => ({
      ...prev,
      file,
      fileName: file.name,
      loading: true,
      error: null
    }));

    // 使用 setTimeout 确保加载状态先渲染
    await new Promise(resolve => setTimeout(resolve, 50));

    try {
      // 解析 Excel 文件
      const result = await ExcelParser.parseExcelFile(file);

      if (result.success && result.data) {
        setPanel({
          file,
          fileName: file.name,
          excelData: result.data,
          loading: false,
          error: null,
          selectedColumn: 'A' // 重置为默认选中 A 列
        });

        } else {
        setPanel({
          file,
          fileName: file.name,
          excelData: null,
          loading: false,
          error: result.errorMessage || '文件解析失败',
          selectedColumn: 'A'
        });
      }
    } catch (error) {
      console.error('文件上传失败:', error);
      setPanel({
        file,
        fileName: file.name,
        excelData: null,
        loading: false,
        error: '文件上传失败，请重试',
        selectedColumn: 'A'
      });
    }
  };

  // 处理 Sheet 切换
  const handleSheetChange = (sheetName: string, panel: 'left' | 'right') => {
    const setPanel = panel === 'left' ? setLeftPanel : setRightPanel;
    setPanel(prev => ({
      ...prev,
      excelData: prev.excelData ? {
        ...prev.excelData,
        activeSheet: sheetName
      } : null
    }));
  };

  // 处理列切换
  const handleColumnChange = async (column: string, panel: 'left' | 'right') => {
    const setPanel = panel === 'left' ? setLeftPanel : setRightPanel;

    // 更新列选择状态
    setPanel(prev => ({
      ...prev,
      selectedColumn: column
    }));

    // 等待状态更新完成，然后执行对比
    // 使用setTimeout确保React状态更新完成
    await new Promise(resolve => setTimeout(resolve, 10));

    // 如果两个文件都已上传，则执行新的对比
    if (leftPanel.excelData && rightPanel.excelData) {
      // 获取当前左右两侧选中的列
      const currentLeftColumn = panel === 'left' ? column : leftPanel.selectedColumn;
      const currentRightColumn = panel === 'right' ? column : rightPanel.selectedColumn;

      // 执行对比，传递当前的列选择
      await executeComparisonWithColumns(currentLeftColumn, currentRightColumn);
    }
  };

  // 处理重新上传
  const handleReupload = (panel: 'left' | 'right') => {
    const setPanel = panel === 'left' ? setLeftPanel : setRightPanel;

    setPanel({
      file: null,
      fileName: '',
      excelData: null,
      loading: false,
      error: null,
      selectedColumn: 'A'
    });

    // 重置开关状态
    setShowOnlySame(false);
    setShowOnlyDifferent(false);
  };

  // 计算按钮启用状态 - 只有当两个文件都成功上传并解析后才能启用
  const isFindDifferenceEnabled = leftPanel.excelData !== null && rightPanel.excelData !== null;

  // 数据提取函数：从 ExcelData 中提取指定 Sheet 的二维数组数据
  const extractSheetData = (excelData: ExcelData | null): any[][] | null => {
    if (!excelData || !excelData.activeSheet || !excelData.data) {
      return null;
    }

    const sheetData = excelData.data[excelData.activeSheet];
    if (!Array.isArray(sheetData)) {
      return null;
    }

    return sheetData;
  };

  // 执行对比的通用函数，接受指定的列参数
  const executeComparisonWithColumns = async (leftColumn: string, rightColumn: string) => {
    if (!leftPanel.excelData || !rightPanel.excelData) return;

    // 立即设置计算状态，确保UI立即响应
    setIsCalculating(true);

    // 使用 setTimeout 确保状态更新被渲染
    await new Promise(resolve => setTimeout(resolve, 50));

    const startTime = performance.now();

    try {
      // 数据验证
      if (!leftPanel.excelData || !rightPanel.excelData) {
        throw new Error('Excel data is missing from one or both panels');
      }

      // 提取数据
      const leftData = extractSheetData(leftPanel.excelData);
      const rightData = extractSheetData(rightPanel.excelData);

      if (!leftData || !rightData) {
        throw new Error('Failed to extract sheet data - please check if sheets are properly loaded');
      }

      // 初始化 ExcelColumnIntersect 算法
      const matcher = new ExcelColumnIntersect({
        ignoreWhitespace: true,
        ignoreCase: true,
        ignoreEmpty: true
      });

      // 执行两列交集对比，传递指定的列参数
      const algorithmStartTime = performance.now();

  
      // 使用 ExcelColumnIntersect 的内部方法解析列索引
      const leftColIndex = matcher._parseColumnIndex(leftColumn);
      const rightColIndex = matcher._parseColumnIndex(rightColumn);
  
      const result = matcher.compare(
        leftData,
        leftColumn,
        rightData,
        rightColumn
      );

      const algorithmEndTime = performance.now();
      const algorithmDuration = algorithmEndTime - algorithmStartTime;

      if (!result) {
        throw new Error('Algorithm execution failed - invalid result structure');
      }

      const endTime = performance.now();
      const totalDuration = endTime - startTime;

      // 保存计算结果
      setComparisonResult(result);

      // 重置计算状态
      setIsCalculating(false);

    } catch (error) {
      console.error('两列对比算法执行失败:', error);
      setIsCalculating(false);
    }
  };

  // 处理 Find Difference 按钮点击
  const handleFindDifference = async () => {
    // 使用当前选择的列执行对比
    await executeComparisonWithColumns(leftPanel.selectedColumn, rightPanel.selectedColumn);
  };

  // 清除比较结果
  const handleClearComparison = () => {
    setComparisonResult(null);
  };

  return (
    <section className={cn('space-y-4', className)}>
      {/* Find Difference 按钮 - 放在最顶部 */}
      {leftPanel.excelData && rightPanel.excelData && (
        <div className="flex justify-center">
          <button
            onClick={handleFindDifference}
            disabled={!isFindDifferenceEnabled || isCalculating}
            className={cn(
              'px-6 py-3 rounded-lg font-medium text-sm transition-all duration-200 min-w-[180px] flex items-center justify-center gap-2',
              // 启用状态样式 - 黑色主题
              isFindDifferenceEnabled && !isCalculating
                ? 'bg-black hover:bg-gray-800 text-white shadow-md hover:shadow-lg transform hover:scale-105 cursor-pointer'
                : 'bg-gray-600 text-white cursor-not-allowed',
              // 禁用状态样式
              'focus:outline-none focus:ring-2 focus:ring-offset-2',
              isFindDifferenceEnabled && !isCalculating
                ? 'focus:ring-gray-800'
                : 'focus:ring-gray-600'
            )}
          >
            {isCalculating ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                {dictionary?.excelUpload?.comparing || 'Comparing'}
              </>
            ) : (
              <>
                <Search className="w-4 h-4" />
                {dictionary?.excelUpload?.findDifferenceButton || 'Find Difference'}
              </>
            )}
          </button>
        </div>
      )}

      {/* 两列对比统计信息 */}
      {comparisonResult && comparisonResult.stats && (
        <div className="flex items-center justify-center">
          <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-900 rounded-md border border-gray-200 dark:border-gray-700 w-full">
            <div className="flex items-center space-x-6 text-sm">
              <span className="text-gray-700 dark:text-gray-300">
                <span className="font-medium">
                  {dictionary?.excelUpload?.comparingColumns?.replace('{leftCol}', leftPanel.selectedColumn).replace('{rightCol}', rightPanel.selectedColumn) ||
                   `Comparing: Col ${leftPanel.selectedColumn} & ${rightPanel.selectedColumn}`}
                </span>
              </span>
              <span className="text-green-600 dark:text-green-400">
                <span className="font-medium">
                  {dictionary?.excelUpload?.matchRows?.replace('{count}', comparisonResult.stats.commonKeys.toLocaleString()) ||
                   `Match: ${comparisonResult.stats.commonKeys.toLocaleString()}`}
                </span>
              </span>
              <span className="text-red-600 dark:text-red-400">
                <span className="font-medium">
                  {dictionary?.excelUpload?.leftUnique?.replace('{count}', comparisonResult.tableA.filter((row: any) => row.status === 'DIFF').length.toLocaleString()) ||
                   `Left Unique: ${comparisonResult.tableA.filter((row: any) => row.status === 'DIFF').length.toLocaleString()}`}
                </span>
              </span>
              <span className="text-red-600 dark:text-red-400">
                <span className="font-medium">
                  {dictionary?.excelUpload?.rightUnique?.replace('{count}', comparisonResult.tableB.filter((row: any) => row.status === 'DIFF').length.toLocaleString()) ||
                   `Right Unique: ${comparisonResult.tableB.filter((row: any) => row.status === 'DIFF').length.toLocaleString()}`}
                </span>
              </span>
            </div>
            <div className="flex items-center space-x-6 text-sm">
              <div className="flex items-center space-x-1">
                <span className="text-gray-600 dark:text-gray-400">
                  <span className="font-medium">
                    {dictionary?.excelUpload?.showDiffs || 'Show Diffs'}
                  </span>
                </span>
                <Switch
                  checked={showOnlyDifferent}
                  onCheckedChange={handleShowOnlyDifferentChange}
                />
              </div>
              <div className="flex items-center space-x-3">
                <span className="text-gray-600 dark:text-gray-400">
                  <span className="font-medium">
                    {dictionary?.excelUpload?.showMatches || 'Show Matches'}
                  </span>
                </span>
                <Switch
                  checked={showOnlySame}
                  onCheckedChange={handleShowOnlySameChange}
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 上传区域 */}
      <div className="space-y-4">
        {/* 隐私提示信息 - 移动端优先显示 */}
        <div className="lg:hidden">
          <p className="text-center text-sm text-gray-600 dark:text-gray-400 py-2 px-4">
            {dictionary?.excelUpload?.privacyNotice || 'Your data never leaves your browser. 100% Private.'}
          </p>
        </div>

        {/* 文件上传区域 */}
        <div className="flex flex-col lg:flex-row gap-6">
        {/* 左侧面板 */}
        <div className="flex-1 min-w-0 lg:min-w-[400px]">
          {leftPanel.file && !leftPanel.loading && leftPanel.excelData ? (
            <DataPreviewPanelTwoColumn
              excelData={leftPanel.excelData}
              fileName={leftPanel.fileName}
              onSheetChange={(sheetName) => handleSheetChange(sheetName, 'left')}
              onColumnChange={(column) => handleColumnChange(column, 'left')}
              selectedColumn={leftPanel.selectedColumn}
              onReupload={() => {
                handleReupload('left');
                handleClearComparison();
              }}
              loading={false}
              comparisonResult={comparisonResult}
              panelSide="left"
              showOnlySame={showOnlySame}
              showOnlyDifferent={showOnlyDifferent}
            />
          ) : (
            <FileUploadZoneI18n
              onFileUpload={(file: File) => handleFileUpload(file, 'left')}
              uploading={leftPanel.loading}
              error={leftPanel.error}
              fileName={leftPanel.fileName}
            />
          )}
        </div>

        {/* 右侧面板 */}
        <div className="flex-1 min-w-0 lg:min-w-[400px]">
          {rightPanel.file && !rightPanel.loading && rightPanel.excelData ? (
            <DataPreviewPanelTwoColumn
              excelData={rightPanel.excelData}
              fileName={rightPanel.fileName}
              onSheetChange={(sheetName) => handleSheetChange(sheetName, 'right')}
              onColumnChange={(column) => handleColumnChange(column, 'right')}
              selectedColumn={rightPanel.selectedColumn}
              onReupload={() => {
                handleReupload('right');
                handleClearComparison();
              }}
              loading={false}
              comparisonResult={comparisonResult}
              panelSide="right"
              showOnlySame={showOnlySame}
              showOnlyDifferent={showOnlyDifferent}
            />
          ) : (
            <FileUploadZoneI18n
              onFileUpload={(file: File) => handleFileUpload(file, 'right')}
              uploading={rightPanel.loading}
              error={rightPanel.error}
              fileName={rightPanel.fileName}
            />
          )}
        </div>
      </div>

      {/* 隐私提示信息 - 桌面端显示 */}
      <div className="hidden lg:block">
        <p className="text-center text-sm text-gray-600 dark:text-gray-400 py-2 px-4">
          {dictionary?.excelUpload?.privacyNotice || 'Your data never leaves your browser. 100% Private.'}
        </p>
      </div>
      </div>

      {/* 计算状态指示器 */}
      {isCalculating && (
        <div className="flex flex-col items-center justify-center p-8 bg-gray-50 dark:bg-gray-900 rounded-lg">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400 text-sm">
            {dictionary?.excelUpload?.calculating || '正在计算差异...'}
          </p>
        </div>
      )}
      </section>
  );
}