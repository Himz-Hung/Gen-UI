import { Children, cloneElement, isValidElement, useEffect, useId, useRef, useState, type ReactNode } from 'react';
import { tokens, sp, font } from './tokens';

export interface TooltipProps {
  text: string;
  placement?: 'top' | 'bottom' | 'start' | 'end';
  children?: ReactNode;
}

const SHOW_DELAY = 400;
const LONG_PRESS_DELAY = 500;

export function Tooltip({ text, placement = 'top', children }: TooltipProps) {
  const [visible, setVisible] = useState(false);
  const [actualPlacement, setActualPlacement] = useState(placement);
  const showTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const pressTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const wrapRef = useRef<HTMLSpanElement | null>(null);
  const id = useId();

  useEffect(() => setActualPlacement(placement), [placement]);

  const clearShowTimer = () => { if (showTimer.current !== null) { clearTimeout(showTimer.current); showTimer.current = null; } };
  const clearPressTimer = () => { if (pressTimer.current !== null) { clearTimeout(pressTimer.current); pressTimer.current = null; } };

  const flip = () => {
    const el = wrapRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    let next = placement;
    if (placement === 'top' && rect.top < 40) next = 'bottom';
    else if (placement === 'bottom' && window.innerHeight - rect.bottom < 40) next = 'top';
    else if (placement === 'start' && rect.left < 80) next = 'end';
    else if (placement === 'end' && window.innerWidth - rect.right < 80) next = 'start';
    setActualPlacement(next);
  };

  const show = () => {
    clearShowTimer();
    showTimer.current = setTimeout(() => { flip(); setVisible(true); }, SHOW_DELAY);
  };
  const showNow = () => { flip(); setVisible(true); };
  const hide = () => { clearShowTimer(); clearPressTimer(); setVisible(false); };

  useEffect(() => {
    if (!visible) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') hide(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [visible]);

  const kids = Children.toArray(children);
  const trigger = kids[0];

  const handlers = {
    onMouseEnter: show,
    onMouseLeave: hide,
    onFocus: show,
    onBlur: hide,
    onTouchStart: () => { clearPressTimer(); pressTimer.current = setTimeout(showNow, LONG_PRESS_DELAY); },
    onTouchEnd: hide,
  };

  const triggerNode = isValidElement(trigger)
    ? cloneElement(trigger as React.ReactElement<any>, { 'aria-describedby': visible ? id : undefined })
    : trigger;

  const pos: Record<string, React.CSSProperties> = {
    top: { bottom: '100%', left: '50%', transform: 'translateX(-50%)', marginBottom: 6 },
    bottom: { top: '100%', left: '50%', transform: 'translateX(-50%)', marginTop: 6 },
    start: { right: '100%', top: '50%', transform: 'translateY(-50%)', marginRight: 6 },
    end: { left: '100%', top: '50%', transform: 'translateY(-50%)', marginLeft: 6 },
  };

  return (
    <span ref={wrapRef} style={{ position: 'relative', display: 'inline-block' }} {...handlers}>
      {triggerNode}
      {visible && (
        <span
          id={id}
          role="tooltip"
          style={{
            position: 'absolute', zIndex: 1000, maxWidth: 220, padding: `${sp(1)} ${sp(2)}`,
            background: tokens.color.text, color: tokens.color.surface, borderRadius: tokens.radius.sm,
            fontFamily: font('body'), fontSize: 12, lineHeight: 1.4, whiteSpace: 'normal', pointerEvents: 'none',
            ...pos[actualPlacement],
          }}
        >
          {text}
        </span>
      )}
    </span>
  );
}
