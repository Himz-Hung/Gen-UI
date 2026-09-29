import { tokens, sp } from './tokens';

export interface RatingProps {
  label: string;
  value: number;
  max?: number;
  readOnly?: boolean;
  size?: 'sm' | 'md' | 'lg';
  onChange?: (value: number) => void;
}

const ICON_SIZE = { sm: 16, md: 20, lg: 28 } as const;

export function Rating({ label, value, max = 5, readOnly = false, size = 'md', onChange }: RatingProps) {
  const iconSize = ICON_SIZE[size];
  // Filled stars use tokens.color.warning when defined, else tokens.color.primary.
  const fillColor = tokens.color.warning ?? tokens.color.primary;

  if (readOnly) {
    const clamped = Math.min(max, Math.max(0, value));
    const rounded = Math.round(clamped * 2) / 2;
    return (
      <div role="img" aria-label={`${rounded} of ${max}`} style={{ display: 'inline-flex', gap: sp(1) }}>
        {Array.from({ length: max }, (_, idx) => {
          const i = idx + 1;
          const kind = i <= rounded ? 'full' : i - 0.5 === rounded ? 'half' : 'empty';
          return (
            <span key={i} aria-hidden data-star={kind} style={{ fontSize: iconSize, lineHeight: 1, color: kind === 'empty' ? tokens.color.muted : fillColor }}>
              {kind === 'half' ? '◐' : kind === 'full' ? '★' : '☆'}
            </span>
          );
        })}
      </div>
    );
  }

  const selected = Math.round(value);
  return (
    <div style={{ display: 'grid', gap: sp(1) }}>
      <div style={{ fontSize: 13, fontWeight: 600, color: tokens.color.text }}>{label}</div>
      <div role="radiogroup" aria-label={label} style={{ display: 'inline-flex', gap: sp(1) }}>
        {Array.from({ length: max }, (_, idx) => {
          const i = idx + 1;
          const filled = i <= selected;
          return (
            <button
              key={i}
              type="button"
              role="radio"
              aria-checked={selected === i}
              aria-label={`${i} of ${max}`}
              onClick={() => onChange?.(i)}
              style={{ width: 32, height: 32, border: 'none', background: 'transparent', cursor: 'pointer', fontSize: iconSize, lineHeight: 1, color: filled ? fillColor : tokens.color.muted }}
            >
              {filled ? '★' : '☆'}
            </button>
          );
        })}
      </div>
    </div>
  );
}
