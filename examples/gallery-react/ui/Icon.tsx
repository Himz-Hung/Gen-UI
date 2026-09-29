import { tokens } from './tokens';
import { ICONS, DEFAULT_ICON } from './icons';

export interface IconProps {
  name: string;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  color?: 'inherit' | 'primary' | 'muted' | 'success' | 'warning' | 'danger';
  label?: string;
}

const SIZE = { xs: 12, sm: 16, md: 20, lg: 24, xl: 32 } as const;
const COLOR: Record<NonNullable<IconProps['color']>, string | undefined> = {
  inherit: undefined,
  primary: tokens.color.primary,
  muted: tokens.color.muted,
  success: tokens.color.success,
  warning: tokens.color.warning,
  danger: tokens.color.danger,
};

export function Icon({ name, size = 'md', color = 'inherit', label }: IconProps) {
  const dim = SIZE[size];
  const glyph = ICONS[name] ?? DEFAULT_ICON;
  const outline = glyph.filled === false;
  return (
    <svg
      width={dim}
      height={dim}
      viewBox="0 0 24 24"
      focusable="false"
      role={label ? 'img' : undefined}
      aria-hidden={label ? undefined : true}
      aria-label={label}
      style={{ color: COLOR[color], flex: '0 0 auto', display: 'inline-block' }}
    >
      <path d={glyph.d} fill={outline ? 'none' : 'currentColor'} stroke={outline ? 'currentColor' : 'none'} strokeWidth={outline ? 1.5 : undefined} strokeLinejoin="round" strokeLinecap="round" />
    </svg>
  );
}
