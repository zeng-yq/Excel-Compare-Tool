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
import { useDictionary } from '@/hooks/useDictionary';

/**
 * 列选择器组件（支持国际化）
 * 用于选择表格的列（A、B、C...）
 */
interface ColumnSelectorI18nProps {
  columnCount: number;
  selectedColumn: string;
  onColumnChange: (column: string) => void;
  className?: string;
}

export default function ColumnSelectorI18n({
  columnCount,
  selectedColumn,
  onColumnChange,
  className
}: ColumnSelectorI18nProps) {
  const [isOpen, setIsOpen] = useState(false);
  const { locale } = useDictionary();

  // 生成列选项（A、B、C...）
  const columnOptions = React.useMemo(() => {
    const options = [];
    for (let i = 0; i < Math.max(columnCount, 1); i++) {
      options.push(String.fromCharCode(65 + i)); // A, B, C, ...
    }
    return options;
  }, [columnCount]);

  const handleValueChange = (value: string) => {
    if (value && value !== selectedColumn) {
      onColumnChange(value);
    }
    setIsOpen(false);
  };

  return (
    <div className={cn('flex items-center space-x-1', className)}>
      <label htmlFor={`column-select-${selectedColumn}`} className="text-xs font-medium text-gray-700 dark:text-gray-300">
        {locale === 'zh' ? '对比列' : 'Match Column'}
      </label>

      <Select
        value={selectedColumn}
        onValueChange={handleValueChange}
        open={isOpen}
        onOpenChange={setIsOpen}
      >
        <SelectTrigger
          id={`column-select-${selectedColumn}`}
          className={cn("w-16 min-w-0", className)}
          aria-label={locale === 'zh' ? '选择列' : 'Select column'}
        >
          <SelectValue placeholder={locale === 'zh' ? '选择列' : 'Select column'} />
        </SelectTrigger>

        <SelectContent
          position="popper"
          className="max-h-60 overflow-y-auto"
        >
          {columnOptions.map((column) => (
            <SelectItem
              key={column}
              value={column}
              className="cursor-pointer"
            >
              <span className="text-sm font-mono">{column}</span>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}