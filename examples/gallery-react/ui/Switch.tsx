import { useId } from 'react';
import { tokens, sp } from './tokens';

export interface SwitchProps {
  label: string;
  checked: boolean;
  description?: string;
  disabled?: boolean;
  onChange?: (value: boolean) => void;
}

export function Switch({ label, checked, description, disabled = false, onChange }: SwitchProps) {
  const descId = useId();
  return (
    // Whole row is one <button role="switch">; label leads, switch trails; pressing the label toggles it too.
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      aria-describedby={description ? descId : undefined}
      disabled={disabled}
      onClick={() => onChange?.(!checked)}
      style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: sp(3), width: '100%', background: 'transparent', border: 'none', padding: `${sp(1)} 0`, textAlign: 'left', cursor: disabled ? 'not-allowed' : 'pointer', opacity: disabled ? 0.5 : 1 }}
    >
      <span style={{ display: 'grid' }}>
        <span aria-hidden style={{ color: tokens.color.text, fontWeight: 600 }}>{label}</span>
        {description && <span id={descId} style={{ color: tokens.color.muted, fontSize: 12 }}>{description}</span>}
      </span>
      <span aria-hidden style={{ position: 'relative', width: 44, height: 24, borderRadius: tokens.radius.full, background: checked ? tokens.color.primary : tokens.color.muted, flexShrink: 0 }}>
        <span style={{ position: 'absolute', top: 2, left: checked ? 22 : 2, width: 20, height: 20, borderRadius: tokens.radius.full, background: '#fff' }} />
      </span>
    </button>
  );
}
