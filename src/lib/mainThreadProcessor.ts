/**
 * 主线程数据处理工具
 * 替代 Web Worker 进行 Excel 数据处理和差异计算
 */

// 单元格差异选项
interface CellDiffOptions {
  ignoreCase?: boolean;
  ignoreWhitespace?: boolean;
  trimStrings?: boolean;
}

// 差异计算选项
interface DiffOptions {
  ignoreCase?: boolean;
  ignoreWhitespace?: boolean;
  algorithm?: 'patience' | 'myers' | 'histogram';
  threshold?: number;
}

// 差异结果类型
interface DiffResult {
  type: 'KEEP' | 'ADD' | 'DELETE' | 'MODIFY';
  leftData: any[] | null;
  rightData: any[] | null;
  leftIndex: number;
  rightIndex: number;
}

// 统计信息
interface DiffStatistics {
  additions: number;
  deletions: number;
  modifications: number;
  unchanged: number;
}

/**
 * 主线程处理器类
 */
export class MainThreadProcessor {
  // 默认配置
  private config = {
    ignoreCase: true,
    ignoreWhitespace: true,
    threshold: 0.8,
    trimStrings: true
  };

  constructor(config: Partial<typeof this.config> = {}) {
    this.config = { ...this.config, ...config };
  }

  /**
   * 检测两个行之间的单元格差异
   */
  detectCellChanges(
    leftRow: any[],
    rightRow: any[],
    options: CellDiffOptions = {}
  ): boolean[] {
    const {
      ignoreCase = this.config.ignoreCase,
      ignoreWhitespace = this.config.ignoreWhitespace,
      trimStrings = this.config.trimStrings || true
    } = options;

    const maxLength = Math.max(leftRow.length, rightRow.length);
    const changes: boolean[] = [];

    for (let i = 0; i < maxLength; i++) {
      const leftCell = leftRow[i];
      const rightCell = rightRow[i];

      let leftValue = this.normalizeCellValue(leftCell, ignoreCase, ignoreWhitespace, trimStrings);
      let rightValue = this.normalizeCellValue(rightCell, ignoreCase, ignoreWhitespace, trimStrings);

      changes.push(leftValue !== rightValue);
    }

    return changes;
  }

  /**
   * 标准化单元格值
   */
  private normalizeCellValue(
    value: any,
    ignoreCase: boolean,
    ignoreWhitespace: boolean,
    trimStrings: boolean
  ): string {
    if (value === null || value === undefined) {
      return '';
    }

    let stringValue = String(value);

    if (trimStrings) {
      stringValue = stringValue.trim();
    }

    if (ignoreWhitespace) {
      stringValue = stringValue.replace(/\s+/g, ' ');
    }

    if (ignoreCase) {
      stringValue = stringValue.toLowerCase();
    }

    return stringValue;
  }

  /**
   * 计算 Myers 差异算法
   */
  async calculateDiff(
    leftData: any[][],
    rightData: any[][],
    options: DiffOptions = {}
  ): Promise<{
    diffResult: DiffResult[];
    statistics: DiffStatistics;
  }> {
    const {
      ignoreCase = this.config.ignoreCase,
      ignoreWhitespace = this.config.ignoreWhitespace,
      threshold = this.config.threshold
    } = options;

    // 使用简化的 Myers 算法
    const diffResult = this.myersDiff(leftData, rightData, {
      ignoreCase,
      ignoreWhitespace,
      threshold
    });

    // 计算统计信息
    const statistics = {
      additions: diffResult.filter(r => r.type === 'ADD').length,
      deletions: diffResult.filter(r => r.type === 'DELETE').length,
      modifications: diffResult.filter(r => r.type === 'MODIFY').length,
      unchanged: diffResult.filter(r => r.type === 'KEEP').length
    };

    return { diffResult, statistics };
  }

  /**
   * Myers 差异算法实现
   */
  private myersDiff(
    left: any[][],
    right: any[][],
    options: { ignoreCase: boolean; ignoreWhitespace: boolean; threshold: number }
  ): DiffResult[] {
    const { ignoreCase, ignoreWhitespace, threshold } = options;

    // 行哈希化
    const leftHashes = left.map(row => this.hashRow(row, ignoreCase, ignoreWhitespace));
    const rightHashes = right.map(row => this.hashRow(row, ignoreCase, ignoreWhitespace));

    // 找到最长公共子序列
    const lcs = this.longestCommonSubsequence(leftHashes, rightHashes);

    // 构建差异结果
    const result: DiffResult[] = [];
    let leftIndex = 0;
    let rightIndex = 0;

    for (const match of lcs) {
      // 处理左侧删除的行
      while (leftIndex < match.leftIndex) {
        result.push({
          type: 'DELETE',
          leftData: left[leftIndex],
          rightData: null,
          leftIndex: leftIndex++,
          rightIndex: -1
        });
      }

      // 处理右侧新增的行
      while (rightIndex < match.rightIndex) {
        result.push({
          type: 'ADD',
          leftData: null,
          rightData: right[rightIndex],
          leftIndex: -1,
          rightIndex: rightIndex++
        });
      }

      // 处理相同的行
      result.push({
        type: 'KEEP',
        leftData: left[match.leftIndex],
        rightData: right[match.rightIndex],
        leftIndex: match.leftIndex,
        rightIndex: match.rightIndex
      });

      leftIndex++;
      rightIndex++;
    }

    // 处理剩余的行
    while (leftIndex < left.length) {
      result.push({
        type: 'DELETE',
        leftData: left[leftIndex],
        rightData: null,
        leftIndex: leftIndex++,
        rightIndex: -1
      });
    }

    while (rightIndex < right.length) {
      result.push({
        type: 'ADD',
        leftData: null,
        rightData: right[rightIndex],
        leftIndex: -1,
        rightIndex: rightIndex++
      });
    }

    // 检测可能的修改
    for (let i = 0; i < result.length; i++) {
      if (result[i].type === 'DELETE' && i + 1 < result.length && result[i + 1].type === 'ADD') {
        const similarity = this.calculateSimilarity(result[i].leftData, result[i + 1].rightData);
        if (similarity >= threshold) {
          result[i].type = 'MODIFY';
          result[i].rightData = result[i + 1].rightData;
          result[i].rightIndex = result[i + 1].rightIndex;
          result.splice(i + 1, 1);
          i--;
        }
      }
    }

    return result;
  }

  /**
   * 计算行的哈希值
   */
  private hashRow(row: any[], ignoreCase: boolean, ignoreWhitespace: boolean): string {
    return row
      .map(cell => this.normalizeCellValue(cell, ignoreCase, ignoreWhitespace, true))
      .join('|');
  }

  /**
   * 找到最长公共子序列
   */
  private longestCommonSubsequence(
    left: string[],
    right: string[]
  ): Array<{ leftIndex: number; rightIndex: number }> {
    const m = left.length;
    const n = right.length;
    const dp: number[][] = Array(m + 1).fill(null).map(() => Array(n + 1).fill(0));

    // 填充 DP 表
    for (let i = 1; i <= m; i++) {
      for (let j = 1; j <= n; j++) {
        if (left[i - 1] === right[j - 1]) {
          dp[i][j] = dp[i - 1][j - 1] + 1;
        } else {
          dp[i][j] = Math.max(dp[i - 1][j], dp[i][j - 1]);
        }
      }
    }

    // 回溯构建 LCS
    const lcs: Array<{ leftIndex: number; rightIndex: number }> = [];
    let i = m, j = n;

    while (i > 0 && j > 0) {
      if (left[i - 1] === right[j - 1]) {
        lcs.unshift({ leftIndex: i - 1, rightIndex: j - 1 });
        i--;
        j--;
      } else if (dp[i - 1][j] > dp[i][j - 1]) {
        i--;
      } else {
        j--;
      }
    }

    return lcs;
  }

  /**
   * 计算两行的相似度
   */
  private calculateSimilarity(row1: any[] | null, row2: any[] | null): number {
    if (!row1 || !row2) return 0;

    const maxLength = Math.max(row1.length, row2.length);
    if (maxLength === 0) return 1;

    let matches = 0;
    for (let i = 0; i < maxLength; i++) {
      const val1 = this.normalizeCellValue(row1[i] || '', true, true, true);
      const val2 = this.normalizeCellValue(row2[i] || '', true, true, true);
      if (val1 === val2) matches++;
    }

    return matches / maxLength;
  }

  /**
   * 格式化数据（直接返回，无需额外处理）
   */
  formatData(data: any[], formatType: 'excel' | 'json' | 'csv' = 'excel'): any {
    // 在主线程中，数据已经格式化，直接返回
    return data;
  }

  /**
   * 预加载数据（主线程中无需预加载）
   */
  preloadData(rowIndex: number, data: any[]): void {
    // 主线程中数据直接可用，无需预加载
  }
}

// 全局主线程处理器实例
export const mainThreadProcessor = new MainThreadProcessor({
  ignoreCase: true,
  ignoreWhitespace: true,
  threshold: 0.8
});

// 导出便捷函数
export const detectCellChanges = (
  leftRow: any[],
  rightRow: any[],
  options?: CellDiffOptions
) => mainThreadProcessor.detectCellChanges(leftRow, rightRow, options);

export const calculateDiff = (
  leftData: any[][],
  rightData: any[][],
  options?: DiffOptions
) => mainThreadProcessor.calculateDiff(leftData, rightData, options);

export const formatData = (data: any[], formatType: 'excel' | 'json' | 'csv') =>
  mainThreadProcessor.formatData(data, formatType);

export const preloadData = (rowIndex: number, data: any[]) =>
  mainThreadProcessor.preloadData(rowIndex, data);