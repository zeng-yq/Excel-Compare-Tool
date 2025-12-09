// Excel 文件上传相关类型定义

export interface ExcelData {
  sheetNames: string[];
  activeSheet: string;
  data: Record<string, any[][]>;
  rowCount: Record<string, number>;
  columnCount: Record<string, number>;
}

export interface FileUploadState {
  isDragging: boolean;
  uploading: boolean;
  error: string | null;
  file: File | null;
}

export interface FileUploadZoneProps {
  onFileUpload: (file: File) => void;
  uploading?: boolean;
  error?: string | null;
  accept?: string;
  maxSize?: number; // bytes
  className?: string;
  children?: React.ReactNode;
}

export interface DataPreviewPanelProps {
  excelData: ExcelData;
  fileName?: string;
  onSheetChange: (sheetName: string) => void;
  onReupload: () => void;
  loading?: boolean;
  className?: string;
}

export interface SheetSelectorProps {
  sheetNames: string[];
  activeSheet: string;
  onSheetChange: (sheetName: string) => void;
  className?: string;
}

// 错误类型
export type FileUploadError =
  | 'invalid_format'
  | 'file_too_large'
  | 'parse_error'
  | 'unknown_error';

// 解析结果
export interface ParseResult {
  success: boolean;
  data?: ExcelData;
  error?: FileUploadError;
  errorMessage?: string;
}

// Excel 文件类型
export const SUPPORTED_EXCEL_FORMATS = [
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', // .xlsx
  'application/vnd.ms-excel', // .xls
  'application/vnd.ms-excel.sheet.macroEnabled.12', // .xlsm
  'application/vnd.ms-excel.sheet.binary.macroEnabled.12' // .xlsb
] as const;

export const EXCEL_FILE_EXTENSIONS = ['.xlsx', '.xls', '.xlsm', '.xlsb'] as const;

// 默认配置
export const DEFAULT_CONFIG = {
  MAX_FILE_SIZE: 50 * 1024 * 1024, // 50MB
  SUPPORTED_MIME_TYPES: SUPPORTED_EXCEL_FORMATS,
} as const;