import { tokens, sp, font } from './tokens';

export interface CheckboxProps {
  label: string;
  checked: boolean;
  disabled?: boolean;
  onChange?: (value: boolean) => void;
}

export function Checkbox({ label, checked, disabled = false, onChange }: CheckboxProps) {
  return (
    // Pressing the label toggles the box (native <label>/<input> association); role checkbox
    // named by label comes for free from the same association.
    <label
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: sp(2),
        paddingTop: sp(1),
        paddingBottom: sp(1),
        cursor: disabled ? 'not-allowed' : 'pointer',
        color: disabled ? tokens.color.muted : tokens.color.text,
        fontFamily: font('body'),
        fontSize: 15,
      }}
    >
      <input
        type="checkbox"
        checked={checked}
        disabled={disabled}
        onChange={(e) => onChange?.(e.target.checked)}
        style={{ width: 20, height: 20, margin: 0, accentColor: tokens.color.primary, cursor: disabled ? 'not-allowed' : 'pointer' }}
      />
      <span>{label}</span>
    </label>
  );
}
