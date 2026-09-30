import { Children, useEffect, useRef, useState } from 'react';
import { tokens, sp, alpha } from './tokens';

export interface HorizontalScrollProps {
  label: string;
  gap?: '0' | '1' | '2' | '3' | '4' | '5' | '6' | '7';
  itemWidth?: number;
  snap?: boolean;
  showArrows?: boolean;
  children?: React.ReactNode;
}

export function HorizontalScroll({ label, gap = '3', itemWidth, snap = true, showArrows = true, children }: HorizontalScrollProps) {
  const trackRef = useRef<HTMLDivElement>(null);
  const [atStart, setAtStart] = useState(true);
  const [atEnd, setAtEnd] = useState(false);

  const update = () => {
    const el = trackRef.current;
    if (!el) return;
    setAtStart(el.scrollLeft <= 1);
    setAtEnd(el.scrollLeft + el.clientWidth >= el.scrollWidth - 1);
  };

  useEffect(() => {
    update();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [children, itemWidth]);

  const by = (direction: 1 | -1) => {
    const el = trackRef.current;
    if (!el) return;
    const amount = direction * el.clientWidth * 0.9;
    if (typeof el.scrollBy === 'function') {
      try {
        el.scrollBy({ left: amount, behavior: 'smooth' });
      } catch {
        el.scrollLeft += amount;
      }
    } else {
      el.scrollLeft += amount;
    }
  };

  const items = Children.toArray(children);
  // Previous / next controls are for pointer devices; coarse (touch) pointers scroll directly.
  const pointerDevice = typeof window === 'undefined' || typeof window.matchMedia !== 'function' ? true : window.matchMedia('(hover: hover) and (pointer: fine)').matches;
  const arrows = showArrows && pointerDevice;

  return (
    <div role="region" aria-label={label} style={{ position: 'relative' }}>
      <div
        ref={trackRef}
        onScroll={update}
        style={{
          display: 'flex',
          overflowX: 'auto',
          scrollSnapType: snap ? 'x mandatory' : undefined,
          gap: sp(gap),
          padding: `0 ${sp(4)}`,
          scrollbarWidth: 'none',
        }}
      >
        {items.map((child, i) => (
          <div
            key={i}
            style={{
              flex: itemWidth != null ? `0 0 ${itemWidth}px` : '0 0 auto',
              scrollSnapAlign: snap ? 'start' : undefined,
            }}
          >
            {child}
          </div>
        ))}
      </div>
      {arrows && (
        <>
          <button
            type="button"
            aria-label="Previous"
            disabled={atStart}
            onClick={() => by(-1)}
            style={{
              position: 'absolute', left: sp(1), top: '50%', transform: 'translateY(-50%)',
              width: 32, height: 32, borderRadius: tokens.radius.full, border: 'none',
              background: tokens.color.surface, boxShadow: `0 1px 4px ${alpha(tokens.color.shadow, 0.2)}`,
              cursor: atStart ? 'not-allowed' : 'pointer', opacity: atStart ? 0.4 : 1,
              display: 'grid', placeItems: 'center',
            }}
          >
            ‹
          </button>
          <button
            type="button"
            aria-label="Next"
            disabled={atEnd}
            onClick={() => by(1)}
            style={{
              position: 'absolute', right: sp(1), top: '50%', transform: 'translateY(-50%)',
              width: 32, height: 32, borderRadius: tokens.radius.full, border: 'none',
              background: tokens.color.surface, boxShadow: `0 1px 4px ${alpha(tokens.color.shadow, 0.2)}`,
              cursor: atEnd ? 'not-allowed' : 'pointer', opacity: atEnd ? 0.4 : 1,
              display: 'grid', placeItems: 'center',
            }}
          >
            ›
          </button>
        </>
      )}
    </div>
  );
}
