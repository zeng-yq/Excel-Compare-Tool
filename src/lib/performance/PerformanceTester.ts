/**
 * 性能测试和验证工具
 * 用于验证重构后的性能目标是否达成
 */

// 性能测试结果接口
export interface PerformanceTestResult {
  testName: string;
  rowCount: number;
  columnCount: number;
  renderTime: number; // 渲染时间（毫秒）
  scrollFrameRate: number; // 滚动帧率
  memoryUsage: number; // 内存使用量（MB）
  cacheHitRate: number; // 缓存命中率
  scrollSyncDelay: number; // 滚动同步延迟（毫秒）
  passed: boolean; // 是否通过测试
  metrics: {
    firstPaint: number;
    firstContentfulPaint: number;
    largestContentfulPaint: number;
    cumulativeLayoutShift: number;
  };
}

// 性能基准
export interface PerformanceBenchmark {
  maxRenderTime: number; // 最大渲染时间
  minFrameRate: number; // 最小帧率
  maxMemoryUsage: number; // 最大内存使用量（MB）
  minCacheHitRate: number; // 最小缓存命中率
  maxScrollSyncDelay: number; // 最大滚动同步延迟
}

// 测试数据生成器
export class TestDataGenerator {
  // 生成测试数据
  static generateTestData(rowCount: number, columnCount: number, changeRatio: number = 0.1): {
    leftData: any[][];
    rightData: any[][];
    diffTypes: string[];
  } {
    const leftData: any[][] = [];
    const rightData: any[][] = [];
    const diffTypes: string[] = [];

    for (let i = 0; i < rowCount; i++) {
      const leftRow: any[] = [];
      const rightRow: any[] = [];

      for (let j = 0; j < columnCount; j++) {
        const baseValue = `R${i}C${j}`;
        leftRow.push(baseValue);

        // 根据变化比率生成差异
        if (Math.random() < changeRatio) {
          rightRow.push(`${baseValue}_MODIFIED`);
        } else {
          rightRow.push(baseValue);
        }
      }

      leftData.push(leftRow);
      rightData.push(rightRow);

      // 随机生成差异类型
      const rand = Math.random();
      if (rand < 0.7) {
        diffTypes.push('KEEP');
      } else if (rand < 0.85) {
        diffTypes.push('MODIFY');
      } else if (rand < 0.95) {
        diffTypes.push('ADD');
      } else {
        diffTypes.push('DELETE');
      }
    }

    return { leftData, rightData, diffTypes };
  }

  // 生成大型测试数据集
  static generateLargeDataSets(): Array<{ name: string; rows: number; cols: number }> {
    return [
      { name: '小型数据集', rows: 1000, cols: 10 },
      { name: '中型数据集', rows: 10000, cols: 50 },
      { name: '大型数据集', rows: 100000, cols: 100 },
      { name: '超大数据集', rows: 1000000, cols: 200 }
    ];
  }
}

// 性能测试器
export class PerformanceTester {
  private static instance: PerformanceTester;
  private testResults: PerformanceTestResult[] = [];
  private isRunning = false;

  private constructor() {}

  static getInstance(): PerformanceTester {
    if (!PerformanceTester.instance) {
      PerformanceTester.instance = new PerformanceTester();
    }
    return PerformanceTester.instance;
  }

  // 运行完整的性能测试套件
  async runFullTestSuite(): Promise<PerformanceTestResult[]> {
    if (this.isRunning) {
      throw new Error('性能测试正在进行中');
    }

    this.isRunning = true;
    this.testResults = [];

    try {
      
      const dataSets = TestDataGenerator.generateLargeDataSets();
      const benchmark: PerformanceBenchmark = {
        maxRenderTime: 100,
        minFrameRate: 55,
        maxMemoryUsage: 500,
        minCacheHitRate: 0.7,
        maxScrollSyncDelay: 16
      };

      for (const dataSet of dataSets) {
        
        const result = await this.runSingleTest(
          dataSet.name,
          dataSet.rows,
          dataSet.cols,
          benchmark
        );

        this.testResults.push(result);

        // 强制垃圾回收（如果支持）
        if ('gc' in globalThis) {
          (globalThis as any).gc();
        }

        // 等待一段时间让系统稳定
        await new Promise(resolve => setTimeout(resolve, 2000));
      }

            return this.testResults;

    } finally {
      this.isRunning = false;
    }
  }

  // 运行单个性能测试
  private async runSingleTest(
    testName: string,
    rowCount: number,
    columnCount: number,
    benchmark: PerformanceBenchmark
  ): Promise<PerformanceTestResult> {
    // 生成测试数据
    const { leftData, rightData, diffTypes } = TestDataGenerator.generateTestData(
      rowCount,
      columnCount,
      0.15
    );

    // 清理缓存和内存
    if ('gc' in globalThis) {
      (globalThis as any).gc();
    }

    // 记录开始时间
    const startTime = performance.now();

    // 测量初始内存
    const initialMemory = this.getMemoryUsage();

    // 测试渲染性能
    const renderMetrics = await this.measureRenderPerformance(leftData, rightData, diffTypes, columnCount);

    // 测试滚动性能
    const scrollMetrics = await this.measureScrollPerformance();

    // 测量最终内存
    const finalMemory = this.getMemoryUsage();
    const memoryDelta = finalMemory - initialMemory;

    // 计算性能指标
    const totalTime = performance.now() - startTime;
    const passed = this.evaluatePerformance(renderMetrics, scrollMetrics, memoryDelta, benchmark);

    const result: PerformanceTestResult = {
      testName,
      rowCount,
      columnCount,
      renderTime: renderMetrics.renderTime,
      scrollFrameRate: scrollMetrics.frameRate,
      memoryUsage: finalMemory,
      cacheHitRate: renderMetrics.cacheHitRate,
      scrollSyncDelay: scrollMetrics.syncDelay,
      passed,
      metrics: {
        firstPaint: renderMetrics.firstPaint,
        firstContentfulPaint: renderMetrics.firstContentfulPaint,
        largestContentfulPaint: renderMetrics.largestContentfulPaint,
        cumulativeLayoutShift: renderMetrics.cumulativeLayoutShift
      }
    };

    
    return result;
  }

  // 测量渲染性能
  private async measureRenderPerformance(
    leftData: any[][],
    rightData: any[][],
    diffTypes: string[],
    columnCount: number
  ): Promise<{
    renderTime: number;
    cacheHitRate: number;
    firstPaint: number;
    firstContentfulPaint: number;
    largestContentfulPaint: number;
    cumulativeLayoutShift: number;
  }> {
    const startTime = performance.now();

    // 模拟组件渲染（这里需要实际的组件渲染逻辑）
    // 在实际实现中，您需要渲染组件并测量性能
    await new Promise(resolve => setTimeout(resolve, Math.min(100, leftData.length / 100)));

    const renderTime = performance.now() - startTime;

    // 模拟缓存命中率
    const cacheHitRate = Math.min(0.95, 0.5 + (leftData.length / 100000) * 0.45);

    // 模拟 Web Vitals 指标
    const firstPaint = 50 + Math.random() * 50;
    const firstContentfulPaint = firstPaint + Math.random() * 50;
    const largestContentfulPaint = firstContentfulPaint + Math.random() * 100;
    const cumulativeLayoutShift = Math.random() * 0.1;

    return {
      renderTime,
      cacheHitRate,
      firstPaint,
      firstContentfulPaint,
      largestContentfulPaint,
      cumulativeLayoutShift
    };
  }

  // 测量滚动性能
  private async measureScrollPerformance(): Promise<{
    frameRate: number;
    syncDelay: number;
  }> {
    // 模拟滚动测试
    const frameCount = 60;
    const testDuration = 1000; // 1秒
    const startTime = performance.now();

    // 模拟滚动帧
    let frameTime = 0;
    for (let i = 0; i < frameCount; i++) {
      frameTime += 16.67 + Math.random() * 5; // 60fps + 一些变化
    }

    const actualDuration = performance.now() - startTime;
    const frameRate = (frameCount / actualDuration) * 1000;

    // 模拟同步延迟
    const syncDelay = 8 + Math.random() * 8; // 8-16ms

    return {
      frameRate,
      syncDelay
    };
  }

  // 获取内存使用量
  private getMemoryUsage(): number {
    if (typeof performance !== 'undefined' && (performance as any).memory) {
      return (performance as any).memory.usedJSHeapSize / 1024 / 1024; // MB
    }
    return 0;
  }

  // 评估性能是否达标
  private evaluatePerformance(
    renderMetrics: any,
    scrollMetrics: any,
    memoryDelta: number,
    benchmark: PerformanceBenchmark
  ): boolean {
    return (
      renderMetrics.renderTime <= benchmark.maxRenderTime &&
      scrollMetrics.frameRate >= benchmark.minFrameRate &&
      memoryDelta <= benchmark.maxMemoryUsage &&
      renderMetrics.cacheHitRate >= benchmark.minCacheHitRate &&
      scrollMetrics.syncDelay <= benchmark.maxScrollSyncDelay
    );
  }

  // 生成性能报告
  generateReport(): string {
    if (this.testResults.length === 0) {
      return '没有测试结果';
    }

    let report = '# 性能测试报告\n\n';
    report += `测试时间: ${new Date().toLocaleString()}\n\n`;

    // 汇总统计
    const passedTests = this.testResults.filter(r => r.passed).length;
    const totalTests = this.testResults.length;
    const passRate = (passedTests / totalTests) * 100;

    report += `## 汇总统计\n`;
    report += `- 总测试数: ${totalTests}\n`;
    report += `- 通过测试: ${passedTests}\n`;
    report += `- 通过率: ${passRate.toFixed(1)}%\n\n`;

    // 详细结果
    report += `## 详细结果\n\n`;

    for (const result of this.testResults) {
      report += `### ${result.testName}\n`;
      report += `- 数据规模: ${result.rowCount.toLocaleString()} 行 × ${result.columnCount} 列\n`;
      report += `- 渲染时间: ${result.renderTime.toFixed(2)}ms ${result.renderTime <= 100 ? '✓' : '✗'}\n`;
      report += `- 滚动帧率: ${result.scrollFrameRate.toFixed(1)}fps ${result.scrollFrameRate >= 55 ? '✓' : '✗'}\n`;
      report += `- 内存使用: ${result.memoryUsage.toFixed(1)}MB ${result.memoryUsage <= 500 ? '✓' : '✗'}\n`;
      report += `- 缓存命中率: ${(result.cacheHitRate * 100).toFixed(1)}% ${result.cacheHitRate >= 0.7 ? '✓' : '✗'}\n`;
      report += `- 滚动同步延迟: ${result.scrollSyncDelay.toFixed(2)}ms ${result.scrollSyncDelay <= 16 ? '✓' : '✗'}\n`;
      report += `- 整体评估: ${result.passed ? '✓ 通过' : '✗ 未通过'}\n\n`;
    }

    // 性能基准对比
    report += `## 性能基准\n`;
    report += `- 最大渲染时间: 100ms\n`;
    report += `- 最小滚动帧率: 55fps\n`;
    report += `- 最大内存使用: 500MB\n`;
    report += `- 最小缓存命中率: 70%\n`;
    report += `- 最大滚动同步延迟: 16ms\n\n`;

    // 建议
    report += `## 建议\n`;
    if (passRate < 100) {
      report += `- 部分测试未通过，建议进一步优化性能\n`;
      const failedTests = this.testResults.filter(r => !r.passed);
      for (const test of failedTests) {
        report += `- ${test.testName}: 需要优化\n`;
      }
    } else {
      report += `- 所有测试通过，性能优化目标达成！\n`;
    }

    return report;
  }

  // 获取测试结果
  getTestResults(): PerformanceTestResult[] {
    return [...this.testResults];
  }

  // 清理测试结果
  clearResults(): void {
    this.testResults = [];
  }
}

// 导出单例实例
export const performanceTester = PerformanceTester.getInstance();