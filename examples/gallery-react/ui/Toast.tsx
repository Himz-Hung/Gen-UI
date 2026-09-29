import { useEffect, useRef } from 'react';
import { tokens, sp, font } from './tokens';

export interface ToastProps {
  open: boolean;
  message: string;
  tone?: 'info' | 'success' | 'warning' | 'danger';
  actionLabel?: string;
  duration?: number;
  onClose?: () => void;
  onAction?: () => void;
}

const TONE_COLOR = {
  info: tokens.color.primary,
  success: tokens.color.success,
  warning: tokens.color.warning,
  danger: tokens.color.danger,
} as const;

const TONE_ICON = {
  info: 'info',
  success: 'success',
  warning: 'warning',
  danger: 'error',
} as const;

export function Toast({ open, message, tone = 'info', actionLabel, duration = 4000, onClose, onAction }: ToastProps) {
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const pausedRef = useRef(false);
  const remainingRef = useRef(duration);
  const startedAtRef = useRef(0);
  const onCloseRef = useRef(onClose);
  onCloseRef.current = onClose;

  const clear = () => {
    if (timerRef.current !== null) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  };

  const start = (ms: number) => {
    clear();
    if (ms <= 0) return;
    startedAtRef.current = Date.now();
    timerRef.current = setTimeout(() => {
      timerRef.current = null;
      onCloseRef.current?.();
    }, ms);
  };

  useEffect(() => {
    pausedRef.current = false;
    remainingRef.current = duration;
    if (open && duration > 0) {
      start(duration);
    } else {
      clear();
    }
    return clear;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, duration, message]);

  const pause = () => {
    if (!open || duration <= 0 || pausedRef.current) return;
    pausedRef.current = true;
    const elapsed = Date.now() - startedAtRef.current;
    remainingRef.current = Math.max(0, remainingRef.current - elapsed);
    clear();
  };

  const resume = () => {
    if (!open || duration <= 0 || !pausedRef.current) return;
    pausedRef.current = false;
    start(remainingRef.current);
  };

  if (!open) return null;

  return (
    <div
      style={{ position: 'fixed', left: 0, right: 0, bottom: sp(4), display: 'flex', justifyContent: 'center', zIndex: 1000, pointerEvents: 'none' }}
    >
      <div
        role="status"
        aria-live={tone === 'danger' ? 'assertive' : 'polite'}
        onMouseEnter={pause}
        onMouseLeave={resume}
        onFocus={pause}
        onBlur={resume}
        style={{
          pointerEvents: 'auto', display: 'flex', alignItems: 'center', gap: sp(3), maxWidth: 480,
          background: tokens.color.text, color: tokens.color.surface, borderRadius: tokens.radius.md,
          padding: `${sp(3)} ${sp(4)}`, fontFamily: font('body'), boxShadow: '0 4px 12px rgba(0,0,0,0.2)',
        }}
      >
        <span aria-hidden data-icon={TONE_ICON[tone]} style={{ color: TONE_COLOR[tone] }} />
        <span style={{ flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{message}</span>
        {actionLabel && (
          <button type="button" onClick={onAction} style={{ background: 'none', border: 'none', color: tokens.color.primary, fontWeight: 600, cursor: 'pointer', padding: 0 }}>
            {actionLabel}
          </button>
        )}
        <button
          type="button"
          aria-label="Close"
          onClick={onClose}
          style={{ background: 'none', border: 'none', color: tokens.color.surface, cursor: 'pointer', padding: sp(1), display: 'inline-flex' }}
        >
          <span aria-hidden data-icon="close" />
        </button>
      </div>
    </div>
  );
}
