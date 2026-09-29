import { useId } from 'react';
import { tokens, sp } from './tokens';

export interface RadioGroupOption { value: string; label: string; description?: string; disabled?: boolean }

export interface RadioGroupProps {
  label: string;
  value: string;
  options: RadioGroupOption[];
  direction?: 'vertical' | 'horizontal';
  disabled?: boolean;
  error?: string;
  onChange?: (value: string) => void;
}

export function RadioGroup({ label, value, options, direction = 'vertical', disabled = false, error, onChange }: RadioGroupProps) {
  const name = useId();
  const errId = `${name}-err`;
  return (
    <div role="radiogroup" aria-label={label} aria-describedby={error ? errId : undefined} style={{ display: 'grid', gap: sp(1) }}>
      <div style={{ fontSize: 13, fontWeight: 600, color: tokens.color.text }}>{label}</div>
      <div style={{ display: 'flex', flexDirection: direction === 'horizontal' ? 'row' : 'column', flexWrap: direction === 'horizontal' ? 'wrap' : 'nowrap', gap: direction === 'horizontal' ? sp(3) : sp(1) }}>
        {options.map((o) => {
          // Pressing an option's label or description selects it too (native <label> wrapping).
          const optDisabled = disabled || !!o.disabled;
          const selected = value === o.value;
          return (
            <label key={o.value} style={{ display: 'flex', alignItems: 'center', gap: sp(2), padding: `${sp(1)} 0`, cursor: optDisabled ? 'not-allowed' : 'pointer' }}>
              <input
                type="radio"
                name={name}
                value={o.value}
                checked={selected}
                disabled={optDisabled}
                onChange={() => onChange?.(o.value)}
                style={{ width: 20, height: 20, accentColor: tokens.color.primary }}
              />
              <span style={{ display: 'grid' }}>
                <span style={{ color: optDisabled ? tokens.color.muted : tokens.color.text }}>{o.label}</span>
                {o.description && <span style={{ color: tokens.color.muted, fontSize: 12 }}>{o.description}</span>}
              </span>
            </label>
          );
        })}
      </div>
      {error && <div id={errId} role="alert" style={{ fontSize: 12, color: tokens.color.danger }}>{error}</div>}
    </div>
  );
}
