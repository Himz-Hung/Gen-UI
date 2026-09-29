import { Children, type ReactNode } from 'react';
import { tokens, sp } from './tokens';
import { Icon } from './Icon';

export interface CarouselProps {
  label: string;
  index?: number;
  loop?: boolean;
  showDots?: boolean;
  showArrows?: boolean;
  onChange?: (value: number) => void;
  children?: ReactNode;
}

// Fully controlled by `index` (like Table's sortKey): the caller re-renders with the new index
// after onChange. This mirrors the Flutter widget, whose PageController is always synced back
// to widget.index. It never advances by itself.
export function Carousel({ label, index = 0, loop = false, showDots = true, showArrows = true, onChange, children }: CarouselProps) {
  const slides = Children.toArray(children);
  const count = slides.length;
  if (count === 0) return null;
  const clamped = Math.min(Math.max(index, 0), count - 1);

  const go = (delta: number) => {
    let next = clamped + delta;
    if (next < 0) next = loop ? count - 1 : 0;
    else if (next > count - 1) next = loop ? 0 : count - 1;
    if (next !== clamped) onChange?.(next);
  };

  return (
    <div>
      <div
        role="region"
        aria-label={`${label}, slide ${clamped + 1} of ${count}`}
        style={{ position: 'relative', overflow: 'hidden', borderRadius: tokens.radius.md }}
      >
        <div style={{ display: 'flex', transform: `translateX(-${clamped * 100}%)`, transition: 'transform 200ms ease' }}>
          {slides.map((slide, i) => (
            <div key={i} aria-hidden={i !== clamped} style={{ flex: '0 0 100%', width: '100%' }}>
              {slide}
            </div>
          ))}
        </div>
        {showArrows && count > 1 && (
          <>
            <button
              type="button"
              aria-label="Previous slide"
              onClick={() => go(-1)}
              disabled={!loop && clamped === 0}
              style={{ position: 'absolute', left: 0, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 0, cursor: 'pointer', color: tokens.color.text }}
            >
              <Icon name="chevron-left" />
            </button>
            <button
              type="button"
              aria-label="Next slide"
              onClick={() => go(1)}
              disabled={!loop && clamped === count - 1}
              style={{ position: 'absolute', right: 0, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 0, cursor: 'pointer', color: tokens.color.text }}
            >
              <Icon name="chevron-right" />
            </button>
          </>
        )}
      </div>
      {showDots && count > 1 && (
        <div style={{ display: 'flex', justifyContent: 'center', gap: sp(1), marginTop: sp(2) }}>
          {slides.map((_, i) => (
            <button
              key={i}
              type="button"
              aria-label={`Go to slide ${i + 1}`}
              aria-current={i === clamped || undefined}
              onClick={() => onChange?.(i)}
              style={{ width: 8, height: 8, padding: 0, borderRadius: '50%', border: 0, cursor: 'pointer', background: i === clamped ? tokens.color.primary : tokens.color.muted }}
            />
          ))}
        </div>
      )}
    </div>
  );
}
