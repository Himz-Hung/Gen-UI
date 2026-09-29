import { useEffect, useRef } from 'react';
import { tokens, sp } from './tokens';

export interface TextareaProps {
  label: string;
  value: string;
  placeholder?: string;
  rows?: number;
  autoGrow?: boolean;
  maxLength?: number;
  hint?: string;
  error?: string;
  disabled?: boolean;
  required?: boolean;
  onChange?: (value: string) => void;
}

export function Textarea({ label, value, placeholder, rows = 3, autoGrow = false, maxLength, hint, error, disabled = false, required = false, onChange }: TextareaProps) {
  const id = `ta-${label.replace(/\W+/g, '-').toLowerCase()}`;
  const msgId = `${id}-msg`;
  const countId = `${id}-count`;
  const ref = useRef<HTMLTextAreaElement>(null);

  // autoGrow: grow with the content up to 10 lines, then scroll.
  useEffect(() => {
    if (!autoGrow || !ref.current) return;
    const el = ref.current;
    const lineHeight = parseFloat(getComputedStyle(el).lineHeight || '20') || 20;
    el.style.height = 'auto';
    el.style.height = `${Math.min(el.scrollHeight, lineHeight * 10)}px`;
  }, [value, autoGrow]);

  const describedBy = [error || hint ? msgId : null, maxLength != null ? countId : null].filter(Boolean).join(' ') || undefined;

  return (
    <div style={{ display: 'grid', gap: sp(1) }}>
      <label htmlFor={id} style={{ fontSize: 13, color: tokens.color.text }}>{label}{required && <span aria-hidden style={{ color: tokens.color.danger }}> *</span>}</label>
      <textarea
        ref={ref}
        id={id}
        value={value}
        placeholder={placeholder}
        rows={rows}
        maxLength={maxLength}
        disabled={disabled}
        required={required}
        aria-invalid={!!error || undefined}
        aria-describedby={describedBy}
        // Enter always inserts a new line; textarea never submits on its own.
        onChange={(e) => onChange?.(e.target.value)}
        style={{ width: '100%', boxSizing: 'border-box', resize: autoGrow ? 'none' : 'vertical', borderRadius: tokens.radius.md, border: `1px solid ${error ? tokens.color.danger : tokens.color.muted}`, padding: `${sp(2)} ${sp(3)}`, font: 'inherit', background: tokens.color.surface }}
      />
      {maxLength != null && (
        <div id={countId} aria-live="polite" style={{ fontSize: 12, color: tokens.color.muted }}>{value.length} / {maxLength}</div>
      )}
      {(error || hint) && <div id={msgId} role={error ? 'alert' : undefined} style={{ fontSize: 12, color: error ? tokens.color.danger : tokens.color.muted }}>{error || hint}</div>}
    </div>
  );
}
