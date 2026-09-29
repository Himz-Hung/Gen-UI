import { useState } from 'react';
import { tokens, sp } from './tokens';
export interface InputProps { label: string; value: string; placeholder?: string; type?: 'text' | 'email' | 'password' | 'number' | 'tel'; hint?: string; error?: string; disabled?: boolean; required?: boolean; revealLabel?: string; onChange?: (value: string) => void; onSubmit?: () => void }
export function Input({ label, value, placeholder, type = 'text', hint, error, disabled = false, required = false, revealLabel, onChange, onSubmit }: InputProps) {
  const id = `in-${label.replace(/\W+/g, '-').toLowerCase()}`;
  const msgId = `${id}-msg`;
  // type=password: a show / hide toggle; it never submits and never takes focus away from the field.
  const [revealed, setRevealed] = useState(false);
  const password = type === 'password';
  return (
    <div style={{ display: 'grid', gap: sp(1) }}>
      <label htmlFor={id} style={{ fontSize: 13, color: tokens.color.text }}>{label}{required && <span aria-hidden style={{ color: tokens.color.danger }}> *</span>}</label>
      <div style={{ position: 'relative' }}>
        <input id={id} type={password && revealed ? 'text' : type} value={value} placeholder={placeholder} disabled={disabled} required={required}
          aria-invalid={!!error || undefined} aria-describedby={error || hint ? msgId : undefined}
          onChange={(e) => onChange?.(e.target.value)} onKeyDown={(e) => { if (e.key === 'Enter') onSubmit?.(); }}
          style={{ width: '100%', boxSizing: 'border-box', height: 40, borderRadius: tokens.radius.md, border: `1px solid ${error ? tokens.color.danger : tokens.color.muted}`, padding: `0 ${password ? 40 : 12}px 0 ${sp(3)}`, font: 'inherit', background: tokens.color.surface }} />
        {password && (
          <button type="button" aria-label={revealLabel ?? label} aria-pressed={revealed} disabled={disabled}
            onMouseDown={(e) => e.preventDefault()} onClick={() => setRevealed((r) => !r)}
            style={{ position: 'absolute', right: 4, top: 4, width: 32, height: 32, border: 'none', background: 'transparent', cursor: 'pointer', color: tokens.color.muted }}>
            <span aria-hidden>{revealed ? '🙈' : '👁'}</span>
          </button>
        )}
      </div>
      {(error || hint) && <div id={msgId} role={error ? 'alert' : undefined} style={{ fontSize: 12, color: error ? tokens.color.danger : tokens.color.muted }}>{error || hint}</div>}
    </div>
  );
}
