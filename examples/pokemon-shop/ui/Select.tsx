import { tokens, sp } from './tokens';
export interface SelectProps { label: string; value: string; options: { value: string; label: string }[]; placeholder?: string; disabled?: boolean; error?: string; onChange?: (value: string) => void }
export function Select({ label, value, options, placeholder, disabled = false, error, onChange }: SelectProps) {
  const id = `sel-${label.replace(/\W+/g, '-').toLowerCase()}`;
  const known = options.some((o) => o.value === value);
  return (
    <div style={{ display: 'grid', gap: sp(1) }}>
      <label htmlFor={id} style={{ fontSize: 13, color: tokens.color.text }}>{label}</label>
      <select id={id} value={known ? value : ''} disabled={disabled} aria-invalid={!!error || undefined} onChange={(e) => onChange?.(e.target.value)}
        style={{ height: 40, borderRadius: tokens.radius.md, border: `1px solid ${error ? tokens.color.danger : tokens.color.muted}`, padding: `0 ${sp(3)}` }}>
        {!known && <option value="" disabled>{placeholder ?? ''}</option>}
        {options.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
      </select>
      {error && <div role="alert" style={{ fontSize: 12, color: tokens.color.danger }}>{error}</div>}
    </div>
  );
}
