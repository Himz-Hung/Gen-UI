import { tokens, sp } from './tokens';
export interface AlertProps { tone?: 'info' | 'success' | 'warning' | 'danger'; title: string; description?: string; dismissible?: boolean; onDismiss?: () => void }
const BG = { info: '#DBEAFE', success: '#DCFCE7', warning: '#FEF3C7', danger: '#FEE2E2' } as const;
const FG = { info: '#1E40AF', success: tokens.color.success, warning: '#92400E', danger: tokens.color.danger } as const;
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
