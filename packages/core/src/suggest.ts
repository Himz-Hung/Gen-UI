// "Did you mean …?" for every name the user or agent types: components, screens,
// props, events, actions, domain types. Only ever suggests, never auto-corrects.

/** Optimal-string-alignment distance: insert, delete, substitute, swap adjacent. */
function distance(a: string, b: string): number {
  const d: number[][] = Array.from({ length: a.length + 1 }, (_, i) => [i, ...Array(b.length).fill(0)]);
  for (let j = 1; j <= b.length; j++) d[0][j] = j;
  for (let i = 1; i <= a.length; i++) {
    for (let j = 1; j <= b.length; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      d[i][j] = Math.min(d[i - 1][j] + 1, d[i][j - 1] + 1, d[i - 1][j - 1] + cost);
      if (i > 1 && j > 1 && a[i - 1] === b[j - 2] && a[i - 2] === b[j - 1]) d[i][j] = Math.min(d[i][j], d[i - 2][j - 2] + 1);
    }
  }
  return d[a.length][b.length];
}

/** The candidate plus its word-order rotations: ListItem → ListItem, ItemList. */
function variants(name: string): string[] {
  const words = name.match(/[A-Z]?[a-z0-9]+|[A-Z]+(?![a-z])/g) ?? [name];
  const out = [name];
  for (let i = 1; i < words.length; i++) out.push([...words.slice(i), ...words.slice(0, i)].join(''));
  return out.map((v) => v.toLowerCase());
}

export interface Suggestion { name: string; caseOnly: boolean }

/** Closest candidate, or null when nothing is close enough to be a typo. */
export function suggest(input: string, candidates: Iterable<string>): Suggestion | null {
  if (typeof input !== 'string') return null;
  const low = input.toLowerCase();
  let best: { name: string; score: number } | null = null;
  for (const c of candidates) {
    if (c === input) return null;
    if (c.toLowerCase() === low) return { name: c, caseOnly: true };
    const vs = variants(c);
    // a word-order swap costs 1 on top of the edit distance
    const score = Math.min(...vs.map((v, i) => distance(low, v) + (i ? 1 : 0)));
    if (!best || score < best.score) best = { name: c, score };
  }
  if (!best) return null;
  const limit = Math.max(2, Math.floor(Math.max(input.length, best.name.length) / 3));
  return best.score <= limit ? { name: best.name, caseOnly: false } : null;
}

/** ' Did you mean "X"?' / ' Wrong case: it is "X".', or '' when there is no good guess. Append after a full sentence. */
export function didYouMean(input: string, candidates: Iterable<string>): string {
  const s = suggest(input, candidates);
  if (!s) return '';
  return s.caseOnly ? ` Wrong case: it is "${s.name}".` : ` Did you mean "${s.name}"?`;
}
