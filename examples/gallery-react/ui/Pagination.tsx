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
// At most 7 targets, the same slots as the Flutter implementation: all when n <= 7, otherwise the middle
// collapses around the current page.
function pages(cur: number, n: number): (number | '…')[] {
  if (n <= 7) return Array.from({ length: n }, (_, i) => i + 1);
  if (cur <= 4) return [1, 2, 3, 4, 5, '…', n];
  if (cur >= n - 3) return [1, '…', n - 4, n - 3, n - 2, n - 1, n];
  return [1, '…', cur - 1, cur, cur + 1, '…', n];
}
