import { tokens, sp } from './tokens';
export interface IconButtonProps { icon: string; label: string; variant?: 'ghost' | 'secondary'; size?: 'sm' | 'md' | 'lg'; disabled?: boolean; onPress?: () => void }
const SIZE = { sm: 32, md: 40, lg: 48 } as const;
export function IconButton({ icon, label, variant = 'ghost', size = 'md', disabled = false, onPress }: IconButtonProps) {
  return (
    <button type="button" aria-label={label} title={label} disabled={disabled} onClick={disabled ? undefined : onPress}
      style={{ width: SIZE[size], height: SIZE[size], borderRadius: tokens.radius.md, display: 'inline-grid', placeItems: 'center', padding: 0,
        background: 'transparent', border: variant === 'secondary' ? `1px solid ${tokens.color.muted}` : '1px solid transparent', cursor: disabled ? 'not-allowed' : 'pointer', opacity: disabled ? 0.5 : 1, margin: sp(0) }}>
      <span aria-hidden data-icon={icon} />
    </button>
  );
}
