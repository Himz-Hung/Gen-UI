import { tokens, sp } from './tokens';
export interface InputProps { label: string; value: string; placeholder?: string; type?: 'text' | 'email' | 'password' | 'number' | 'tel'; hint?: string; error?: string; disabled?: boolean; required?: boolean; onChange?: (value: string) => void; onSubmit?: () => void }
export function Input({ label, value, placeholder, type = 'text', hint, error, disabled = false, required = false, onChange, onSubmit }: InputProps) {
  const id = `in-${label.replace(/\W+/g, '-').toLowerCase()}`;
  const msgId = `${id}-msg`;
  return (
    <div style={{ display: 'grid', gap: sp(1) }}>
      <label htmlFor={id} style={{ fontSize: 13, color: tokens.color.text }}>{label}{required && <span aria-hidden style={{ color: tokens.color.danger }}> *</span>}</label>
      <input id={id} type={type} value={value} placeholder={placeholder} disabled={disabled} required={required}
        aria-invalid={!!error || undefined} aria-describedby={error || hint ? msgId : undefined}
        onChange={(e) => onChange?.(e.target.value)} onKeyDown={(e) => { if (e.key === 'Enter') onSubmit?.(); }}
        style={{ height: 40, borderRadius: tokens.radius.md, border: `1px solid ${error ? tokens.color.danger : tokens.color.muted}`, padding: `0 ${sp(3)}`, font: 'inherit', background: tokens.color.surface }} />
      {(error || hint) && <div id={msgId} role={error ? 'alert' : undefined} style={{ fontSize: 12, color: error ? tokens.color.danger : tokens.color.muted }}>{error || hint}</div>}
    </div>
  );
}
