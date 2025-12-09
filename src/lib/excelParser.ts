import * as XLSX from 'xlsx';
import type { ExcelData, ParseResult, FileUploadError } from '@/types/excel';

/**
 * Excel 文件解析器
 * 使用 SheetJS 解析 Excel 文件并提取数据
 */
export class ExcelParser {
  /**
   * 解析 Excel 文件
   * @param file Excel 文件对象
   * @returns Promise<ParseResult> 解析结果
   */
  static async parseExcelFile(file: File): Promise<ParseResult> {
    try {
      // 读取文件
      const buffer = await file.arrayBuffer();

      // 解析工作簿
      const workbook = XLSX.read(buffer, {
        type: 'array',
        cellDates: true,
        raw: false
      });

      // 获取所有工作表名称
      const sheetNames = workbook.SheetNames;

      if (sheetNames.length === 0) {
        return {
          success: false,
          error: 'parse_error',
          errorMessage: 'Excel 文件不包含任何工作表'
        };
      }

      // 解析每个工作表的数据
      const data: Record<string, any[][]> = {};
      const rowCount: Record<string, number> = {};
      const columnCount: Record<string, number> = {};

      sheetNames.forEach(sheetName => {
        const worksheet = workbook.Sheets[sheetName];

        // 转换工作表为二维数组
        const jsonData = XLSX.utils.sheet_to_json(worksheet, {
          header: 1,
          defval: null,
          raw: false
        }) as any[][];

        data[sheetName] = jsonData;
        rowCount[sheetName] = jsonData.length;

        // 计算列数（取所有行中的最大列数）
        columnCount[sheetName] = jsonData.reduce((max, row) => {
          return Math.max(max, row ? row.length : 0);
        }, 0);
      });

      const excelData: ExcelData = {
        sheetNames,
        activeSheet: sheetNames[0], // 默认选择第一个工作表
        data,
        rowCount,
        columnCount
      };

      return {
        success: true,
        data: excelData
      };

    } catch (error) {
      console.error('Excel 解析错误:', error);

      // 根据错误类型返回具体的错误信息
      let errorMessage = 'Excel 文件解析失败';

      if (error instanceof Error) {
        if (error.message.includes('Unsupported file')) {
          errorMessage = '不支持的文件格式';
        } else if (error.message.includes('Invalid file')) {
          errorMessage = '文件已损坏或格式错误';
        }
      }

      return {
        success: false,
        error: 'parse_error',
        errorMessage
      };
    }
  }

  /**
   * 验证文件是否为有效的 Excel 文件
   * @param file 文件对象
   * @returns boolean 是否为有效的 Excel 文件
   */
  static isValidExcelFile(file: File): boolean {
    const validMimeTypes = [
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'application/vnd.ms-excel',
      'application/vnd.ms-excel.sheet.macroEnabled.12',
      'application/vnd.ms-excel.sheet.binary.macroEnabled.12'
    ];

    // 检查 MIME 类型
    if (validMimeTypes.includes(file.type)) {
      return true;
    }

    // 检查文件扩展名
    const validExtensions = ['.xlsx', '.xls', '.xlsm', '.xlsb'];
    const fileName = file.name.toLowerCase();
    return validExtensions.some(ext => fileName.endsWith(ext));
  }

  /**
   * 获取文件的格式化大小
   * @param bytes 字节数
   * @returns string 格式化的文件大小
   */
  static formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes';

    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));

    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  /**
   * 验证文件大小
   * @param file 文件对象
   * @param maxSize 最大文件大小（字节）
   * @returns boolean 文件大小是否符合要求
   */
  static isFileSizeValid(file: File, maxSize: number = 50 * 1024 * 1024): boolean {
    return file.size <= maxSize;
  }

  /**
   * 获取工作表的预览数据（前几行）
   * @param excelData Excel 数据
   * @param sheetName 工作表名称
   * @param previewRows 预览行数
   * @returns any[][] 预览数据
   */
  static getSheetPreview(
    excelData: ExcelData,
    sheetName: string,
    previewRows: number = 10
  ): any[][] {
    const sheetData = excelData.data[sheetName] || [];
    return sheetData.slice(0, previewRows);
  }

  /**
   * 获取工作表的统计信息
   * @param excelData Excel 数据
   * @param sheetName 工作表名称
   * @returns object 统计信息
   */
  static getSheetStatistics(excelData: ExcelData, sheetName: string): {
    totalRows: number;
    totalColumns: number;
    hasData: boolean;
  } {
    const sheetData = excelData.data[sheetName] || [];
    const totalRows = sheetData.length;
    const totalColumns = excelData.columnCount[sheetName] || 0;

    // 检查是否有实际数据（非空单元格）
    const hasData = sheetData.some(row =>
      row && row.some(cell => cell !== null && cell !== undefined && cell !== '')
    );

    return {
      totalRows,
      totalColumns,
      hasData
    };
  }
}