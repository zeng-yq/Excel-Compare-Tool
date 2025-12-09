'use client';

import { useRef, useCallback, useEffect, useMemo } from 'react';

// 滚动状态接口
interface ScrollState {
  scrollTop: number;
  scrollLeft: number;
  timestamp: number;
  velocity: number; // 滚动速度
}

// 滚动同步配置
interface ScrollSyncConfig {
  syncSpeed: number; // 同步速度系数 (0-1)
  debounceMs: number; // 防抖延迟（毫秒）
  maxDelta: number; // 最大同步差值（像素）
  enableVelocityPrediction: boolean; // 启用速度预测
  enableMomentumScrolling: boolean; // 启用动量滚动
  friction: number; // 摩擦系数（用于动量滚动）
}

// 性能监控接口
interface ScrollSyncMetrics {
  syncCount: number;
  averageSyncTime: number;
  droppedFrames: number;
  totalScrollDistance: number;
}

/**
 * 增强版滚动同步 Hook
 * 支持高性能滚动同步、动量滚动、速度预测等
 */
export const useEnhancedScrollSync = (
  leftScrollRef: React.RefObject<HTMLDivElement>,
  rightScrollRef: React.RefObject<HTMLDivElement>,
  config: Partial<ScrollSyncConfig> = {}
) => {
  // 滚动状态
  const scrollStateRef = useRef<{
    left: ScrollState;
    right: ScrollState;
    isSyncing: boolean;
    lastSyncTime: number;
    animationFrameId: number | null;
    momentumAnimationId: number | null;
  }>({
    left: { scrollTop: 0, scrollLeft: 0, timestamp: 0, velocity: 0 },
    right: { scrollTop: 0, scrollLeft: 0, timestamp: 0, velocity: 0 },
    isSyncing: false,
    lastSyncTime: 0,
    animationFrameId: null,
    momentumAnimationId: null
  });

  // 性能指标
  const metricsRef = useRef<ScrollSyncMetrics>({
    syncCount: 0,
    averageSyncTime: 0,
    droppedFrames: 0,
    totalScrollDistance: 0
  });

  // 上次滚动时间
  const lastScrollTimeRef = useRef<{ left: number; right: number }>({
    left: 0,
    right: 0
  });

  // 合并配置
  const scrollConfig: ScrollSyncConfig = useMemo(() => ({
    syncSpeed: 1,
    debounceMs: 8, // 降低到 8ms 以提高响应性
    maxDelta: 3, // 减小最大差值以提高精度
    enableVelocityPrediction: true,
    enableMomentumScrolling: true,
    friction: 0.95,
    ...config
  }), [config]);

  // 计算滚动速度
  const calculateVelocity = useCallback((
    currentScrollTop: number,
    previousScrollTop: number,
    currentTime: number,
    previousTime: number
  ): number => {
    if (previousTime === 0) return 0;

    const distance = currentScrollTop - previousScrollTop;
    const timeDelta = currentTime - previousTime;

    return timeDelta > 0 ? distance / timeDelta * 1000 : 0; // 像素/秒
  }, []);

  // 高性能滚动同步核心函数
  const performScrollSync = useCallback((
    sourceElement: HTMLElement,
    targetElement: HTMLElement,
    sourceSide: 'left' | 'right'
  ) => {
    const startTime = performance.now();

    const sourceScrollTop = sourceElement.scrollTop;
    const targetScrollTop = targetElement.scrollTop;
    const currentTime = performance.now();

    // 更新滚动状态
    const previousState = scrollStateRef.current[sourceSide];
    const velocity = calculateVelocity(
      sourceScrollTop,
      previousState.scrollTop,
      currentTime,
      previousState.timestamp
    );

    scrollStateRef.current[sourceSide] = {
      scrollTop: sourceScrollTop,
      scrollLeft: sourceElement.scrollLeft,
      timestamp: currentTime,
      velocity
    };

    // 计算同步差异
    const delta = Math.abs(targetScrollTop - sourceScrollTop);

    // 只在差值超过阈值时进行同步
    if (delta > scrollConfig.maxDelta) {
      const targetScrollElement = targetElement.querySelector('[data-scroll-container]') as HTMLElement;

      if (targetScrollElement) {
        // 使用插值计算平滑滚动目标位置
        const syncSpeed = scrollConfig.syncSpeed;
        const targetValue = targetScrollTop + (sourceScrollTop - targetScrollTop) * syncSpeed;

        // 速度预测
        let predictedScrollTop = targetValue;
        if (scrollConfig.enableVelocityPrediction) {
          predictedScrollTop = targetValue + (velocity * 0.016 * syncSpeed); // 16ms 预测
        }

        // 使用 transform 而不是 scrollTop 以避免重排
        targetScrollElement.style.transform = `translateY(${-predictedScrollTop}px)`;

        // 在下一个动画帧同步实际的 scrollTop
        const rafId = requestAnimationFrame(() => {
          targetElement.scrollTop = predictedScrollTop;
        });

        scrollStateRef.current.animationFrameId = rafId;
      }

      // 更新性能指标
      const syncTime = performance.now() - startTime;
      metricsRef.current.syncCount++;
      metricsRef.current.totalScrollDistance += Math.abs(velocity * 0.016);

      // 计算平均同步时间
      const totalSyncTime = metricsRef.current.averageSyncTime * (metricsRef.current.syncCount - 1) + syncTime;
      metricsRef.current.averageSyncTime = totalSyncTime / metricsRef.current.syncCount;
    }

    scrollStateRef.current.lastSyncTime = currentTime;
  }, [calculateVelocity, scrollConfig]);

  // 动量滚动处理
  const handleMomentumScroll = useCallback((
    side: 'left' | 'right',
    velocity: number
  ) => {
    if (!scrollConfig.enableMomentumScrolling || Math.abs(velocity) < 50) return;

    const sourceElement = side === 'left' ? leftScrollRef.current : rightScrollRef.current;
    const targetElement = side === 'left' ? rightScrollRef.current : leftScrollRef.current;

    if (!sourceElement || !targetElement) return;

    let currentVelocity = velocity * scrollConfig.friction;

    const animate = () => {
      if (Math.abs(currentVelocity) < 1) {
        if (scrollStateRef.current.momentumAnimationId) {
          cancelAnimationFrame(scrollStateRef.current.momentumAnimationId);
          scrollStateRef.current.momentumAnimationId = null;
        }
        return;
      }

      const scrollDelta = currentVelocity * 0.016; // 16ms 时间步长
      sourceElement.scrollTop += scrollDelta;

      // 同步到目标元素
      performScrollSync(sourceElement, targetElement, side);

      currentVelocity *= scrollConfig.friction;

      scrollStateRef.current.momentumAnimationId = requestAnimationFrame(animate);
    };

    animate();
  }, [leftScrollRef, rightScrollRef, performScrollSync, scrollConfig]);

  // 创建滚动处理器
  const createScrollHandler = useCallback((side: 'left' | 'right') => {
    return (e: React.UIEvent<HTMLDivElement>) => {
      const scrollContainer = e.currentTarget;
      const currentTime = performance.now();

      // 节流控制
      const timeSinceLastScroll = currentTime - lastScrollTimeRef.current[side];
      if (timeSinceLastScroll < scrollConfig.debounceMs) {
        return;
      }
      lastScrollTimeRef.current[side] = currentTime;

      // 防止同步循环
      if (scrollStateRef.current.isSyncing) {
        return;
      }

      scrollStateRef.current.isSyncing = true;

      const sourceElement = scrollContainer;
      const targetElement = side === 'left' ? rightScrollRef.current : leftScrollRef.current;

      if (targetElement) {
        performScrollSync(sourceElement, targetElement, side);

        // 检查是否需要启动动量滚动
        const velocity = scrollStateRef.current[side].velocity;
        if (scrollConfig.enableMomentumScrolling && Math.abs(velocity) > 100) {
          // 延迟启动动量滚动，避免与正常滚动冲突
          setTimeout(() => {
            if (!scrollStateRef.current.isSyncing) {
              handleMomentumScroll(side, velocity);
            }
          }, 50);
        }
      }

      // 短暂延迟后重置同步标志
      setTimeout(() => {
        scrollStateRef.current.isSyncing = false;
      }, scrollConfig.debounceMs);
    };
  }, [rightScrollRef, leftScrollRef, performScrollSync, scrollConfig, handleMomentumScroll]);

  // 横向滚动处理器
  const createHorizontalScrollHandler = useCallback((side: 'left' | 'right') => {
    return (e: React.UIEvent<HTMLDivElement>) => {
      const scrollLeft = e.currentTarget.scrollLeft;
      const targetElement = side === 'left' ? rightScrollRef.current : leftScrollRef.current;

      if (targetElement) {
        const targetScrollContainer = targetElement.querySelector('[data-scroll-container]') as HTMLElement;
        if (targetScrollContainer) {
          // 使用 CSS transform 实现水平同步
          targetScrollContainer.style.transform = `translateX(-${scrollLeft}px)`;
        }
      }
    };
  }, [leftScrollRef, rightScrollRef]);

  // 创建实际的处理器函数
  const handleLeftScroll = useMemo(() => createScrollHandler('left'), [createScrollHandler]);
  const handleRightScroll = useMemo(() => createScrollHandler('right'), [createScrollHandler]);
  const handleLeftHorizontalScroll = useMemo(() => createHorizontalScrollHandler('left'), [createHorizontalScrollHandler]);
  const handleRightHorizontalScroll = useMemo(() => createHorizontalScrollHandler('right'), [createHorizontalScrollHandler]);

  // 程序化滚动到指定位置
  const scrollToPosition = useCallback((side: 'left' | 'right', scrollTop: number, smooth: boolean = true) => {
    const element = side === 'left' ? leftScrollRef.current : rightScrollRef.current;
    const targetElement = side === 'left' ? rightScrollRef.current : leftScrollRef.current;

    if (element && targetElement) {
      element.scrollTo({
        top: scrollTop,
        behavior: smooth ? 'smooth' : 'auto'
      });

      // 同步到目标元素
      setTimeout(() => {
        performScrollSync(element, targetElement, side);
      }, smooth ? 100 : 0);
    }
  }, [leftScrollRef, rightScrollRef, performScrollSync]);

  // 获取性能指标
  const getMetrics = useCallback((): ScrollSyncMetrics => ({ ...metricsRef.current }), []);

  // 重置性能指标
  const resetMetrics = useCallback(() => {
    metricsRef.current = {
      syncCount: 0,
      averageSyncTime: 0,
      droppedFrames: 0,
      totalScrollDistance: 0
    };
  }, []);

  // 清理函数
  const cleanup = useCallback(() => {
    if (scrollStateRef.current.animationFrameId) {
      cancelAnimationFrame(scrollStateRef.current.animationFrameId);
    }
    if (scrollStateRef.current.momentumAnimationId) {
      cancelAnimationFrame(scrollStateRef.current.momentumAnimationId);
    }
  }, []);

  // 组件卸载时清理
  useEffect(() => {
    return cleanup;
  }, [cleanup]);

  return {
    handleLeftScroll,
    handleRightScroll,
    handleLeftHorizontalScroll,
    handleRightHorizontalScroll,
    scrollToPosition,
    getMetrics,
    resetMetrics,
    cleanup
  };
};