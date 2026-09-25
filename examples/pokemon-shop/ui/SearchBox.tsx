import { tokens, sp } from './tokens';
export interface SearchBoxProps { value: string; placeholder?: string; loading?: boolean; onChange?: (value: string) => void; onSearch?: (query: string) => void; onClear?: () => void }
export function SearchBox({ value, placeholder = 'Search', loading = false, onChange, onSearch, onClear }: SearchBoxProps) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: sp(2), height: 40, padding: `0 ${sp(3)}`, border: `1px solid ${tokens.color.muted}`, borderRadius: tokens.radius.md, background: tokens.color.surface }}>
      <span aria-hidden data-icon={loading ? 'spinner' : 'search'} />
      <input type="search" role="searchbox" value={value} placeholder={placeholder} onChange={(e) => onChange?.(e.target.value)}
        onKeyDown={(e) => { if (e.key === 'Enter') onSearch?.(value); }} style={{ flex: 1, border: 0, outline: 0, background: 'transparent', font: 'inherit' }} />
      {value && <button type="button" aria-label="Clear search" onClick={() => { onChange?.(''); onClear?.(); }}>×</button>}
    </div>
  );
}
