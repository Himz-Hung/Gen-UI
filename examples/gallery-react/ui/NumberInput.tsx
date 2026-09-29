import { useEffect, useState } from 'react';
import { tokens, sp } from './tokens';

export interface NumberInputProps {
  label: string;
  value: number;
  min?: number;
  max?: number;
  step?: number;
  hint?: string;
  error?: string;
  disabled?: boolean;
  onChange?: (value: number) => void;
}

function format(v: number) { return String(v); }
function clamp(v: number, min?: number, max?: number) {
  let r = v;
  if (min != null && r < min) r = min;
  if (max != null && r > max) r = max;
  return r;
}

export function NumberInput({ label, value, min, max, step = 1, hint, error, disabled = false, onChange }: NumberInputProps) {
  const id = `nu-${label.replace(/\W+/g, '-').toLowerCase()}`;
  const msgId = `${id}-msg`;
  const [draft, setDraft] = useState(() => format(value));

  // Sync the draft text when the controlled value changes from outside (not on every keystroke).
  useEffect(() => {
    const parsed = parseFloat(draft);
    if (parsed !== value || draft.trim() === '') setDraft(format(value));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value]);

  const atMin = min != null && value <= min;
  const atMax = max != null && value >= max;

  function step_(delta: number) {
    if (disabled) return;
    const resolved = clamp(value + delta, min, max);
    setDraft(format(resolved));
    onChange?.(resolved);
  }

  function onBlur() {
    const parsed = parseFloat(draft);
    const resolved = clamp(Number.isNaN(parsed) ? value : parsed, min, max);
    setDraft(format(resolved));
    if (resolved !== value) onChange?.(resolved);
  }

  return (
    <div style={{ display: 'grid', gap: sp(1) }}>
      <label htmlFor={id} style={{ fontSize: 13, fontWeight: 600, color: tokens.color.text }}>{label}</label>
      <div style={{ display: 'flex', alignItems: 'center', gap: sp(2) }}>
        <button type="button" aria-label={`Decrease ${label}`} disabled={disabled || atMin} onClick={() => step_(-step)}
          style={{ width: 40, height: 40, borderRadius: tokens.radius.md, border: `1px solid ${tokens.color.muted}`, background: tokens.color.surface, cursor: disabled || atMin ? 'not-allowed' : 'pointer' }}>
          −
        </button>
        <input
          id={id}
          type="text"
          inputMode="decimal"
          role="spinbutton"
          value={draft}
          disabled={disabled}
          aria-valuenow={value}
          aria-valuemin={min}
          aria-valuemax={max}
          aria-invalid={!!error || undefined}
          aria-describedby={error || hint ? msgId : undefined}
          onChange={(e) => {
            const next = e.target.value;
            if (!/^-?\d*\.?\d*$/.test(next)) return;
            setDraft(next);
            const parsed = parseFloat(next);
            if (!Number.isNaN(parsed)) onChange?.(parsed);
          }}
          onBlur={onBlur}
          onKeyDown={(e) => {
            if (e.key === 'ArrowUp') { e.preventDefault(); step_(step); }
            if (e.key === 'ArrowDown') { e.preventDefault(); step_(-step); }
          }}
          style={{ flex: 1, height: 40, boxSizing: 'border-box', textAlign: 'center', borderRadius: tokens.radius.md, border: `1px solid ${error ? tokens.color.danger : tokens.color.muted}`, font: 'inherit', background: tokens.color.surface }}
        />
        <button type="button" aria-label={`Increase ${label}`} disabled={disabled || atMax} onClick={() => step_(step)}
          style={{ width: 40, height: 40, borderRadius: tokens.radius.md, border: `1px solid ${tokens.color.muted}`, background: tokens.color.surface, cursor: disabled || atMax ? 'not-allowed' : 'pointer' }}>
          +
        </button>
      </div>
      {(error || hint) && <div id={msgId} role={error ? 'alert' : undefined} style={{ fontSize: 12, color: error ? tokens.color.danger : tokens.color.muted }}>{error || hint}</div>}
    </div>
  );
}
