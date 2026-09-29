import { tokens, sp } from './tokens';

export interface SliderProps {
  label: string;
  value: number;
  min: number;
  max: number;
  step?: number;
  valueLabel?: string;
  disabled?: boolean;
  onChange?: (value: number) => void;
  onCommit?: (value: number) => void;
}

function clampSnap(v: number, min: number, max: number, step: number) {
  const c = Math.min(max, Math.max(min, v));
  if (step <= 0) return c;
  const snapped = min + Math.round((c - min) / step) * step;
  return Math.min(max, Math.max(min, snapped));
}

export function Slider({ label, value, min, max, step = 1, valueLabel, disabled = false, onChange, onCommit }: SliderProps) {
  const id = `sd-${label.replace(/\W+/g, '-').toLowerCase()}`;
  const v = clampSnap(value, min, max, step);
  // Read the element's own value at release time; `value`/`v` may be one render behind
  // if the parent hasn't re-applied the last onChange yet.
  const commit = (e: React.SyntheticEvent<HTMLInputElement>) => onCommit?.(clampSnap(Number(e.currentTarget.value), min, max, step));

  return (
    <div style={{ display: 'grid', gap: sp(1) }}>
      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
        <label htmlFor={id} style={{ fontSize: 13, fontWeight: 600, color: tokens.color.text }}>{label}</label>
        {valueLabel && <span style={{ color: tokens.color.muted }}>{valueLabel}</span>}
      </div>
      <input
        id={id}
        type="range"
        min={min}
        max={max}
        step={step}
        value={v}
        disabled={disabled}
        aria-valuenow={v}
        aria-valuemin={min}
        aria-valuemax={max}
        aria-valuetext={valueLabel ?? String(v)}
        onChange={(e) => onChange?.(clampSnap(Number(e.target.value), min, max, step))}
        onMouseUp={commit}
        onTouchEnd={commit}
        onKeyUp={(e) => { if (['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown', 'PageUp', 'PageDown', 'Home', 'End'].includes(e.key)) commit(e); }}
        style={{ width: '100%', accentColor: tokens.color.primary }}
      />
    </div>
  );
}
