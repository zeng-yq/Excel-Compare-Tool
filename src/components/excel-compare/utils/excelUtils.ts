/**
 * Excel Compare 公共工具函数模块
 * 提供Excel处理相关的通用函数，避免代码重复
 */

/**
 * 生成Excel列标签 (A, B, C, ..., AA, AB, ...)
 * @param index 列索引（从0开始）
 * @returns Excel列标签字符串
 */
export const getColumnLabel = (index: number): string => {
  let label = '';
  let columnIndex = index;
  while (columnIndex >= 0) {
    label = String.fromCharCode(65 + (columnIndex % 26)) + label;
    columnIndex = Math.floor(columnIndex / 26) - 1;
  }
  return label;
};

/**
 * 格式化单元格值为字符串
 * @param value 单元格原始值
 * @returns 格式化后的字符串
 */
export const formatCellValue = (value: any): string => {
  if (value === null || value === undefined || value === '') {
    return '';
  }
  return String(value);
};

/**
 * 计算列宽，支持自适应和固定宽度模式
 * @param containerWidth 容器总宽度
 * @param columnCount 列数
 * @param minWidth 最小列宽（默认120）
 * @param maxWidth 最大列宽（默认300）
 * @param rowNumberWidth 行号列宽度（默认64）
 * @returns 计算后的列宽
 */
export const calculateColumnWidth = (
  containerWidth: number,
  columnCount: number,
  minWidth: number = 120,
  maxWidth: number = 300,
  rowNumberWidth: number = 64
): number => {
  if (columnCount <= 0) return minWidth;

  // 计算可用宽度（减去行号列）
  const availableWidth = containerWidth - rowNumberWidth;

  // 计算自适应列宽，限制在最小和最大宽度之间
  const adaptiveColumnWidth = Math.min(
    Math.max(minWidth, availableWidth / columnCount),
    maxWidth
  );

  // 当列数较少（能适应容器）时使用自适应宽度，否则使用最小宽度
  const useAdaptiveWidth = columnCount * minWidth <= availableWidth;

  return useAdaptiveWidth ? adaptiveColumnWidth : minWidth;
};

/**
 * 判断单元格是否为空
 * @param value 单元格值
 * @returns 是否为空
 */
export const isCellEmpty = (value: any): boolean => {
  return value === null || value === undefined || value === '';
};

/**
 * 获取单元格显示文本，空值时显示(空)
 * @param value 单元格值
 * @returns 显示文本
 */
export const getCellDisplayText = (value: any): string => {
  if (isCellEmpty(value)) {
    return '(空)';
  }
  return formatCellValue(value);
};

/**
 * 比较两个单元格是否相等（忽略大小写和前后空格）
 * @param cell1 第一个单元格值
 * @param cell2 第二个单元格值
 * @returns 是否相等
 */
export const areCellsEqual = (cell1: any, cell2: any): boolean => {
  const val1 = cell1 === null || cell1 === undefined || cell1 === '' ? '' : String(cell1).trim();
  const val2 = cell2 === null || cell2 === undefined || cell2 === '' ? '' : String(cell2).trim();
  return val1.toLowerCase() === val2.toLowerCase();
};

/**
 * 生成缓存键
 * @param prefix 前缀
 * @param params 参数数组
 * @returns 缓存键字符串
 */
export const generateCacheKey = (prefix: string, ...params: any[]): string => {
  return `${prefix}_${params.join('_')}`;
};