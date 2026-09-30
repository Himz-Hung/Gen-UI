import { useRef, type KeyboardEvent } from 'react';
import { tokens, sp, font, alpha } from './tokens';

export interface SegmentedControlProps {
  label: string;
  options: { value: string; label: string; icon?: string }[];
  value: string;
  size?: 'sm' | 'md';
  fullWidth?: boolean;
  onChange?: (value: string) => void;
}

const HEIGHT = { sm: 32, md: 40 } as const;

export function SegmentedControl({ label, options, value, size = 'md', fullWidth = false, onChange }: SegmentedControlProps) {
  const refs = useRef<Record<string, HTMLButtonElement | null>>({});

  const move = (from: number, dir: 1 | -1) => {
    if (options.length === 0) return;
    const next = (from + dir + options.length) % options.length;
    const target = options[next];
    refs.current[target.value]?.focus();
    onChange?.(target.value);
  };

  const onKeyDown = (e: KeyboardEvent<HTMLButtonElement>, i: number) => {
    if (e.key === 'ArrowRight' || e.key === 'ArrowDown') { e.preventDefault(); move(i, 1); }
    else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') { e.preventDefault(); move(i, -1); }
  };

  return (
    <div
      role="radiogroup"
      aria-label={label}
      style={{
        display: 'flex', width: fullWidth ? '100%' : undefined, height: HEIGHT[size], padding: 2,
        borderRadius: tokens.radius.md, background: alpha(tokens.color.muted, 0.12), gap: 2, fontFamily: font('body'),
      }}
    >
      {options.map((o, i) => {
        const selected = o.value === value;
        return (
          <button
            key={o.value}
            ref={(el) => { refs.current[o.value] = el; }}
            type="button"
            role="radio"
            aria-checked={selected}
            tabIndex={selected ? 0 : -1}
            onClick={() => onChange?.(o.value)}
            onKeyDown={(e) => onKeyDown(e, i)}
            style={{
              flex: fullWidth ? 1 : undefined, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: sp(1),
              padding: `0 ${sp(3)}`, borderRadius: tokens.radius.sm, border: 'none', cursor: 'pointer',
              background: selected ? tokens.color.surface : 'transparent', boxShadow: selected ? `0 1px 2px ${alpha(tokens.color.shadow, 0.15)}` : 'none',
              color: selected ? tokens.color.text : tokens.color.muted, fontWeight: selected ? 700 : 400,
              fontSize: size === 'sm' ? 13 : 14, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
            }}
          >
            {o.icon && <span aria-hidden data-icon={o.icon} />}
            {o.label}
          </button>
        );
      })}
    </div>
  );
}
