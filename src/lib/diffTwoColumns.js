/**
 * @file ExcelColumnIntersect.js
 * @description 专注于两表指定列的交集比对算法，并包含控制台双栏可视化输出。
 */

// =============================================================================
// 1. 算法核心类 (ExcelColumnIntersect)
// =============================================================================

export class ExcelColumnIntersect {
    constructor(options = {}) {
        this.options = {
            ignoreWhitespace: true,
            ignoreCase: true,
            ignoreEmpty: true, 
            ...options
        };
    }

    /**
     * 执行交集对比
     * @param {Array<Array<any>>} tableA
     * @param {string|number} colA 
     * @param {Array<Array<any>>} tableB 
     * @param {string|number} colB 
     */
    compare(tableA, colA, tableB, colB) {
        const idxA = this._parseColumnIndex(colA);
        const idxB = this._parseColumnIndex(colB);

        const setA = this._extractKeySet(tableA, idxA);
        const setB = this._extractKeySet(tableB, idxB);

        // 计算交集：只有同时存在于 A 和 B 中的键值才是“SAME”
        const intersection = new Set();
        for (const val of setA) {
            if (setB.has(val)) {
                intersection.add(val);
            }
        }

        const resultA = this._generateRowResults(tableA, idxA, intersection);
        const resultB = this._generateRowResults(tableB, idxB, intersection);

        return {
            tableA: resultA,
            tableB: resultB,
            stats: {
                commonKeys: intersection.size,
                totalA: tableA.length,
                totalB: tableB.length
            }
        };
    }

    _extractKeySet(table, colIndex) {
        const set = new Set();
        if (!Array.isArray(table)) return set;
        for (const row of table) {
            const val = this._getNormalizedValue(row, colIndex);
            if (this.options.ignoreEmpty && val === "") continue;
            set.add(val);
        }
        return set;
    }

    _generateRowResults(table, colIndex, intersectionSet) {
        if (!Array.isArray(table)) return [];
        return table.map((row, index) => {
            const val = this._getNormalizedValue(row, colIndex);
            let isSame = false;
            // 如果是空值且忽略空值，直接视为不同，避免大片空行高亮
            if (this.options.ignoreEmpty && val === "") {
                isSame = false;
            } else {
                isSame = intersectionSet.has(val);
            }
            return {
                status: isSame ? 'SAME' : 'DIFF',
                rowIndex: index,
                key: val,
                data: row
            };
        });
    }

    _getNormalizedValue(row, colIndex) {
        if (!Array.isArray(row) || row.length <= colIndex) return "";
        let cellValue = row[colIndex];
        if (cellValue === null || cellValue === undefined) return "";
        let str = String(cellValue);
        if (this.options.ignoreWhitespace) str = str.trim();
        if (this.options.ignoreCase) str = str.toLowerCase();
        return str;
    }

    _parseColumnIndex(col) {
        if (typeof col === 'number') return col;
        if (typeof col === 'string') {
            if (/^\d+$/.test(col)) return parseInt(col, 10);
            let index = 0;
            const cleanCol = col.toUpperCase().trim();
            for (let i = 0; i < cleanCol.length; i++) {
                index = index * 26 + (cleanCol.charCodeAt(i) - 64);
            }
            return index - 1;
        }
        throw new Error(`Invalid column index '${col}'`);
    }
}


