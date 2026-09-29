import { Children, useEffect, useRef, useState, type MouseEvent as ReactMouseEvent, type PointerEvent as ReactPointerEvent, type ReactNode } from 'react';
import { tokens, sp } from './tokens';
import { Icon } from './Icon';

export interface SwipeActionsProps {
  actions: { value: string; label: string; icon?: string; tone?: 'neutral' | 'primary' | 'danger' }[];
  fullSwipe?: boolean;
  onAction?: (value: string) => void;
  children?: ReactNode;
}

const ACTION_WIDTH = 72;
const TONE_COLOR: Record<NonNullable<SwipeActionsProps['actions'][number]['tone']>, string> = {
  neutral: tokens.color.secondary,
  primary: tokens.color.primary,
  danger: tokens.color.danger,
};

export function SwipeActions({ actions, fullSwipe = false, onAction, children }: SwipeActionsProps) {
  const [offset, setOffset] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const dragRef = useRef<{ startX: number; startOffset: number } | null>(null);
  const pressTimerRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  const maxOffset = ACTION_WIDTH * actions.length;
  const clampMin = -maxOffset * (fullSwipe ? 2.2 : 1);

  // Pressing elsewhere or scrolling closes the revealed actions.
  useEffect(() => {
    if (offset === 0) return;
    const onDocPointerDown = (e: Event) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) setOffset(0);
    };
    document.addEventListener('pointerdown', onDocPointerDown);
    document.addEventListener('mousedown', onDocPointerDown);
    return () => {
      document.removeEventListener('pointerdown', onDocPointerDown);
      document.removeEventListener('mousedown', onDocPointerDown);
    };
  }, [offset]);

  useEffect(() => () => { if (pressTimerRef.current) clearTimeout(pressTimerRef.current); }, []);

  if (maxOffset === 0) return null;
  const content = Children.toArray(children)[0];
  if (!content) return null;

  // Pointer events cover touch/pen/mouse on real browsers; mouse handlers are kept alongside as
  // a fallback for environments (e.g. jsdom) without a PointerEvent implementation.
  const onPointerDown = (e: ReactPointerEvent<HTMLDivElement> | ReactMouseEvent<HTMLDivElement>) => {
    dragRef.current = { startX: e.clientX, startOffset: offset };
  };
  const onPointerMove = (e: ReactPointerEvent<HTMLDivElement> | ReactMouseEvent<HTMLDivElement>) => {
    if (!dragRef.current) return;
    const delta = e.clientX - dragRef.current.startX;
    setOffset(Math.min(0, Math.max(clampMin, dragRef.current.startOffset + delta)));
  };
  const onPointerUp = () => {
    if (!dragRef.current) return;
    const wasDragging = dragRef.current;
    dragRef.current = null;
    // Swiping all the way runs the first action when fullSwipe is set.
    if (fullSwipe && actions.length && -offset > maxOffset * 1.4) {
      onAction?.(actions[0].value);
      setOffset(0);
      return;
    }
    setOffset(-offset > maxOffset / 2 ? -maxOffset : 0);
    void wasDragging;
  };

  const onLongPressStart = () => {
    pressTimerRef.current = setTimeout(() => setOffset((o) => (o === 0 ? -maxOffset : 0)), 500);
  };
  const clearLongPress = () => { if (pressTimerRef.current) clearTimeout(pressTimerRef.current); };

  return (
    <div
      ref={containerRef}
      style={{ position: 'relative', overflow: 'hidden' }}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onPointerCancel={onPointerUp}
      onMouseDown={onPointerDown}
      onMouseMove={onPointerMove}
      onMouseUp={onPointerUp}
    >
      {/* The same actions are reachable without swiping via a long press, which reveals the same
          labelled action buttons instead of only via a swipe gesture. */}
      <div
        aria-hidden={offset === 0}
        style={{ position: 'absolute', inset: 0, display: 'flex', justifyContent: 'flex-end', pointerEvents: offset === 0 ? 'none' : 'auto' }}
      >
        {actions.map((action) => (
          <button
            key={action.value}
            type="button"
            aria-label={action.label}
            onClick={() => { onAction?.(action.value); setOffset(0); }}
            style={{
              width: ACTION_WIDTH, border: 0, background: TONE_COLOR[action.tone ?? 'neutral'], color: tokens.color.surface,
              display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: sp(1), cursor: 'pointer',
            }}
          >
            {action.icon && <Icon name={action.icon} size="sm" color="inherit" />}
            <span style={{ fontSize: 12 }}>{action.label}</span>
          </button>
        ))}
      </div>
      <div
        onPointerDown={onLongPressStart}
        onPointerUp={clearLongPress}
        onPointerLeave={clearLongPress}
        onMouseDown={onLongPressStart}
        onMouseUp={clearLongPress}
        onMouseLeave={clearLongPress}
        style={{ transform: `translateX(${offset}px)`, background: tokens.color.surface, position: 'relative' }}
      >
        {content}
      </div>
    </div>
  );
}
