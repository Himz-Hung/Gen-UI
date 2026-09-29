import { useLayoutEffect, useRef, useState } from 'react';
import { tokens, sp, font } from './tokens';

export interface BreadcrumbsProps {
  items: { value: string; label: string }[];
  onPress?: (value: string) => void;
}

export function Breadcrumbs({ items, onPress }: BreadcrumbsProps) {
  const [expanded, setExpanded] = useState(false);
  const containerRef = useRef<HTMLElement | null>(null);
  const [collapse, setCollapse] = useState(false);

  useLayoutEffect(() => {
    setExpanded(false);
  }, [items]);

  useLayoutEffect(() => {
    const el = containerRef.current;
    if (!el || expanded || items.length <= 3) { setCollapse(false); return; }
    const approxWidth = items.reduce((sum, i) => sum + i.label.length * 8 + 28, 0);
    const available = el.parentElement?.getBoundingClientRect().width ?? el.getBoundingClientRect().width;
    setCollapse(approxWidth > (available || Infinity));
  }, [items, expanded]);

  const visible: ({ value: string; label: string } | null)[] = collapse
    ? [items[0], null, items[items.length - 1]]
    : items;

  return (
    <nav aria-label="Breadcrumb" ref={containerRef} style={{ fontFamily: font('body') }}>
      <ol style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: sp(1), listStyle: 'none', margin: 0, padding: 0 }}>
        {visible.map((item, i) => {
          const isLast = i === visible.length - 1;
          return (
            <li key={item ? item.value : `ellipsis-${i}`} style={{ display: 'flex', alignItems: 'center', gap: sp(1) }}>
              {i > 0 && <span aria-hidden style={{ color: tokens.color.muted }}>›</span>}
              {item === null ? (
                <button
                  type="button"
                  onClick={() => setExpanded(true)}
                  style={{ background: 'none', border: 'none', color: tokens.color.muted, cursor: 'pointer', padding: 0 }}
                >
                  …
                </button>
              ) : isLast ? (
                <span aria-current="page" style={{ color: tokens.color.text, fontWeight: 600 }}>
                  {item.label}
                </span>
              ) : (
                <button
                  type="button"
                  onClick={() => onPress?.(item.value)}
                  style={{ background: 'none', border: 'none', color: tokens.color.muted, cursor: 'pointer', padding: 0 }}
                >
                  {item.label}
                </button>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
