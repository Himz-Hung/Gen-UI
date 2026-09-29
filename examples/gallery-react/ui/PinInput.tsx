import { useRef, useState } from 'react';
import { tokens, sp } from './tokens';

export interface PinInputProps {
  label: string;
  value: string;
  length?: number;
  type?: 'numeric' | 'alphanumeric';
  mask?: boolean;
  error?: string;
  disabled?: boolean;
  onChange?: (value: string) => void;
  onComplete?: (value: string) => void;
}

export function PinInput({ label, value, length = 6, type = 'numeric', mask = false, error, disabled = false, onChange, onComplete }: PinInputProps) {
  const id = `pi-${label.replace(/\W+/g, '-').toLowerCase()}`;
  const inputRef = useRef<HTMLInputElement>(null);
  const [focused, setFocused] = useState(false);

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    let next = e.target.value;
    next = type === 'numeric' ? next.replace(/\D/g, '') : next.replace(/[^A-Za-z0-9]/g, '');
    next = next.slice(0, length);
    onChange?.(next);
    // All boxes filled, whether typed one at a time or pasted in one shot.
    if (next.length === length) onComplete?.(next);
  }

  return (
    <div style={{ display: 'grid', gap: sp(1) }}>
      <label htmlFor={id} style={{ fontSize: 13, fontWeight: 600, color: tokens.color.text }}>{label}</label>
      <div style={{ position: 'relative', display: 'inline-block' }} onClick={() => inputRef.current?.focus()}>
        <div aria-hidden style={{ display: 'flex', gap: sp(2), opacity: disabled ? 0.5 : 1 }}>
          {Array.from({ length }, (_, i) => {
            const char = value[i] ?? '';
            const isCursor = focused && i === value.length;
            const borderColor = error ? tokens.color.danger : isCursor ? tokens.color.primary : tokens.color.muted;
            return (
              <div key={i} style={{ width: 44, height: 52, display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: tokens.radius.md, border: `${isCursor ? 2 : 1}px solid ${borderColor}`, fontSize: 20, fontWeight: 600, color: tokens.color.text }}>
                {char ? (mask ? '•' : char) : ''}
              </div>
            );
          })}
        </div>
        {/* Exposed as one field named by label that accepts the whole code, drawn as boxes above it. */}
        <input
          ref={inputRef}
          id={id}
          type="text"
          inputMode={type === 'numeric' ? 'numeric' : 'text'}
          autoComplete="one-time-code"
          maxLength={length}
          value={value}
          disabled={disabled}
          aria-label={label}
          aria-invalid={!!error || undefined}
          onChange={handleChange}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', opacity: 0, border: 'none', padding: 0, cursor: disabled ? 'not-allowed' : 'text' }}
        />
      </div>
      {error && <div role="alert" style={{ fontSize: 12, color: tokens.color.danger }}>{error}</div>}
    </div>
  );
}
