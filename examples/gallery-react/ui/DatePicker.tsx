import { tokens, sp } from './tokens';

export interface DatePickerProps {
  label: string;
  value: string;
  min?: string;
  max?: string;
  placeholder?: string;
  hint?: string;
  error?: string;
  disabled?: boolean;
  onChange?: (value: string) => void;
}

export function DatePicker({ label, value, min, max, placeholder, hint, error, disabled = false, onChange }: DatePickerProps) {
  const id = `dp-${label.replace(/\W+/g, '-').toLowerCase()}`;
  const msgId = `${id}-msg`;
  return (
    <div style={{ display: 'grid', gap: sp(1) }}>
      <label htmlFor={id} style={{ fontSize: 13, fontWeight: 600, color: tokens.color.text }}>{label}</label>
      {/* value / min / max / change all stay ISO (YYYY-MM-DD); the browser shows the date in the user's locale. */}
      <input
        id={id}
        type="date"
        value={value}
        min={min}
        max={max}
        placeholder={placeholder}
        disabled={disabled}
        aria-invalid={!!error || undefined}
        aria-describedby={error || hint ? msgId : undefined}
        onChange={(e) => onChange?.(e.target.value)}
        style={{ width: '100%', boxSizing: 'border-box', height: 40, borderRadius: tokens.radius.md, border: `1px solid ${error ? tokens.color.danger : tokens.color.muted}`, padding: `0 ${sp(3)}`, font: 'inherit', background: tokens.color.surface }}
      />
      {(error || hint) && <div id={msgId} role={error ? 'alert' : undefined} style={{ fontSize: 12, color: error ? tokens.color.danger : tokens.color.muted }}>{error || hint}</div>}
    </div>
  );
}
