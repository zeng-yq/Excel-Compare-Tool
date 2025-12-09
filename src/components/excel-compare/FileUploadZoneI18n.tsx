'use client';

import React, { useState, useCallback, useRef, useMemo } from 'react';
import { Upload, FileText, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { FileUploadZoneProps } from '@/types/excel';
import { SUPPORTED_EXCEL_FORMATS, EXCEL_FILE_EXTENSIONS } from '@/types/excel';
import { ExcelParser } from '@/lib/excelParser';
import { useDictionary } from '@/hooks/useDictionary';

/**
 * 文件上传区域组件（支持国际化）
 * 支持拖拽和点击上传 Excel 文件
 */
export default function FileUploadZoneI18n({
  onFileUpload,
  uploading = false,
  error = null,
  accept = [...SUPPORTED_EXCEL_FORMATS, ...EXCEL_FILE_EXTENSIONS].join(','),
  maxSize = 50 * 1024 * 1024, // 50MB
  className,
  fileName = null
}: FileUploadZoneProps & { fileName?: string | null }) {
  const [isDragging, setIsDragging] = useState(false);
  const [dragError, setDragError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { dictionary, loading } = useDictionary();

  const t = useMemo(() => dictionary?.excelUpload || {}, [dictionary?.excelUpload]);

  // 处理拖拽进入
  const handleDragEnter = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (uploading) return;

    setIsDragging(true);
    setDragError(null);
  }, [uploading]);

  // 处理拖拽悬停
  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  // 处理拖拽离开
  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();

    // 检查是否真的离开了组件
    if (e.currentTarget.contains(e.relatedTarget as Node)) return;

    setIsDragging(false);
    setDragError(null);
  }, []);

  // 处理文件验证
  const validateFile = useCallback((file: File): string | null => {
    // 检查文件类型
    if (!ExcelParser.isValidExcelFile(file)) {
      return t.error?.invalidFormat || '不支持的文件格式，请上传 Excel 文件 (.xlsx, .xls, .xlsm, .xlsb)';
    }

    // 检查文件大小
    if (!ExcelParser.isFileSizeValid(file, maxSize)) {
      const maxSizeStr = ExcelParser.formatFileSize(maxSize);
      return (t.error?.fileTooLarge || '文件太大，最大支持 {size}').replace('{size}', maxSizeStr);
    }

    return null;
  }, [t, maxSize]);

  // 处理文件上传
  const handleFiles = useCallback(async (files: FileList | null) => {
    if (!files || files.length === 0 || uploading) return;

    const file = files[0];
    setIsDragging(false);

    // 验证文件
    const validationError = validateFile(file);
    if (validationError) {
      setDragError(validationError);
      setTimeout(() => setDragError(null), 5000);
      return;
    }

    setDragError(null);
    onFileUpload(file);
  }, [validateFile, uploading, onFileUpload]);

  // 处理拖拽释放
  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (uploading) return;

    setIsDragging(false);
    handleFiles(e.dataTransfer.files);
  }, [handleFiles, uploading]);

  // 处理点击上传
  const handleClick = useCallback(() => {
    if (uploading) return;
    fileInputRef.current?.click();
  }, [uploading]);

  // 处理文件选择
  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    handleFiles(e.target.files);
    // 清空输入值，允许重复选择同一文件
    e.target.value = '';
  }, [handleFiles]);

  // 如果字典还在加载，显示简单的加载状态
  if (loading) {
    return (
      <div className="flex items-center justify-center p-8 bg-gray-50 dark:bg-gray-900 rounded-lg">
        <div className="animate-spin rounded-full h-6 w-6 border-2 border-gray-300 border-t-gray-600"></div>
      </div>
    );
  }

  // 获取边框样式
  const getBorderClass = () => {
    if (error || dragError) {
      return 'border-red-300 bg-red-50 dark:bg-red-950 dark:border-red-700';
    }
    if (isDragging) {
      return 'border-blue-400 bg-blue-50 dark:bg-blue-950 dark:border-blue-500';
    }
    return 'border-gray-300 bg-gray-50 dark:bg-gray-900 dark:border-gray-600';
  };

  // 获取文本颜色
  const getTextClass = () => {
    if (error || dragError) {
      return 'text-red-600 dark:text-red-400';
    }
    if (isDragging) {
      return 'text-blue-600 dark:text-blue-400';
    }
    return 'text-gray-600 dark:text-gray-400';
  };

  return (
    <div
      className={cn(
        'relative border-2 border-dashed rounded-lg p-8 transition-all duration-200 cursor-pointer',
        'hover:border-gray-400 dark:hover:border-gray-500',
        'focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2',
        getBorderClass(),
        uploading && 'cursor-not-allowed opacity-60',
        className
      )}
      onDragEnter={handleDragEnter}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      onClick={handleClick}
      role="button"
      tabIndex={0}
      aria-label={t.title || 'Excel 文件上传区域'}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          handleClick();
        }
      }}
    >
      <input
        ref={fileInputRef}
        type="file"
        accept={accept}
        onChange={handleFileSelect}
        className="hidden"
        aria-label={t.dropZone?.clickText || '选择 Excel 文件'}
        disabled={uploading}
      />

      <div className="flex flex-col items-center justify-center space-y-4 text-center">
        {/* 上传状态图标 */}
        {uploading ? (
          <div className="relative">
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-gray-200 border-t-[#20A884]"></div>
          </div>
        ) : error || dragError ? (
          <AlertCircle className="h-12 w-12 text-red-500" />
        ) : isDragging ? (
          <Upload className="h-12 w-12 text-blue-500" />
        ) : (
          <FileText className="h-12 w-12 text-gray-400" />
        )}

        {/* 状态文本 */}
        <div className="space-y-2">
          {uploading ? (
            <div className="space-y-2">
              <p className="text-lg font-medium text-gray-700 dark:text-gray-300">
                {t.dropZone?.reading || 'Reading file...'}
              </p>
              {fileName && (
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {fileName}
                </p>
              )}
            </div>
          ) : error || dragError ? (
            <div className="space-y-1">
              <p className="text-lg font-medium text-red-700 dark:text-red-300">
                {t.error?.uploadFailed || '上传失败'}
              </p>
              <p className={cn('text-sm', getTextClass())}>
                {error || dragError}
              </p>
            </div>
          ) : (
            <div className="space-y-1">
              <p className="text-lg font-medium text-gray-700 dark:text-gray-300">
                {isDragging ? (t.dropZone?.dragText || '释放文件以上传') : (t.title || '上传 Excel 文件')}
              </p>
              <p className={cn('text-sm', getTextClass())}>
                {isDragging
                  ? t.dropZone?.dragText
                  : `${t.dropZone?.clickText || '点击选择文件'}`
                }
              </p>
            </div>
          )}

          {!uploading && !error && !dragError && (
            <p className="text-xs text-gray-500 dark:text-gray-500">
              {t.dropZone?.supportedFormats || '支持 .xlsx, .xls, .xlsm, .xlsb 格式'}
            </p>
          )}
        </div>

        {/* 重新尝试按钮（仅在错误时显示） */}
        {(error || dragError) && !uploading && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              setDragError(null);
              fileInputRef.current?.click();
            }}
            className="px-4 py-2 text-sm font-medium text-red-600 bg-red-100 rounded-md hover:bg-red-200 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 dark:bg-red-900 dark:text-red-300 dark:hover:bg-red-800"
          >
            {t.error?.reselectFile || '重新选择文件'}
          </button>
        )}
      </div>
    </div>
  );
}