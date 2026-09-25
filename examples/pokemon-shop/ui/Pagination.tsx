import { tokens } from './tokens';
export interface PaginationProps { page: number; pageCount: number; onChange?: (page: number) => void }
export function Pagination({ page, pageCount, onChange }: PaginationProps) {
  const go = (p: number) => { if (p !== page && p >= 1 && p <= pageCount) onChange?.(p); };
  const targets = pages(page, pageCount);
  return (
    <nav aria-label="Pagination" style={{ display: 'flex', gap: 4, justifyContent: 'center' }}>
      <button type="button" disabled={page <= 1} onClick={() => go(page - 1)}>Previous</button>
      {targets.map((p, i) => p === '…' ? <span key={`e${i}`} aria-hidden>…</span> :
        <button key={p} type="button" aria-current={p === page ? 'page' : undefined} onClick={() => go(p)} style={{ fontWeight: p === page ? 700 : 400, color: p === page ? tokens.color.primary : undefined }}>{p}</button>)}
      <button type="button" disabled={page >= pageCount} onClick={() => go(page + 1)}>Next</button>
    </nav>
  );
}
function pages(cur: number, n: number): (number | '…')[] {
  if (n <= 7) return Array.from({ length: n }, (_, i) => i + 1);
  const s = new Set([1, n, cur - 1, cur, cur + 1].filter((p) => p >= 1 && p <= n));
  const out: (number | '…')[] = [];
  let prev = 0;
  for (const p of [...s].sort((a, b) => a - b)) { if (p - prev > 1) out.push('…'); out.push(p); prev = p; }
  return out;
}
