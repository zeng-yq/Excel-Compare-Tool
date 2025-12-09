'use client';

import React, { useState } from 'react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { cn } from '@/lib/utils';
import type { SheetSelectorProps } from '@/types/excel';
import { useDictionary } from '@/hooks/useDictionary';

/**
 * Sheet 选择器组件（支持国际化）
 * 用于在不同 Excel Sheet 之间切换
 */
export default function SheetSelectorI18n({
  sheetNames,
  activeSheet,
  onSheetChange,
  className
}: SheetSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const { dictionary, loading } = useDictionary();

  const t = dictionary?.excelUpload?.preview || {};

  const handleValueChange = (value: string) => {
    if (value && value !== activeSheet) {
      onSheetChange(value);
    }
    setIsOpen(false);
  };

  // 如果字典还在加载，显示简单的版本
  if (loading) {
    return (
      <div className={cn('flex items-center space-x-2', className)}>
        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
          Worksheet:
        </span>
        <span className="text-xs text-gray-500 dark:text-gray-400">
          {sheetNames.length} sheets
        </span>
      </div>
    );
  }

  return (
    <div className={cn('flex items-center space-x-2', className)}>
      <label htmlFor={`sheet-select-${activeSheet}`} className="text-sm font-medium text-gray-700 dark:text-gray-300">
        {t.sheetSelector || '工作表:'}
      </label>

      <Select
        value={activeSheet}
        onValueChange={handleValueChange}
        open={isOpen}
        onOpenChange={setIsOpen}
      >
        <SelectTrigger
          id={`sheet-select-${activeSheet}`}
          className="w-48 min-w-0"
          aria-label={t.sheetSelector || '选择工作表'}
        >
          <SelectValue placeholder={t.sheetSelector || '选择工作表'} />
        </SelectTrigger>

        <SelectContent
          position="popper"
          className="max-h-60 overflow-y-auto"
        >
          {sheetNames.map((sheetName, index) => (
            <SelectItem
              key={sheetName}
              value={sheetName}
              className="cursor-pointer"
            >
              <div className="flex items-center space-x-2">
                <span className="text-sm">{sheetName}</span>
                {index === 0 && (
                  <span className="text-xs text-gray-500 dark:text-gray-400">
                    (默认)
                  </span>
                )}
              </div>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}