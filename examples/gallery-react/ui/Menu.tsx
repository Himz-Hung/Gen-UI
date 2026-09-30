import type { ReactNode } from 'react';
import { useEffect, useRef, useState } from 'react';
import { tokens, sp, font, alpha } from './tokens';

export interface MenuItem { value: string; label: string; icon?: string; danger?: boolean; disabled?: boolean }

export interface MenuProps {
  label: string;
  items: MenuItem[];
  align?: 'start' | 'end';
  onSelect?: (value: string) => void;
  children?: ReactNode;
}

export function Menu({ label, items, align = 'start', onSelect, children }: MenuProps) {
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLDivElement>(null);
  const itemRefs = useRef<Array<HTMLButtonElement | null>>([]);

  const focusTrigger = () => triggerRef.current?.querySelector<HTMLElement>('button, [href], [tabindex]')?.focus();

  // danger items use tokens.color.danger text and come last.
  const ordered = [...items.filter((i) => !i.danger), ...items.filter((i) => i.danger)];

  // Escape or pressing outside closes it without selecting; returns focus to the trigger.
  useEffect(() => {
    if (!open) return;
    const onPointerDown = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) setOpen(false);
    };
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') { setOpen(false); focusTrigger(); }
    };
    document.addEventListener('mousedown', onPointerDown);
    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('mousedown', onPointerDown);
      document.removeEventListener('keydown', onKeyDown);
    };
  }, [open]);

  useEffect(() => {
    if (open) itemRefs.current.find((el) => el && !el.disabled)?.focus();
  }, [open]);

  const choose = (item: MenuItem) => {
    if (item.disabled) return;
    onSelect?.(item.value);
    setOpen(false);
    focusTrigger();
  };

  const moveFocus = (from: number, delta: number) => {
    if (!ordered.length) return;
    let i = from;
    for (let step = 0; step < ordered.length; step++) {
      i = (i + delta + ordered.length) % ordered.length;
      const el = itemRefs.current[i];
      if (el && !el.disabled) { el.focus(); return; }
    }
  };

  return (
    <div ref={containerRef} style={{ position: 'relative', display: 'inline-block' }}>
      {/* The single child is the trigger; pressing it opens the menu. */}
      <div
        ref={triggerRef}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label={label}
        onClick={() => setOpen((o) => !o)}
        style={{ display: 'inline-block' }}
      >
        {children}
      </div>
      {open && (
        <div
          role="menu"
          aria-label={label}
          style={{
            position: 'absolute', top: '100%', marginTop: sp(1), zIndex: 1000, minWidth: 160,
            [align === 'start' ? 'left' : 'right']: 0,
            background: tokens.color.surface, borderRadius: tokens.radius.md, boxShadow: `0 4px 16px ${alpha(tokens.color.shadow, 0.15)}`,
            padding: sp(1), fontFamily: font('body'), boxSizing: 'border-box',
          }}
        >
          {ordered.map((item, i) => (
            <button
              key={item.value}
              ref={(el) => { itemRefs.current[i] = el; }}
              role="menuitem"
              type="button"
              disabled={item.disabled}
              onClick={() => choose(item)}
              onKeyDown={(e) => {
                if (e.key === 'ArrowDown') { e.preventDefault(); moveFocus(i, 1); }
                if (e.key === 'ArrowUp') { e.preventDefault(); moveFocus(i, -1); }
              }}
              style={{
                display: 'flex', alignItems: 'center', gap: sp(2), width: '100%', textAlign: 'left',
                background: 'transparent', border: 'none', borderRadius: tokens.radius.sm, padding: `${sp(2)} ${sp(3)}`,
                color: item.danger ? tokens.color.danger : tokens.color.text, cursor: item.disabled ? 'not-allowed' : 'pointer',
                opacity: item.disabled ? 0.5 : 1, fontSize: 14, fontFamily: font('body'),
              }}
            >
              {item.icon && <span aria-hidden data-icon={item.icon} />}
              {item.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
