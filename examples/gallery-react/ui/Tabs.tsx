import { useRef, type KeyboardEvent, type ReactNode } from 'react';
import { tokens, sp, font } from './tokens';

export interface TabsProps {
  tabs: { value: string; label: string }[];
  value: string;
  onChange?: (value: string) => void;
  children?: ReactNode;
}

export function Tabs({ tabs, value, onChange, children }: TabsProps) {
  const refs = useRef<Record<string, HTMLButtonElement | null>>({});

  const move = (from: number, dir: 1 | -1) => {
    if (tabs.length === 0) return;
    const next = (from + dir + tabs.length) % tabs.length;
    const target = tabs[next];
    refs.current[target.value]?.focus();
    onChange?.(target.value);
  };

  const onKeyDown = (e: KeyboardEvent<HTMLButtonElement>, i: number) => {
    if (e.key === 'ArrowRight') { e.preventDefault(); move(i, 1); }
    else if (e.key === 'ArrowLeft') { e.preventDefault(); move(i, -1); }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column' }}>
      <div role="tablist" style={{ display: 'flex', height: 44, borderBottom: `1px solid ${tokens.color.muted}4d` }}>
        {tabs.map((t, i) => {
          const selected = t.value === value;
          return (
            <button
              key={t.value}
              ref={(el) => { refs.current[t.value] = el; }}
              type="button"
              role="tab"
              aria-selected={selected}
              tabIndex={selected ? 0 : -1}
              id={`tab-${t.value}`}
              aria-controls={`tabpanel-${t.value}`}
              onClick={() => onChange?.(t.value)}
              onKeyDown={(e) => onKeyDown(e, i)}
              style={{
                flex: 1, background: 'none', border: 'none', borderBottom: `2px solid ${selected ? tokens.color.primary : 'transparent'}`,
                color: selected ? tokens.color.primary : tokens.color.muted, fontWeight: selected ? 700 : 400,
                fontFamily: font('body'), fontSize: 14, cursor: 'pointer', padding: `0 ${sp(2)}`,
                overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
              }}
            >
              {t.label}
            </button>
          );
        })}
      </div>
      <div role="tabpanel" id={`tabpanel-${value}`} aria-labelledby={`tab-${value}`}>
        {children}
      </div>
    </div>
  );
}
