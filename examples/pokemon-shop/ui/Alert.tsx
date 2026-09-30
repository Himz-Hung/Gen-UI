import { tokens, sp, alpha } from './tokens';
export interface AlertProps { tone?: 'info' | 'success' | 'warning' | 'danger'; title: string; description?: string; dismissible?: boolean; onDismiss?: () => void }
const BG = { info: alpha(tokens.color.secondary, 0.12), success: alpha(tokens.color.success, 0.12), warning: alpha(tokens.color.warning, 0.12), danger: alpha(tokens.color.danger, 0.12) } as const;
const FG = { info: tokens.color.secondary, success: tokens.color.success, warning: tokens.color.warning, danger: tokens.color.danger } as const;
const ICON = { info: 'ℹ', success: '✓', warning: '!', danger: '✕' } as const;
export function Alert({ tone = 'info', title, description, dismissible = false, onDismiss }: AlertProps) {
  return (
    <div role={tone === 'danger' || tone === 'warning' ? 'alert' : 'status'} style={{ display: 'flex', gap: sp(3), padding: sp(4), borderRadius: tokens.radius.md, background: BG[tone], color: FG[tone], width: '100%', boxSizing: 'border-box' }}>
      <span aria-hidden style={{ fontWeight: 700 }}>{ICON[tone]}</span>
      <div style={{ flex: 1 }}>
        <div style={{ fontWeight: 700 }}>{title}</div>
        {description && <div style={{ color: tokens.color.text, marginTop: 4 }}>{description}</div>}
      </div>
      {dismissible && <button type="button" aria-label="Dismiss" onClick={onDismiss} style={{ background: 'none', border: 0, cursor: 'pointer', color: 'inherit' }}>×</button>}
    </div>
  );
}
