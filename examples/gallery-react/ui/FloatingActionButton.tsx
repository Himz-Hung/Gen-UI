import type { CSSProperties } from 'react';
import { tokens, sp, font } from './tokens';

export interface FloatingActionButtonProps {
  label: string;
  icon: string;
  extended?: boolean;
  position?: 'end' | 'center' | 'start';
  size?: 'sm' | 'md';
  disabled?: boolean;
  onPress?: () => void;
}

const SIZE = { sm: 40, md: 56 } as const;

export function FloatingActionButton({ label, icon, extended = false, position = 'end', size = 'md', disabled = false, onPress }: FloatingActionButtonProps) {
  const height = extended ? 56 : SIZE[size];
  const HORIZONTAL: Record<NonNullable<FloatingActionButtonProps['position']>, CSSProperties> = {
    end: { right: `calc(${sp(5)} + env(safe-area-inset-right))` },
    start: { left: `calc(${sp(5)} + env(safe-area-inset-left))` },
    center: { left: '50%', transform: 'translateX(-50%)' },
  };
  return (
    // Lifted out of the flow: fixed at the bottom corner, inside the safe area, never taking
    // space where the screen places it.
    <button
      type="button"
      aria-label={label}
      title={label}
      disabled={disabled}
      onClick={disabled ? undefined : onPress}
      style={{
        position: 'fixed',
        bottom: `calc(${sp(5)} + env(safe-area-inset-bottom))`,
        ...HORIZONTAL[position],
        height,
        width: extended ? undefined : height,
        padding: extended ? `0 ${sp(4)}` : 0,
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: sp(2),
        background: disabled ? tokens.color.muted : tokens.color.primary,
        color: tokens.color.surface,
        border: 'none',
        borderRadius: tokens.radius.lg,
        cursor: disabled ? 'not-allowed' : 'pointer',
        opacity: disabled ? 0.6 : 1,
        boxShadow: '0 4px 12px rgba(0,0,0,0.18)',
        zIndex: 40,
        fontFamily: font('body'),
        fontWeight: 600,
        fontSize: 15,
      }}
    >
      <span aria-hidden data-icon={icon} />
      {extended && <span>{label}</span>}
    </button>
  );
}
