/**
 * @file ExcelDiff.js
 * @description 一个轻量级的表格对比库，基于 Patience Diff 算法，支持行级对齐、模糊匹配和结构化视图生成。
 * @version 1.1.1
 * @license MIT
 */

// =============================================================================
// 1. 类型定义 (JSDoc)
// =============================================================================

/**
 * @typedef {Object} DiffOptions
 * @property {boolean} [ignoreWhitespace=true] - 是否忽略字符串首尾空格
 * @property {boolean} [ignoreCase=true] - 是否忽略大小写
 * @property {boolean} [nullAsEmpty=true] - 是否将 null/undefined 视为 ""
 */

/**
 * @typedef {Object} DiffOperation
 * @property {'KEEP' | 'MODIFY' | 'ADD' | 'DELETE'} type - 操作类型
 * @property {number|null} rowOriginal - 原始表格中的行索引 (0-based)
 * @property {number|null} rowModified - 修改后表格中的行索引 (0-based)
 */

/**
 * @typedef {Object} CellDiffDetail
 * @property {boolean} isModified - 该单元格是否发生了变化
 * @property {any} [originalValue] - 原始值 (仅当 isModified=true 且存在原始对应列时)
 */

/**
 * @typedef {Object} ViewRow
 * @property {'KEEP' | 'MODIFY' | 'ADD' | 'DELETE'} type - 状态
 * @property {Object} original - 原始行信息
 * @property {number|null} original.lineNo - 行号 (1-based)
 * @property {Array<any>|null} original.data - 行数据
 * @property {Object} modified - 修改后行信息
 * @property {number|null} modified.lineNo - 行号 (1-based)
 * @property {Array<any>|null} modified.data - 行数据
 * @property {Array<CellDiffDetail>|null} [modified.cellDiffs] - (新增) 单元格级差异详情，仅 type='MODIFY' 时存在
 */

// =============================================================================
// 2. 核心类定义
// =============================================================================

class ExcelDiff {
    /**
     * @param {DiffOptions} options - 配置选项
     */
    constructor(options = {}) {
        this.options = {
            ignoreWhitespace: true,
            ignoreCase: true,
            nullAsEmpty: true,
            ...options
        };
    }

    /**
     * 执行对比的主入口
     * @param {Array<Array<any>>} originalTable - 旧版表格数据 (二维数组)
     * @param {Array<Array<any>>} modifiedTable - 新版表格数据 (二维数组)
     * @returns {{ ops: DiffOperation[], view: ViewRow[] }} 包含操作序列和视图模型的结果对象
     */
    compare(originalTable, modifiedTable) {
        if (!Array.isArray(originalTable) || !Array.isArray(modifiedTable)) {
            throw new Error("ExcelDiff: Inputs must be arrays.");
        }

        // 1. 预处理：计算哈希
        const hashesA = this._preprocessTable(originalTable);
        const hashesB = this._preprocessTable(modifiedTable);

        // 2. 核心算法：Patience Diff
        const ops = this._diffRecursive(hashesA, hashesB, 0, 0);

        // 3. 构建视图：生成带行号的 UI 模型
        const view = this._buildViewModel(ops, originalTable, modifiedTable);

        return { ops, view };
    }

    /**
     * 辅助工具：在控制台打印 ASCII 表格 (用于调试)
     * @param {ViewRow[]} view - compare() 返回的 view 对象
     */
    static printConsoleDebug(view) {
        const renderer = new ConsoleRenderer(view);
        renderer.render();
    }

    // =========================================================================
    // 内部私有方法 (Internal Methods)
    // =========================================================================

    /**
     * @private
     * 单元格标准化
     */
    _normalizeCell(cellValue) {
        if (cellValue === null || cellValue === undefined) {
            return this.options.nullAsEmpty ? "" : "\u0000";
        }

        let str = String(cellValue);

        if (this.options.ignoreWhitespace) {
            str = str.trim();
        }
        if (this.options.ignoreCase) {
            str = str.toLowerCase();
        }

        return str;
    }

    /**
     * @private
     * 计算单行哈希
     */
    _computeRowHash(row) {
        if (!Array.isArray(row)) return ""; // 防御性编程：空行或非法行
        const normalizedCells = row.map(cell => this._normalizeCell(cell));
        // 使用 Unit Separator (\u001F) 连接
        const rowString = normalizedCells.join('\u001F');
        return this._generateStringHash(rowString);
    }

    /**
     * @private
     * 字符串哈希算法 (DJB2)
     */
    _generateStringHash(str) {
        let hash = 5381;
        let i = str.length;
        while (i) {
            hash = (hash * 33) ^ str.charCodeAt(--i);
        }
        return (hash >>> 0).toString(16);
    }

    /**
     * @private
     */
    _preprocessTable(tableData) {
        return tableData.map(row => this._computeRowHash(row));
    }

    /**
     * @private
     * Patience Diff 递归逻辑
     */
    _diffRecursive(sliceA, sliceB, offsetA, offsetB) {
        if (sliceA.length === 0 && sliceB.length === 0) return [];

        const anchor = this._findUniqueAnchor(sliceA, sliceB);

        // 如果找不到唯一锚点，进行回退处理 (Gap Handling)
        if (!anchor) {
            return this._handleFallback(sliceA, sliceB, offsetA, offsetB);
        }

        const { indexA, indexB } = anchor;

        const headOps = this._diffRecursive(
            sliceA.slice(0, indexA),
            sliceB.slice(0, indexB),
            offsetA,
            offsetB
        );

        const matchOp = {
            type: 'KEEP',
            rowOriginal: offsetA + indexA,
            rowModified: offsetB + indexB
        };

        const tailOps = this._diffRecursive(
            sliceA.slice(indexA + 1),
            sliceB.slice(indexB + 1),
            offsetA + indexA + 1,
            offsetB + indexB + 1
        );

        return [...headOps, matchOp, ...tailOps];
    }

    /**
     * @private
     */
    _findUniqueAnchor(sliceA, sliceB) {
        const countA = {}, countB = {};
        
        // 统计频率
        for (const h of sliceA) countA[h] = (countA[h] || 0) + 1;
        for (const h of sliceB) countB[h] = (countB[h] || 0) + 1;

        // 查找锚点
        for (let i = 0; i < sliceA.length; i++) {
            const h = sliceA[i];
            if (countA[h] === 1 && countB[h] === 1) {
                return { hash: h, indexA: i, indexB: sliceB.indexOf(h) };
            }
        }
        return null;
    }

    /**
     * @private
     * 间隙对齐策略
     */
    _handleFallback(sliceA, sliceB, offsetA, offsetB) {
        const ops = [];
        const maxLen = Math.max(sliceA.length, sliceB.length);

        for (let i = 0; i < maxLen; i++) {
            const hasA = i < sliceA.length;
            const hasB = i < sliceB.length;

            if (hasA && hasB) {
                // 必须检查内容哈希是否一致
                if (sliceA[i] === sliceB[i]) {
                    ops.push({ 
                        type: 'KEEP', 
                        rowOriginal: offsetA + i, 
                        rowModified: offsetB + i 
                    });
                } else {
                    ops.push({ 
                        type: 'MODIFY', 
                        rowOriginal: offsetA + i, 
                        rowModified: offsetB + i 
                    });
                }
            } else if (hasA && !hasB) {
                ops.push({ type: 'DELETE', rowOriginal: offsetA + i, rowModified: null });
            } else if (!hasA && hasB) {
                ops.push({ type: 'ADD', rowOriginal: null, rowModified: offsetB + i });
            }
        }
        return ops;
    }

    /**
     * @private
     * 新增方法：计算具体的单元格差异
     * @param {Array} rowOriginal 
     * @param {Array} rowModified 
     * @returns {CellDiffDetail[]}
     */
    _computeCellDiffs(rowOriginal, rowModified) {
        const safeOriginal = rowOriginal || [];
        const safeModified = rowModified || [];
        
        // 【修正】使用 Math.max 确保如果原表列数多于新表，也能遍历到多出来的部分
        const maxLen = Math.max(safeOriginal.length, safeModified.length);
        const diffs = [];
        
        for (let i = 0; i < maxLen; i++) {
            const oldVal = safeOriginal[i]; // 如果 i 超出 safeOriginal 长度，则为 undefined
            const newVal = safeModified[i]; // 如果 i 超出 safeModified 长度，则为 undefined
            
            // 1. 原表格有数据，新表格无数据（说明该列被删除了）
            //    或者 新表格有数据，原表格无数据（说明该列是新增的）
            //    这两种情况在 MODIFY 行中都算作“单元格修改”
            if (i >= safeModified.length || i >= safeOriginal.length) {
                diffs.push({
                    isModified: true,
                    originalValue: i >= safeOriginal.length ? undefined : oldVal
                });
                continue;
            }

            // 2. 两者都有数据，比较内容
            const normA = this._normalizeCell(oldVal);
            const normB = this._normalizeCell(newVal);

            if (normA !== normB) {
                diffs.push({
                    isModified: true,
                    originalValue: oldVal // 保留原始值供前端展示 Tooltip
                });
            } else {
                diffs.push({ isModified: false });
            }
        }

        return diffs;
    }

    /**
     * @private
     * 构建 UI 友好的视图模型
     * 已修改：在 MODIFY 状态下增加 cellDiffs
     */
    _buildViewModel(ops, originalTable, modifiedTable) {
        return ops.map(op => {
            const rowOriginalData = op.rowOriginal !== null ? originalTable[op.rowOriginal] : null;
            const rowModifiedData = op.rowModified !== null ? modifiedTable[op.rowModified] : null;

            // 如果是修改行，计算具体的单元格差异
            let cellDiffs = null;
            if (op.type === 'MODIFY' && rowOriginalData && rowModifiedData) {
                cellDiffs = this._computeCellDiffs(rowOriginalData, rowModifiedData);
            }

            return {
                type: op.type,
                original: {
                    lineNo: op.rowOriginal !== null ? op.rowOriginal + 1 : null,
                    data: rowOriginalData
                },
                modified: {
                    lineNo: op.rowModified !== null ? op.rowModified + 1 : null,
                    data: rowModifiedData,
                    // 新增字段：仅在 MODIFY 时有值
                    cellDiffs: cellDiffs 
                }
            };
        });
    }
}

// =============================================================================
// 3. 辅助渲染器 (内部工具类，用于 printConsoleDebug)
// =============================================================================

class ConsoleRenderer {
    constructor(viewRows) {
        this.viewRows = viewRows;
    }

    safeStr(val) {
        return (val === null || val === undefined) ? "" : String(val);
    }

    calculateColWidths(rows, side) { // side: 'original' or 'modified'
        const widths = [];
        rows.forEach(row => {
            const data = row[side].data;
            if (data) {
                data.forEach((cell, idx) => {
                    const len = this.safeStr(cell).length;
                    const needed = len + 2; 
                    if (!widths[idx] || needed > widths[idx]) widths[idx] = needed;
                });
            }
        });
        return widths;
    }

    formatRow(data, widths, cellDiffs = null) {
        if (!data) return " ".repeat(widths.reduce((a, b) => a + b + 1, 0) - 1) + " ";
        
        // 注意：这里为了 Console 渲染简单，仅遍历了 data。
        // 如果 cellDiffs 长度 > data 长度（即有列被删除），标准控制台表格较难展示对齐。
        // 但逻辑层面 cellDiffs 已经包含了被删除列的 diff 信息。
        return data.map((c, i) => {
            let val = this.safeStr(c).padEnd(widths[i] || 10);
            // 简单模拟控制台高亮：如果该单元格变了，加个 * 号标记
            if (cellDiffs && cellDiffs[i] && cellDiffs[i].isModified) {
                val = `*${val.substring(0, val.length - 1)}`;
            }
            return val;
        }).join("|");
    }

    render() {
        // Console rendering removed
    }
}

// =============================================================================
// 4. 导出模块
// =============================================================================

if (typeof window !== 'undefined') {
    window.ExcelDiff = ExcelDiff;
}
else if (typeof module !== 'undefined' && module.exports) {
    module.exports = ExcelDiff;
}

