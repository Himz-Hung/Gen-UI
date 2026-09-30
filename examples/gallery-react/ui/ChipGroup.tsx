import { tokens, sp, alpha } from './tokens';

export interface ChipGroupOption { value: string; label: string; icon?: string; disabled?: boolean }

export interface ChipGroupProps {
  label: string;
  options: ChipGroupOption[];
  value: string[];
  multiple?: boolean;
  size?: 'sm' | 'md';
  wrap?: boolean;
  onChange?: (value: string[]) => void;
}

export function ChipGroup({ label, options, value, multiple = true, size = 'md', wrap = true, onChange }: ChipGroupProps) {
  const height = size === 'sm' ? 28 : 32;

  function toggle(o: ChipGroupOption) {
    const selected = value.includes(o.value);
    if (multiple) {
      onChange?.(selected ? value.filter((v) => v !== o.value) : [...value, o.value]);
    } else {
      // false: at most one selected, pressing it again clears it.
      onChange?.(selected ? [] : [o.value]);
    }
  }

  return (
    <div role="group" aria-label={label} style={{ display: 'flex', flexWrap: wrap ? 'wrap' : 'nowrap', overflowX: wrap ? undefined : 'auto', gap: sp(2) }}>
      {options.map((o) => {
        const selected = value.includes(o.value);
        const disabled = !!o.disabled;
        return (
          <button
            key={o.value}
            type="button"
            aria-pressed={selected}
            disabled={disabled}
            onClick={() => toggle(o)}
            style={{ height, flexShrink: 0, display: 'inline-flex', alignItems: 'center', gap: sp(1), padding: `0 ${sp(2)}`, borderRadius: tokens.radius.full, border: `1px solid ${selected ? tokens.color.primary : tokens.color.muted}`, background: selected ? alpha(tokens.color.primary, 0.15) : 'transparent', color: disabled ? tokens.color.muted : tokens.color.text, cursor: disabled ? 'not-allowed' : 'pointer', fontSize: size === 'sm' ? 12 : 13 }}
          >
            {selected && <span aria-hidden>✓</span>}
            {o.label}
          </button>
        );
      })}
    </div>
  );
}
