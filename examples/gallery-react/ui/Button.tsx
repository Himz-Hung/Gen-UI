import type { CSSProperties } from 'react';
import { tokens, sp, font } from './tokens';

export interface ButtonProps {
  label: string;
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
  loading?: boolean;
  icon?: string;
  fullWidth?: boolean;
  onPress?: () => void;
}

const HEIGHT = { sm: 32, md: 40, lg: 48 } as const;

export function Button({ label, variant = 'primary', size = 'md', disabled = false, loading = false, icon, fullWidth = false, onPress }: ButtonProps) {
  const inactive = disabled || loading;
  const base: CSSProperties = {
    height: HEIGHT[size], padding: `0 ${sp(size === 'sm' ? 3 : 4)}`, borderRadius: tokens.radius.md,
    fontFamily: font('body'), fontWeight: 500, fontSize: size === 'sm' ? 13 : 15, cursor: inactive ? 'not-allowed' : 'pointer',
    display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: sp(2), width: fullWidth ? '100%' : undefined,
    opacity: disabled ? 0.5 : 1, border: '1px solid transparent', position: 'relative',
  };
  const look: Record<NonNullable<ButtonProps['variant']>, CSSProperties> = {
    primary: { background: tokens.color.primary, color: '#fff' },
    secondary: { background: 'transparent', color: tokens.color.text, borderColor: tokens.color.muted },
    ghost: { background: 'transparent', color: tokens.color.primary },
    danger: { background: tokens.color.danger, color: '#fff' },
  };
  return (
    <button type="button" disabled={inactive} aria-busy={loading || undefined} onClick={inactive ? undefined : onPress} style={{ ...base, ...look[variant] }}>
      {/* label stays in the tree (invisible) so width does not change while loading */}
      <span style={{ visibility: loading ? 'hidden' : 'visible', display: 'inline-flex', gap: sp(2), alignItems: 'center' }}>
        {icon && <span aria-hidden data-icon={icon} />}{label}
      </span>
      {loading && <span role="status" aria-label="Loading" style={{ position: 'absolute' }}>…</span>}
    </button>
  );
}
