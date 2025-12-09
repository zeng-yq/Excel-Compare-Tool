/**
 * Excel Compare 样式常量模块
 * 定义差异类型、边框、布局等样式常量
 */

/**
 * 差异类型枚举
 */
export type DiffType = 'KEEP' | 'MODIFY' | 'ADD' | 'DELETE';

/**
 * 单元格差异类型枚举
 */
export type CellDiffType = 'UNCHANGED' | 'MODIFIED';

/**
 * 差异类型对应的CSS类名映射
 * 用于背景色样式
 */
export const DIFF_STYLES = {
  KEEP: 'bg-gray-50 dark:bg-gray-800',
  MODIFY: 'bg-yellow-50 dark:bg-yellow-950',
  ADD: 'bg-green-200 dark:bg-green-800',
  DELETE: 'bg-red-50 dark:bg-red-950'
} as const;

/**
 * 单元格差异样式映射
 * 用于单元格级别的样式变化
 */
export const CELL_DIFF_STYLES = {
  MODIFIED: 'bg-yellow-200 dark:bg-yellow-800 font-medium text-yellow-900 dark:text-yellow-100',
  UNCHANGED: 'bg-transparent'
} as const;

/**
 * 边框样式常量
 */
export const BORDER_STYLES = {
  // 基础边框
  BORDER: 'border border-gray-200 dark:border-gray-700',
  BORDER_LIGHT: 'border border-gray-100 dark:border-gray-800',
  BORDER_RIGHT: 'border-r border-gray-200 dark:border-gray-700',
  BORDER_LEFT: 'border-l border-gray-100 dark:border-gray-800',
  BORDER_BOTTOM: 'border-b border-gray-100 dark:border-gray-800',

  // 表头边框
  HEADER_BORDER: 'border-r border-gray-300 dark:border-gray-600',
  HEADER_BORDER_LEFT: 'border-l border-gray-300 dark:border-gray-600',

  // 分隔线
  DIVIDER: 'border-t border-gray-200 dark:border-gray-700'
} as const;

/**
 * 布局相关样式常量
 */
export const LAYOUT_STYLES = {
  // 容器
  CONTAINER: 'relative w-full flex flex-col h-full',
  PANEL_CONTAINER: 'flex-1 flex flex-col min-h-0',

  // 滚动容器
  SCROLL_CONTAINER: 'flex-1 overflow-auto',
  SCROLL_CONTAINER_OPTIMIZED: 'flex-1 overflow-auto overflow-x-auto overflow-y-auto',

  // 固定元素
  STICKY_HEADER: 'sticky top-0 z-20 bg-white dark:bg-gray-800',
  STICKY_LEFT: 'sticky left-0 z-20 bg-white dark:bg-gray-800',
  STICKY_LEFT_HEADER: 'sticky left-0 z-30 bg-gray-100 dark:bg-gray-800',

  // Flex布局
  FLEX_ROW: 'flex',
  FLEX_COLUMN: 'flex flex-col',
  FLEX_CENTER: 'flex items-center justify-center',
  FLEX_BETWEEN: 'flex items-center justify-between',

  // 尺寸
  FLEX_SHRINK_0: 'flex-shrink-0',
  FLEX_GROW: 'flex-grow',
  W_FULL: 'w-full',
  H_FULL: 'h-full'
} as const;

/**
 * 文本样式常量
 */
export const TEXT_STYLES = {
  // 字体大小
  TEXT_XS: 'text-xs',
  TEXT_SM: 'text-sm',
  TEXT_BASE: 'text-base',

  // 字体粗细
  FONT_MEDIUM: 'font-medium',
  FONT_SEMIBOLD: 'font-semibold',
  FONT_BOLD: 'font-bold',

  // 文本颜色
  TEXT_GRAY_500: 'text-gray-500 dark:text-gray-400',
  TEXT_GRAY_700: 'text-gray-700 dark:text-gray-300',
  TEXT_GRAY_900: 'text-gray-900 dark:text-gray-100',

  // 文本对齐
  TEXT_CENTER: 'text-center',
  TEXT_LEFT: 'text-left',
  TEXT_RIGHT: 'text-right',

  // 文本处理
  TRUNCATE: 'truncate',
  ITALIC: 'italic'
} as const;

/**
 * 状态样式常量
 */
export const STATE_STYLES = {
  // 选中状态
  SELECTED: 'data-[state=selected]:bg-muted',

  // 悬停状态
  HOVER: 'hover:bg-gray-100 dark:hover:bg-gray-700',

  // 焦点状态
  FOCUS: 'focus:outline-none focus:ring-2 focus:ring-blue-500',

  // 过渡效果
  TRANSITION: 'transition-colors duration-200',
  TRANSITION_NONE: 'transition-none'
} as const;

/**
 * 背景样式常量
 */
export const BACKGROUND_STYLES = {
  // 页面背景
  PAGE: 'bg-white dark:bg-gray-50',
  CONTAINER: 'bg-white dark:bg-gray-800',

  // 表头背景
  HEADER: 'bg-gray-100 dark:bg-gray-800',
  HEADER_STICKY: 'bg-gray-50 dark:bg-gray-900',

  // 空状态背景
  EMPTY: 'bg-gray-50 dark:bg-gray-900',

  // 提示背景
  INFO: 'bg-blue-50 dark:bg-blue-950',
  WARNING: 'bg-yellow-50 dark:bg-yellow-950',
  SUCCESS: 'bg-green-50 dark:bg-green-950',
  ERROR: 'bg-red-50 dark:bg-red-950'
} as const;

/**
 * 间距样式常量
 */
export const SPACING_STYLES = {
  // 内边距
  P_1: 'p-1',
  P_2: 'p-2',
  P_3: 'p-3',
  P_4: 'p-4',
  PX_2: 'px-2',
  PY_1: 'py-1',
  PY_2: 'py-2',

  // 外边距
  M_1: 'm-1',
  M_2: 'm-2',
  M_4: 'm-4',
  MT_2: 'mt-2',
  MB_2: 'mb-2',
  ML_2: 'ml-2',
  MR_2: 'mr-2'
} as const;

/**
 * 阴影样式常量
 */
export const SHADOW_STYLES = {
  NONE: 'shadow-none',
  SM: 'shadow-sm',
  MD: 'shadow-md',
  LG: 'shadow-lg',
  INNER: 'shadow-inner'
} as const;

/**
 * 圆角样式常量
 */
export const RADIUS_STYLES = {
  NONE: 'rounded-none',
  SM: 'rounded-sm',
  MD: 'rounded-md',
  LG: 'rounded-lg',
  FULL: 'rounded-full'
} as const;

/**
 * 尺寸常量
 */
export const SIZES = {
  // 行高
  ROW_HEIGHT: 32,
  ROW_HEIGHT_COMPACT: 28,
  ROW_HEIGHT_LOOSE: 40,

  // 列宽
  COLUMN_WIDTH_MIN: 80,
  COLUMN_WIDTH_DEFAULT: 120,
  COLUMN_WIDTH_MAX: 300,
  ROW_NUMBER_WIDTH: 64,

  // 容器高度
  CONTAINER_HEIGHT_MIN: 200,
  CONTAINER_HEIGHT_MAX: 600,

  // 性能相关
  OVERSCAN_DEFAULT: 5,
  OVERSCAN_MIN: 30,
  SCROLL_PADDING: 200,
  MAX_CACHE_SIZE: 1000,
  CACHE_MAX_AGE: 30000
} as const;