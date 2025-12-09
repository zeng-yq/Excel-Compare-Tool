'use client';

import { useMemo, useCallback } from 'react';
import {
  formatCellValue as utilsFormatCellValue,
  getColumnLabel as utilsGetColumnLabel
} from '../utils/excelUtils';

// 单元格差异详情类型
export interface CellDiffDetail {
  isModified: boolean;
  originalValue?: any;
}

// ViewRow类型定义（与patienceDiff.js输出一致）
export interface ViewRow {
  type: 'KEEP' | 'MODIFY' | 'ADD' | 'DELETE';
  original: {
    lineNo: number | null;
    data: any[] | null;
  };
  modified: {
    lineNo: number | null;
    data: any[] | null;
    cellDiffs?: CellDiffDetail[] | null; // 新增：单元格级差异详情
  };
}

/**
 * 数据分离Hook - 将差异结果分离为左右两个独立的数据集
 * @param diffResult 差异结果数组
 * @param maxRows 最大显示行数限制（可选）
 * @returns 分离后的左右数据和相关元信息
 */
export const useSeparatedData = (
  diffResult: ViewRow[],
  maxRows?: number
) => {
  // 计算最大列数
  const maxColumns = useMemo(() => {
    let max = 0;
    diffResult.forEach(row => {
      if (row.original.data) {
        max = Math.max(max, row.original.data.length);
      }
      if (row.modified.data) {
        max = Math.max(max, row.modified.data.length);
      }
    });
    return max || 10; // 默认10列
  }, [diffResult]);

  // 智能筛选：优先保留差异行，截取部分相同行
  const processedDiffResult = useMemo(() => {
    if (!maxRows || diffResult.length <= maxRows) {
      return diffResult;
    }

    // 分类处理
    const importantRows = diffResult.filter(row => row.type !== 'KEEP');
    const keepRows = diffResult.filter(row => row.type === 'KEEP');

    // 计算可用的相同行槽位
    const availableSlots = maxRows - importantRows.length;
    const limitedKeepRows = keepRows.slice(0, Math.max(0, availableSlots));

    // 组合结果：差异行 + 限制的相同行 + 差异行（尾部）
    const remainingImportantRows = importantRows.slice(limitedKeepRows.length);
    return [...importantRows.slice(0, limitedKeepRows.length), ...limitedKeepRows, ...remainingImportantRows];
  }, [diffResult, maxRows]);

  // 分离左侧数据
  const leftData = useMemo(() => {
    return processedDiffResult.map(row => {
      // 对于DELETE行，显示原始数据；对于ADD行，显示空数组
      if (row.type === 'DELETE') {
        return row.original.data || [];
      } else if (row.type === 'ADD') {
        return Array(maxColumns).fill(null);
      } else {
        return row.original.data || Array(maxColumns).fill(null);
      }
    });
  }, [processedDiffResult, maxColumns]);

  // 分离右侧数据
  const rightData = useMemo(() => {
    return processedDiffResult.map(row => {
      // 对于ADD行，显示修改后数据；对于DELETE行，显示空数组
      if (row.type === 'ADD') {
        return row.modified.data || [];
      } else if (row.type === 'DELETE') {
        return Array(maxColumns).fill(null);
      } else {
        return row.modified.data || Array(maxColumns).fill(null);
      }
    });
  }, [processedDiffResult, maxColumns]);

  // 生成行号数组
  const leftRowNumbers = useMemo(() => {
    return processedDiffResult.map(row => row.original.lineNo);
  }, [processedDiffResult]);

  const rightRowNumbers = useMemo(() => {
    return processedDiffResult.map(row => row.modified.lineNo);
  }, [processedDiffResult]);

  // 生成差异类型数组
  const diffTypes = useMemo(() => {
    return processedDiffResult.map(row => row.type);
  }, [processedDiffResult]);

  // 生成单元格差异信息数组
  const cellChanges = useMemo(() => {
    return processedDiffResult.map(row => {
      // 如果是 MODIFY 行且有 cellDiffs 信息，使用它
      if (row.type === 'MODIFY' && row.modified.cellDiffs) {
        return row.modified.cellDiffs.map(cellDiff => cellDiff.isModified);
      }

      // 对于其他类型的行或没有 cellDiffs 信息的 MODIFY 行，返回全 false 数组
      return new Array(maxColumns).fill(false);
    });
  }, [processedDiffResult, maxColumns]);

  // 计算统计信息
  const statistics = useMemo(() => {
    const stats = {
      KEEP: 0,
      MODIFY: 0,
      ADD: 0,
      DELETE: 0,
      total: processedDiffResult.length
    };

    processedDiffResult.forEach(row => {
      stats[row.type]++;
    });

    return stats;
  }, [processedDiffResult]);

  // 使用公共工具函数
  const formatCellValue = useCallback(utilsFormatCellValue, []);
  const getColumnLabel = useCallback(utilsGetColumnLabel, []);

  return {
    // 分离后的数据
    leftData,
    rightData,
    leftRowNumbers,
    rightRowNumbers,

    // 元信息
    maxColumns,
    diffTypes,
    statistics,
    cellChanges, // 新增：单元格差异信息

    // 工具函数
    formatCellValue,
    getColumnLabel,

    // 原始数据（用于调试和高级功能）
    originalDiffResult: diffResult,
    processedDiffResult
  };
};