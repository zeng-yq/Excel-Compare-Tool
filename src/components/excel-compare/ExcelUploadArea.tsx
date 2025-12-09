'use client';

import React, { useState, useMemo } from 'react';
import FileUploadZoneI18n from './FileUploadZoneI18n';
import DataPreviewPanelI18n from './DataPreviewPanelI18n';
import DualDiffTableOptimized from './DualDiffTableOptimized';
import type { ExcelData } from '@/types/excel';
import { ExcelParser } from '@/lib/excelParser';
import { cn } from '@/lib/utils';
import { useDictionary } from '@/hooks/useDictionary';
import { Search, ArrowLeft, Loader2 } from 'lucide-react';
import '@/lib/patienceDiff'; // 静态导入 patienceDiff

/**
 * Excel 文件上传相关类型定义
 */
interface FilePanelData {
  file: File | null;
  fileName: string;
  excelData: ExcelData | null;
  loading: boolean;
  error: string | null;
}

/**
 * Excel 文件上传区域主组件
 * 管理左右两个文件的上传状态和数据预览
 */
interface ExcelUploadAreaProps {
  className?: string;
}

export default function ExcelUploadArea({ className }: ExcelUploadAreaProps) {
  const { dictionary } = useDictionary();

  const [leftPanel, setLeftPanel] = useState<FilePanelData>({
    file: null,
    fileName: '',
    excelData: null,
    loading: false,
    error: null
  });

  const [rightPanel, setRightPanel] = useState<FilePanelData>({
    file: null,
    fileName: '',
    excelData: null,
    loading: false,
    error: null
  });

  // 差异显示相关状态
  const [diffResult, setDiffResult] = useState<any[] | null>(null);
  const [showDiffView, setShowDiffView] = useState(false);
  const [isCalculating, setIsCalculating] = useState(false);

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
          error: null
        });

        } else {
        setPanel({
          file,
          fileName: file.name,
          excelData: null,
          loading: false,
          error: result.errorMessage || '文件解析失败'
        });
      }
    } catch (error) {
      console.error('文件上传失败:', error);
      setPanel({
        file,
        fileName: file.name,
        excelData: null,
        loading: false,
        error: '文件上传失败，请重试'
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

  // 处理重新上传
  const handleReupload = (panel: 'left' | 'right') => {
    const setPanel = panel === 'left' ? setLeftPanel : setRightPanel;

    setPanel({
      file: null,
      fileName: '',
      excelData: null,
      loading: false,
      error: null
    });
  };

  // 计算按钮启用状态 - 只有当两个文件都成功上传并解析后才能启用
  const isFindDifferenceEnabled = useMemo(() => {
    return leftPanel.excelData !== null && rightPanel.excelData !== null;
  }, [leftPanel.excelData, rightPanel.excelData]);

  // 数据提取函数：从 ExcelData 中提取指定 Sheet 的二维数组数据
  const extractSheetData = React.useCallback((excelData: ExcelData | null): any[][] | null => {
    if (!excelData || !excelData.activeSheet || !excelData.data) {
      return null;
    }

    const sheetData = excelData.data[excelData.activeSheet];
    if (!Array.isArray(sheetData)) {
      return null;
    }

    return sheetData;
  }, []);

  // 处理 Find Difference 按钮点击
  const handleFindDifference = async () => {
    if (!isFindDifferenceEnabled) return;

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

  
      // ExcelDiff 已通过静态导入加载到全局 window 对象
      if (typeof window === 'undefined' || !(window as any).ExcelDiff) {
        throw new Error('ExcelDiff class is not available');
      }

      const ExcelDiff = (window as any).ExcelDiff;

      // 初始化 Patience Diff 算法
      const differ = new ExcelDiff({
        ignoreWhitespace: true,
        ignoreCase: true,
        nullAsEmpty: true
      });

      // 执行差异对比
      const algorithmStartTime = performance.now();

      const result = differ.compare(leftData, rightData);

      const algorithmEndTime = performance.now();
      const algorithmDuration = algorithmEndTime - algorithmStartTime;

      if (!result || !result.ops || !result.view) {
        throw new Error('Algorithm execution failed - invalid result structure');
      }

      
      // 输出操作序列统计
      const opStats = {
        KEEP: result.ops.filter((op: any) => op.type === 'KEEP').length,
        MODIFY: result.ops.filter((op: any) => op.type === 'MODIFY').length,
        ADD: result.ops.filter((op: any) => op.type === 'ADD').length,
        DELETE: result.ops.filter((op: any) => op.type === 'DELETE').length,
        total: result.ops.length
      };

      
      // 保存差异结果并切换到差异视图
      setDiffResult(result.view);
      setShowDiffView(true);
      setIsCalculating(false);

      const endTime = performance.now();
      const totalDuration = endTime - startTime;

      
    } catch (error) {
      setIsCalculating(false);
      const endTime = performance.now();
      const duration = endTime - startTime;
    }
  };

  // 计算差异统计信息
  const diffStatistics = useMemo(() => {
    if (!diffResult) return null;

    const keepCount = diffResult.filter(row => row.type === 'KEEP').length;
    const modifyCount = diffResult.filter(row => row.type === 'MODIFY').length;
    const addCount = diffResult.filter(row => row.type === 'ADD').length;
    const deleteCount = diffResult.filter(row => row.type === 'DELETE').length;
    const changedRows = diffResult.filter(row => row.type !== 'KEEP').length;
    const rate = diffResult.length > 0 ? (changedRows / diffResult.length * 100) : 0;

    return {
      keepCount,
      modifyCount,
      addCount,
      deleteCount,
      totalRows: diffResult.length,
      differenceRate: rate
    };
  }, [diffResult]);

  // 返回正常预览模式
  const handleBackToPreview = () => {
    setShowDiffView(false);
    setDiffResult(null);
  };


  return (
    <section id="excel-upload-area" className={cn('space-y-6', className)}>
      {/* Find Difference 按钮 - 放在最顶部 */}
      {!showDiffView && leftPanel.excelData && rightPanel.excelData && (
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

      {/* 上传区域 */}
      {!showDiffView && (
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
                <DataPreviewPanelI18n
                  excelData={leftPanel.excelData}
                  fileName={leftPanel.fileName}
                  onSheetChange={(sheetName) => handleSheetChange(sheetName, 'left')}
                  onReupload={() => handleReupload('left')}
                  loading={false}
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
                <DataPreviewPanelI18n
                  excelData={rightPanel.excelData}
                  fileName={rightPanel.fileName}
                  onSheetChange={(sheetName) => handleSheetChange(sheetName, 'right')}
                  onReupload={() => handleReupload('right')}
                  loading={false}
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
      )}

      {/* 差异视图 */}
      {showDiffView && diffResult ? (
        <div className="space-y-4">

          {/* 居中的返回预览按钮 - 移动到顶部 */}
          <div className="flex justify-center">
            <button
              onClick={handleBackToPreview}
              className={cn(
                'px-6 py-3 rounded-lg font-medium text-sm transition-all duration-200 min-w-[180px] flex items-center justify-center gap-2',
                // 黑色主题样式
                'bg-black hover:bg-gray-800 text-white shadow-md hover:shadow-lg transform hover:scale-105 cursor-pointer',
                // 焦点样式
                'focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-800'
              )}
            >
              <ArrowLeft className="w-4 h-4" />
              {dictionary?.excelUpload?.backToPreview || 'Back to Preview'}
            </button>
          </div>

          {/* 统计信息 */}
          {diffStatistics && (
            <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-900 rounded-md border border-gray-200 dark:border-gray-700">
              <div className="flex items-center space-x-6 text-sm">
                <span className="text-gray-500 dark:text-gray-400">
                  <span className="font-medium">
                    {diffStatistics.keepCount.toLocaleString()} {dictionary?.excelUpload?.unchanged || '相同'}
                  </span>
                </span>
                <span className="text-gray-500 dark:text-gray-400">
                  <span className="font-medium text-amber-600 dark:text-amber-400">
                    {diffStatistics.modifyCount.toLocaleString()} {dictionary?.excelUpload?.modified || '修改'}
                  </span>
                </span>
                <span className="text-gray-500 dark:text-gray-400">
                  <span className="font-medium text-green-600 dark:text-green-400">
                    {diffStatistics.addCount.toLocaleString()} {dictionary?.excelUpload?.added || '新增'}
                  </span>
                </span>
                <span className="text-gray-500 dark:text-gray-400">
                  <span className="font-medium text-red-600 dark:text-red-400">
                    {diffStatistics.deleteCount.toLocaleString()} {dictionary?.excelUpload?.deleted || '删除'}
                  </span>
                </span>
              </div>
              <div className="flex items-center space-x-4 text-sm">
                <span className="text-gray-600 dark:text-gray-400">
                  <span className="font-medium">{dictionary?.excelUpload?.totalRows || '总计'}:</span>
                  <span className="ml-1 font-mono">{diffStatistics.totalRows.toLocaleString()}</span>
                </span>
                <span className="text-gray-600 dark:text-gray-400">
                  <span className="font-medium">{dictionary?.excelUpload?.differenceRate || '差异率'}:</span>
                  <span className="ml-1 font-mono text-orange-600 dark:text-orange-400">
                    {diffStatistics.differenceRate.toFixed(1)}%
                  </span>
                </span>
              </div>
            </div>
          )}

          {/* 差异表格 - 使用优化版本 */}
          <div className="rounded-lg overflow-hidden">
            <DualDiffTableOptimized
              diffResult={diffResult}
              className="w-full"
              leftFileName={leftPanel.fileName}
              rightFileName={rightPanel.fileName}
              performanceConfig={{
                enableVirtualization: true,
                enableCaching: true,
                enablePerformanceMonitoring: process.env.NODE_ENV === 'development',
                maxRows: 100000,
                memoryThreshold: 0.8
              }}
              onPerformanceMetrics={(metrics) => {
                // 开发环境下可以通过其他方式查看性能指标
              }}
            />
          </div>
        </div>
      ) : null}

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