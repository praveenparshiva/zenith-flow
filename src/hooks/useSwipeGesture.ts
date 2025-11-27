import { useState, useRef, useCallback, TouchEvent, MouseEvent } from 'react';

interface SwipeState {
  offsetX: number;
  offsetY: number;
  isSwiping: boolean;
  direction: 'left' | 'right' | 'none';
  velocity: number;
}

interface SwipeConfig {
  threshold?: number;
  longSwipeThreshold?: number;
  onSwipeLeft?: () => void;
  onSwipeRight?: () => void;
  onLongSwipeLeft?: () => void;
  onLongSwipeRight?: () => void;
  onSwipeEnd?: () => void;
}

export function useSwipeGesture(config: SwipeConfig = {}) {
  const {
    threshold = 80,
    longSwipeThreshold = 150,
    onSwipeLeft,
    onSwipeRight,
    onLongSwipeLeft,
    onLongSwipeRight,
    onSwipeEnd,
  } = config;

  const [state, setState] = useState<SwipeState>({
    offsetX: 0,
    offsetY: 0,
    isSwiping: false,
    direction: 'none',
    velocity: 0,
  });

  const startPos = useRef({ x: 0, y: 0 });
  const startTime = useRef(0);
  const lastPos = useRef({ x: 0, y: 0 });
  const lastTime = useRef(0);
  const isActive = useRef(false);

  const triggerHaptic = useCallback((type: 'light' | 'medium' | 'heavy' = 'light') => {
    if ('vibrate' in navigator) {
      const durations = { light: 10, medium: 20, heavy: 30 };
      navigator.vibrate(durations[type]);
    }
  }, []);

  const getEventPosition = (e: TouchEvent | MouseEvent) => {
    if ('touches' in e) {
      return { x: e.touches[0].clientX, y: e.touches[0].clientY };
    }
    return { x: e.clientX, y: e.clientY };
  };

  const handleStart = useCallback((e: TouchEvent | MouseEvent) => {
    const pos = getEventPosition(e);
    startPos.current = pos;
    lastPos.current = pos;
    startTime.current = Date.now();
    lastTime.current = Date.now();
    isActive.current = true;
    
    setState(prev => ({ ...prev, isSwiping: true }));
  }, []);

  const handleMove = useCallback((e: TouchEvent | MouseEvent) => {
    if (!isActive.current) return;

    const pos = getEventPosition(e);
    const deltaX = pos.x - startPos.current.x;
    const deltaY = pos.y - startPos.current.y;
    
    // Calculate velocity
    const now = Date.now();
    const dt = now - lastTime.current;
    const dx = pos.x - lastPos.current.x;
    const velocity = dt > 0 ? Math.abs(dx / dt) : 0;
    
    lastPos.current = pos;
    lastTime.current = now;

    // Ignore vertical swipes
    if (Math.abs(deltaY) > Math.abs(deltaX) * 1.5) {
      return;
    }

    const direction = deltaX > 0 ? 'right' : deltaX < 0 ? 'left' : 'none';

    setState({
      offsetX: deltaX,
      offsetY: 0,
      isSwiping: true,
      direction,
      velocity,
    });
  }, []);

  const handleEnd = useCallback(() => {
    if (!isActive.current) return;
    isActive.current = false;

    const { offsetX, velocity } = state;
    const absOffset = Math.abs(offsetX);
    const isLongSwipe = absOffset >= longSwipeThreshold;
    const isSwipe = absOffset >= threshold || velocity > 0.5;

    if (isSwipe) {
      triggerHaptic(isLongSwipe ? 'heavy' : 'medium');
      
      if (offsetX > 0) {
        if (isLongSwipe && onLongSwipeRight) {
          onLongSwipeRight();
        } else if (onSwipeRight) {
          onSwipeRight();
        }
      } else {
        if (isLongSwipe && onLongSwipeLeft) {
          onLongSwipeLeft();
        } else if (onSwipeLeft) {
          onSwipeLeft();
        }
      }
    }

    onSwipeEnd?.();
    setState({
      offsetX: 0,
      offsetY: 0,
      isSwiping: false,
      direction: 'none',
      velocity: 0,
    });
  }, [state, threshold, longSwipeThreshold, onSwipeLeft, onSwipeRight, onLongSwipeLeft, onLongSwipeRight, onSwipeEnd, triggerHaptic]);

  const handlers = {
    onTouchStart: handleStart,
    onTouchMove: handleMove,
    onTouchEnd: handleEnd,
    onMouseDown: handleStart,
    onMouseMove: handleMove,
    onMouseUp: handleEnd,
    onMouseLeave: handleEnd,
  };

  return {
    ...state,
    handlers,
    triggerHaptic,
  };
}
