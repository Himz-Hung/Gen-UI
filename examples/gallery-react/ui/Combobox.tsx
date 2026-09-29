import { useEffect, useRef, useState } from 'react';
import { tokens, sp } from './tokens';

export interface ComboboxOption { value: string; label: string; description?: string }

export interface ComboboxProps {
  label: string;
  value: string;
  query: string;
  options: ComboboxOption[];
  placeholder?: string;
  loading?: boolean;
  emptyText?: string;
  hint?: string;
  error?: string;
  disabled?: boolean;
  onSearch?: (value: string) => void;
  onChange?: (value: string) => void;
}

export function Combobox({ label, value, query, options, placeholder, loading = false, emptyText, hint, error, disabled = false, onSearch, onChange }: ComboboxProps) {
  const id = `cb-${label.replace(/\W+/g, '-').toLowerCase()}`;
  const listId = `${id}-list`;
  const msgId = `${id}-msg`;
  // Local text mirrors `query`, except right after choosing an option it shows the option's label
  // until the screen sends a new query (this component never filters by itself).
  const [text, setText] = useState(query);
  const [open, setOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => setText(query), [query]);
  useEffect(() => setActiveIndex(-1), [options]);

  const showList = open && !disabled && (options.length > 0 || loading || (query.length > 0 && emptyText != null));

  function choose(o: ComboboxOption) {
    setText(o.label);
    onChange?.(o.value);
    setOpen(false);
  }

  function onBlur(e: React.FocusEvent<HTMLDivElement>) {
    if (!containerRef.current?.contains(e.relatedTarget as Node | null)) setOpen(false);
  }

  function onKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (options.length) { setOpen(true); setActiveIndex((i) => (i + 1) % options.length); }
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (options.length) { setOpen(true); setActiveIndex((i) => (i <= 0 ? options.length - 1 : i - 1)); }
    } else if (e.key === 'Enter') {
      if (showList && activeIndex >= 0 && activeIndex < options.length) { e.preventDefault(); choose(options[activeIndex]); }
    } else if (e.key === 'Escape') {
      setOpen(false);
    }
  }

  return (
    <div ref={containerRef} onBlur={onBlur} style={{ display: 'grid', gap: sp(1), position: 'relative' }}>
      <label htmlFor={id} style={{ fontSize: 13, fontWeight: 600, color: tokens.color.text }}>{label}</label>
      <input
        id={id}
        role="combobox"
        aria-expanded={showList}
        aria-controls={listId}
        aria-autocomplete="list"
        aria-activedescendant={showList && activeIndex >= 0 ? `${listId}-${activeIndex}` : undefined}
        autoComplete="off"
        value={text}
        placeholder={placeholder}
        disabled={disabled}
        aria-invalid={!!error || undefined}
        aria-describedby={error || hint ? msgId : undefined}
        onFocus={() => setOpen(true)}
        onChange={(e) => { setText(e.target.value); onSearch?.(e.target.value); setOpen(true); }}
        onKeyDown={onKeyDown}
        style={{ width: '100%', boxSizing: 'border-box', height: 40, borderRadius: tokens.radius.md, border: `1px solid ${error ? tokens.color.danger : tokens.color.muted}`, padding: `0 ${sp(3)}`, font: 'inherit', background: tokens.color.surface }}
      />
      <div aria-live="polite" style={{ position: 'absolute', width: 1, height: 1, overflow: 'hidden', opacity: 0 }}>
        {showList ? (loading ? 'Loading' : `${options.length} result${options.length === 1 ? '' : 's'}`) : ''}
      </div>
      {showList && (
        <ul id={listId} role="listbox" style={{ position: 'absolute', top: '100%', left: 0, right: 0, zIndex: 10, margin: 0, marginTop: sp(1), padding: 0, listStyle: 'none', maxHeight: 240, overflowY: 'auto', background: tokens.color.surface, border: `1px solid ${tokens.color.muted}`, borderRadius: tokens.radius.md }}>
          {loading ? (
            <li style={{ padding: sp(3), color: tokens.color.muted }}>Loading…</li>
          ) : options.length === 0 ? (
            <li style={{ padding: sp(3), color: tokens.color.muted }}>{emptyText ?? ''}</li>
          ) : options.map((o, i) => (
            <li
              key={o.value}
              id={`${listId}-${i}`}
              role="option"
              aria-selected={o.value === value || i === activeIndex}
              // Prevent the input's blur (which would unmount this list) from firing before the click.
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => choose(o)}
              style={{ padding: `${sp(2)} ${sp(3)}`, cursor: 'pointer', background: i === activeIndex ? tokens.color.surface : undefined, outline: i === activeIndex ? `2px solid ${tokens.color.primary}` : undefined, outlineOffset: -2 }}
            >
              <div>{o.label}</div>
              {o.description && <div style={{ color: tokens.color.muted, fontSize: 12 }}>{o.description}</div>}
            </li>
          ))}
        </ul>
      )}
      {(error || hint) && <div id={msgId} role={error ? 'alert' : undefined} style={{ fontSize: 12, color: error ? tokens.color.danger : tokens.color.muted }}>{error || hint}</div>}
    </div>
  );
}
