import { tokens, sp } from './tokens';
export interface IconButtonProps { icon: string; label: string; variant?: 'ghost' | 'secondary'; size?: 'sm' | 'md' | 'lg'; disabled?: boolean; badge?: string; onPress?: () => void }
const SIZE = { sm: 32, md: 40, lg: 48 } as const;
export function IconButton({ icon, label, variant = 'ghost', size = 'md', disabled = false, badge, onPress }: IconButtonProps) {
  // The badge is part of the accessible name and never changes the button size.
  const count = badge && /^\d+$/.test(badge) && Number(badge) > 99 ? '99+' : badge;
  const name = badge === undefined ? label : badge === '' ? `${label}, new` : `${label}, ${count}`;
  return (
    <button type="button" aria-label={name} title={label} disabled={disabled} onClick={disabled ? undefined : onPress}
      style={{ position: 'relative', width: SIZE[size], height: SIZE[size], borderRadius: tokens.radius.md, display: 'inline-grid', placeItems: 'center', padding: 0,
        background: 'transparent', border: variant === 'secondary' ? `1px solid ${tokens.color.muted}` : '1px solid transparent', cursor: disabled ? 'not-allowed' : 'pointer', opacity: disabled ? 0.5 : 1, margin: sp(0) }}>
      <span aria-hidden data-icon={icon} />
      {badge !== undefined && (
        <span aria-hidden style={{ position: 'absolute', top: 2, right: 2, minWidth: badge === '' ? 8 : 16, height: badge === '' ? 8 : 16, padding: badge === '' ? 0 : '0 4px',
          borderRadius: tokens.radius.full, background: tokens.color.danger, color: tokens.color.surface, fontSize: 10, lineHeight: '16px', fontWeight: 700 }}>{count}</span>
      )}
    </button>
  );
}
