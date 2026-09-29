import { tokens, sp } from './tokens';
import { Button } from './Button';
export interface EmptyStateProps { title: string; description?: string; icon?: string; actionLabel?: string; onAction?: () => void }
export function EmptyState({ title, description, icon, actionLabel, onAction }: EmptyStateProps) {
  return (
    <div style={{ minHeight: 240, display: 'grid', placeItems: 'center', textAlign: 'center', padding: sp(5) }}>
      <div style={{ display: 'grid', gap: sp(2), justifyItems: 'center' }}>
        {icon && <span aria-hidden data-icon={icon} />}
        <div style={{ fontSize: 18, fontWeight: 700, color: tokens.color.text }}>{title}</div>
        {description && <div style={{ color: tokens.color.muted }}>{description}</div>}
        {actionLabel && <Button label={actionLabel} onPress={onAction} />}
      </div>
    </div>
  );
}
