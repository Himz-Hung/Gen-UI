import { useRef, useState, type TouchEvent } from 'react';
import { tokens } from './tokens';

export interface PullToRefreshProps {
  label: string;
  refreshing: boolean;
  onRefresh?: () => void;
  children?: React.ReactNode;
}

const THRESHOLD = 60;

export function PullToRefresh({ label, refreshing, onRefresh, children }: PullToRefreshProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const startY = useRef<number | null>(null);
  const [pullDistance, setPullDistance] = useState(0);

  // Never emits refresh again while refreshing.
  const trigger = () => {
    if (refreshing) return;
    onRefresh?.();
  };

  const onTouchStart = (e: TouchEvent<HTMLDivElement>) => {
    const el = scrollRef.current;
    if (refreshing || !el || el.scrollTop > 0) {
      startY.current = null;
      return;
    }
    startY.current = e.touches[0]?.clientY ?? null;
  };
  const onTouchMove = (e: TouchEvent<HTMLDivElement>) => {
    if (startY.current == null || refreshing) return;
    const delta = (e.touches[0]?.clientY ?? startY.current) - startY.current;
    if (delta > 0) setPullDistance(delta);
  };
  const onTouchEnd = () => {
    if (startY.current == null) return;
    // Pulling past the threshold at the top emits refresh.
    if (pullDistance > THRESHOLD) trigger();
    startY.current = null;
    setPullDistance(0);
  };

  const pulling = pullDistance > 0 && !refreshing;
  const indicatorHeight = refreshing ? 40 : Math.min(pullDistance, 60);

  return (
    <div style={{ position: 'relative' }}>
      <div
        aria-hidden
        style={{
          height: indicatorHeight,
          overflow: 'hidden',
          display: 'grid',
          placeItems: 'center',
          color: tokens.color.primary,
          transition: refreshing || pulling ? undefined : 'height 0.15s ease-out',
        }}
      >
        {(refreshing || pulling) && <span>↻</span>}
      </div>
      {/* The refresh action is also available to assistive tech as a custom action named by label. */}
      <button
        type="button"
        onClick={trigger}
        disabled={refreshing}
        style={{ position: 'absolute', width: 1, height: 1, padding: 0, margin: -1, overflow: 'hidden', clip: 'rect(0,0,0,0)', whiteSpace: 'nowrap', border: 0 }}
      >
        {label}
      </button>
      <div
        ref={scrollRef}
        data-testid="pull-to-refresh-scroll"
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
        onTouchEnd={onTouchEnd}
        style={{ overflowY: 'auto' }}
      >
        {children}
      </div>
    </div>
  );
}
