// Theme model: primitive → semantic → component tokens, and modes on independent axes (colorScheme, density, brand…).
// Browser-safe and pure: fw resolves it at build time to generate CSS variables / Dart, the checks read it too.

/** A reference to another token, W3C Design Tokens style: '{color.blue.600}', '{color.primary}'. */
export type TokenRef = `{${string}}`;
export type ColorValue = string;
export type DimensionValue = number | TokenRef;

/** Nested palette: { blue: { 600: '#2563EB' }, white: '#FFFFFF' }. */
export interface Palette { [name: string]: string | Palette }

export interface SemanticTokens {
  /** Roles, not hues: primary, onPrimary, surface, onSurface, muted, border, danger, onDanger, focus… Hex or a reference. */
  color: Record<string, ColorValue>;
  /** Spacing scale by step: space[4] */
  space: DimensionValue[];
  radius: Record<string, DimensionValue>;
  /** Named sizes (control heights…) that checks can reference: { token: 'size.controlMd' } */
  size?: Record<string, DimensionValue>;
  font: Record<string, string>;
  /** Optional per-component tokens: { button: { primaryBg: '{color.primary}' } } */
  component?: Record<string, Record<string, ColorValue | DimensionValue>>;
}

/** What a mode value changes: any semantic token, only the ones that differ. */
export interface TokenOverrides {
  color?: Record<string, ColorValue>;
  space?: DimensionValue[];
  radius?: Record<string, DimensionValue>;
  size?: Record<string, DimensionValue>;
  font?: Record<string, string>;
  component?: Record<string, Record<string, ColorValue | DimensionValue>>;
}

export interface ThemeTokens {
  primitives?: { color?: Palette; space?: Record<string, number>; radius?: Record<string, number>; size?: Record<string, number> };
  semantic: SemanticTokens;
  /** Axis → value → overrides. The first value of an axis is its default. colorScheme values light / dark also answer
   *  the OS preference ('system'). */
  modes?: Record<string, Record<string, TokenOverrides>>;
  /** Extra text / background pairs to check, with an optional minimum ratio (default 4.5). onX / X pairs are implied. */
  contrast?: [string, string, number?][];
}

/** The 1.x shape (one flat set of values). Still read so projects keep working while they move to ThemeTokens. */
export interface LegacyTokens {
  color: Record<string, string>;
  spacing: number[];
  radius: Record<string, number>;
  font: Record<string, string>;
  size?: Record<string, number>;
}

export type ProjectTokens = ThemeTokens | LegacyTokens;

/** Fully resolved values for one mode combination. */
export interface ResolvedTheme {
  color: Record<string, string>;
  space: number[];
  radius: Record<string, number>;
  size: Record<string, number>;
  font: Record<string, string>;
  component: Record<string, Record<string, string | number>>;
}

export type ModeSelection = Record<string, string>;
export interface ModeAxis { name: string; values: string[] }

export const isLegacyTokens = (t: ProjectTokens): t is LegacyTokens => !('semantic' in t);

/** Any accepted shape → ThemeTokens. */
export function normalizeTokens(t: ProjectTokens): ThemeTokens {
  if (!isLegacyTokens(t)) return t;
  return { semantic: { color: { ...t.color }, space: [...t.spacing], radius: { ...t.radius }, size: { ...(t.size ?? {}) }, font: { ...t.font } } };
}

export function modeAxes(t: ProjectTokens): ModeAxis[] {
  const m = normalizeTokens(t).modes ?? {};
  return Object.entries(m).map(([name, values]) => ({ name, values: Object.keys(values) }));
}

export function defaultMode(t: ProjectTokens): ModeSelection {
  return Object.fromEntries(modeAxes(t).filter((a) => a.values.length).map((a) => [a.name, a.values[0]]));
}

/** Every combination of axis values (the default combination first). */
export function modeCombos(t: ProjectTokens): ModeSelection[] {
  let out: ModeSelection[] = [{}];
  for (const a of modeAxes(t)) if (a.values.length) out = out.flatMap((sel) => a.values.map((v) => ({ ...sel, [a.name]: v })));
  return out;
}

export const modeLabel = (sel: ModeSelection) => Object.entries(sel).map(([k, v]) => `${k}=${v}`).join(', ') || 'default';

/** Semantic tokens with the overrides of the selected mode values applied (references not yet resolved). */
function merged(t: ThemeTokens, sel: ModeSelection): SemanticTokens {
  const s = t.semantic;
  const out: SemanticTokens = {
    color: { ...s.color }, space: [...s.space], radius: { ...s.radius }, size: { ...(s.size ?? {}) }, font: { ...s.font },
    component: Object.fromEntries(Object.entries(s.component ?? {}).map(([k, v]) => [k, { ...v }])),
  };
  for (const [axis, values] of Object.entries(t.modes ?? {})) {
    const o = values[sel[axis] ?? Object.keys(values)[0]];
    if (!o) continue;
    Object.assign(out.color, o.color);
    if (o.space) o.space.forEach((v, i) => { out.space[i] = v; });
    Object.assign(out.radius, o.radius);
    Object.assign(out.size!, o.size);
    Object.assign(out.font, o.font);
    for (const [c, v] of Object.entries(o.component ?? {})) out.component![c] = { ...(out.component![c] ?? {}), ...v };
  }
  return out;
}

const isRef = (v: unknown): v is TokenRef => typeof v === 'string' && /^\{[\w.-]+\}$/.test(v);

/**
 * Resolve every reference for one mode combination. `problems` lists broken references and cycles; the value is left
 * as '' / 0 so generation still completes and the checks report the problem.
 */
export function resolveTheme(tokens: ProjectTokens, sel: ModeSelection = defaultMode(tokens)): { theme: ResolvedTheme; problems: string[] } {
  const t = normalizeTokens(tokens);
  const m = merged(t, sel);
  const problems: string[] = [];
  const lookup = (path: string): unknown => {
    const [group, ...rest] = path.split('.');
    const sources: unknown[] = [(m as unknown as Record<string, unknown>)[group], (t.primitives as Record<string, unknown> | undefined)?.[group]];
    for (const src of sources) {
      let v: unknown = src;
      for (const p of rest) v = v && typeof v === 'object' ? (v as Record<string, unknown>)[p] : undefined;
      if (v !== undefined && (typeof v !== 'object' || v === null)) return v;
    }
    return undefined;
  };
  const resolve = (v: unknown, where: string, seen: string[] = []): unknown => {
    if (!isRef(v)) return v;
    const path = v.slice(1, -1);
    if (seen.includes(path)) { problems.push(`${where}: reference cycle ${[...seen, path].join(' → ')}`); return undefined; }
    const target = lookup(path);
    if (target === undefined) { problems.push(`${where}: ${v} does not exist`); return undefined; }
    return resolve(target, where, [...seen, path]);
  };
  const str = (v: unknown, where: string) => { const r = resolve(v, where); return typeof r === 'string' ? r : (problems.push(`${where}: expected a color / text, got ${JSON.stringify(r)}`), ''); };
  const num = (v: unknown, where: string) => { const r = resolve(v, where); return typeof r === 'number' ? r : (r === undefined ? 0 : (problems.push(`${where}: expected a number, got ${JSON.stringify(r)}`), 0)); };
  const theme: ResolvedTheme = {
    color: Object.fromEntries(Object.entries(m.color).map(([k, v]) => [k, str(v, `color.${k}`)])),
    space: m.space.map((v, i) => num(v, `space[${i}]`)),
    radius: Object.fromEntries(Object.entries(m.radius).map(([k, v]) => [k, num(v, `radius.${k}`)])),
    size: Object.fromEntries(Object.entries(m.size ?? {}).map(([k, v]) => [k, num(v, `size.${k}`)])),
    font: Object.fromEntries(Object.entries(m.font).map(([k, v]) => [k, str(v, `font.${k}`)])),
    component: Object.fromEntries(Object.entries(m.component ?? {}).map(([c, vs]) => [c, Object.fromEntries(Object.entries(vs).map(([k, v]) => {
      const r = resolve(v, `component.${c}.${k}`);
      return [k, typeof r === 'number' || typeof r === 'string' ? r : ''];
    }))])),
  };
  return { theme, problems };
}

// ---------- contrast (WCAG 2.x) ----------

/** '#RGB' / '#RRGGBB' / '#AARRGGBB' → [r, g, b] 0..255, or null when it is not a hex color. */
export function parseHex(hex: string): [number, number, number] | null {
  let h = hex.trim().replace(/^#/, '');
  if (!/^([0-9a-f]{3}|[0-9a-f]{6}|[0-9a-f]{8})$/i.test(h)) return null;
  if (h.length === 3) h = h.split('').map((c) => c + c).join('');
  if (h.length === 8) h = h.slice(2);
  return [0, 2, 4].map((i) => parseInt(h.slice(i, i + 2), 16)) as [number, number, number];
}

function luminance([r, g, b]: [number, number, number]): number {
  const ch = (c: number) => { const s = c / 255; return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4; };
  return 0.2126 * ch(r) + 0.7152 * ch(g) + 0.0722 * ch(b);
}

export function contrastRatio(a: string, b: string): number | null {
  const pa = parseHex(a), pb = parseHex(b);
  if (!pa || !pb) return null;
  const [hi, lo] = [luminance(pa), luminance(pb)].sort((x, y) => y - x);
  return (hi + 0.05) / (lo + 0.05);
}

/** onX / X pairs present in the semantic colors, plus the declared ones. */
export function contrastPairs(tokens: ProjectTokens): [string, string, number][] {
  const t = normalizeTokens(tokens);
  const keys = Object.keys(t.semantic.color);
  const implied = keys.filter((k) => /^on[A-Z]/.test(k)).map((k) => [k, k[2].toLowerCase() + k.slice(3), 4.5] as [string, string, number]).filter(([, bg]) => keys.includes(bg));
  const declared = (t.contrast ?? []).map(([fg, bg, min]) => [fg, bg, min ?? 4.5] as [string, string, number]);
  const all = [...implied, ...declared];
  return all.filter(([fg, bg], i) => all.findIndex(([f, b]) => f === fg && b === bg) === i);
}

// ---------- integrity + contrast diagnostics ----------

export interface ThemeProblem { level: 'error' | 'warning'; where: string; message: string }

/** Everything `fw check` reports about the tokens: shape, references, overrides of unknown tokens, contrast per mode. */
export function themeProblems(tokens: ProjectTokens): ThemeProblem[] {
  const t = normalizeTokens(tokens);
  const out: ThemeProblem[] = [];
  const s = t.semantic;
  if (!s || !s.color || !s.space || !s.radius || !s.font) { out.push({ level: 'error', where: 'tokens.semantic', message: 'needs color, space, radius and font' }); return out; }
  for (const [axis, values] of Object.entries(t.modes ?? {})) {
    if (!Object.keys(values).length) out.push({ level: 'error', where: `tokens.modes.${axis}`, message: 'an axis needs at least one value (the first is the default)' });
    if (axis === 'colorScheme' && !('light' in values && 'dark' in values) && Object.keys(values).length > 1) out.push({ level: 'warning', where: 'tokens.modes.colorScheme', message: 'name the values light and dark so "system" can follow the OS preference' });
    for (const [value, o] of Object.entries(values)) {
      for (const group of ['color', 'radius', 'size', 'font'] as const) for (const k of Object.keys(o[group] ?? {}))
        if (!(k in ((s as unknown as Record<string, Record<string, unknown>>)[group] ?? {}))) out.push({ level: 'error', where: `tokens.modes.${axis}.${value}.${group}.${k}`, message: `overrides ${group}.${k}, which tokens.semantic does not define` });
      if (o.space && o.space.length > s.space.length) out.push({ level: 'error', where: `tokens.modes.${axis}.${value}.space`, message: `has ${o.space.length} steps, tokens.semantic.space has ${s.space.length}` });
    }
  }
  const pairs = contrastPairs(tokens);
  for (const [fg, bg] of pairs) for (const k of [fg, bg]) if (!(k in s.color)) out.push({ level: 'error', where: 'tokens.contrast', message: `color.${k} is not a semantic color` });
  const seenProblems = new Set<string>();
  for (const sel of modeCombos(tokens)) {
    const { theme, problems } = resolveTheme(tokens, sel);
    for (const p of problems) if (!seenProblems.has(p)) { seenProblems.add(p); out.push({ level: 'error', where: 'tokens', message: `${p}${Object.keys(sel).length ? ` (${modeLabel(sel)})` : ''}` }); }
    for (const [name, v] of Object.entries(theme.color)) if (v && !parseHex(v) && !/^(transparent|currentColor)$/.test(v)) out.push({ level: 'warning', where: `tokens.semantic.color.${name}`, message: `"${v}" is not a hex color: contrast cannot be checked` });
    for (const [fg, bg, min] of pairs) {
      const r = contrastRatio(theme.color[fg] ?? '', theme.color[bg] ?? '');
      if (r !== null && r < min) out.push({ level: 'error', where: `tokens (${modeLabel(sel)})`, message: `color.${fg} ${theme.color[fg]} on color.${bg} ${theme.color[bg]}: contrast ${r.toFixed(2)} < ${min} (WCAG ${min >= 4.5 ? 'AA text' : 'AA large text / UI'})` });
    }
  }
  return out;
}

// ---------- W3C Design Tokens (DTCG) interchange ----------

type DtcgLeaf = { $value: string; $type: 'color' | 'dimension' | 'fontFamily' | 'number' };
type DtcgGroup = { [key: string]: DtcgLeaf | DtcgGroup };

const leafType = (group: string, v: unknown): DtcgLeaf['$type'] =>
  group === 'color' ? 'color' : group === 'font' ? 'fontFamily' : typeof v === 'number' && /opacity|weight/i.test(String(group)) ? 'number' : 'dimension';
const toLeaf = (group: string, v: unknown): DtcgLeaf => ({ $value: typeof v === 'number' ? (leafType(group, v) === 'number' ? String(v) : `${v}px`) : String(v), $type: leafType(group, v) });

function groupToDtcg(layer: Record<string, unknown>, group = ''): DtcgGroup {
  const out: DtcgGroup = {};
  for (const [k, v] of Object.entries(layer)) {
    if (v === undefined) continue;
    const g = group || k;
    if (Array.isArray(v)) out[k] = Object.fromEntries(v.map((x, i) => [String(i), toLeaf(g, x)]));
    else if (v && typeof v === 'object') out[k] = groupToDtcg(v as Record<string, unknown>, g);
    else out[k] = toLeaf(g, v);
  }
  return out;
}

/**
 * The tokens as W3C Design Tokens JSON: one token set per layer / mode value (`primitives`, `semantic`,
 * `mode/colorScheme/dark`…), references kept as '{group.path}'. Tokens Studio and Style Dictionary read it.
 */
export function toDesignTokens(tokens: ProjectTokens): Record<string, DtcgGroup> {
  const t = normalizeTokens(tokens);
  const out: Record<string, DtcgGroup> = {};
  if (t.primitives) out.primitives = groupToDtcg(t.primitives as Record<string, unknown>);
  out.semantic = groupToDtcg(t.semantic as unknown as Record<string, unknown>);
  for (const [axis, values] of Object.entries(t.modes ?? {})) for (const [value, o] of Object.entries(values)) out[`mode/${axis}/${value}`] = groupToDtcg(o as Record<string, unknown>);
  return out;
}

const fromLeaf = (l: DtcgLeaf): string | number => {
  if (l.$type === 'dimension' && /^-?\d+(\.\d+)?px$/.test(l.$value)) return parseFloat(l.$value);
  if (l.$type === 'number') return Number(l.$value);
  return l.$value;
};
function dtcgToGroup(g: DtcgGroup, arrayKeys: string[] = ['space']): Record<string, unknown> {
  const out: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(g)) {
    if (k.startsWith('$')) continue;
    if ('$value' in v) { out[k] = fromLeaf(v as DtcgLeaf); continue; }
    const inner = dtcgToGroup(v as DtcgGroup, arrayKeys);
    out[k] = arrayKeys.includes(k) && Object.keys(inner).every((x) => /^\d+$/.test(x)) ? Object.keys(inner).sort((a, b) => +a - +b).map((x) => inner[x]) : inner;
  }
  return out;
}

/** The inverse of toDesignTokens: token sets named primitives / semantic / mode/<axis>/<value> → ThemeTokens. */
export function fromDesignTokens(sets: Record<string, DtcgGroup>): ThemeTokens {
  const semantic = dtcgToGroup(sets.semantic ?? {}) as unknown as SemanticTokens;
  const out: ThemeTokens = { semantic };
  if (sets.primitives) out.primitives = dtcgToGroup(sets.primitives, []) as ThemeTokens['primitives'];
  for (const [name, g] of Object.entries(sets)) {
    const m = name.match(/^mode\/([^/]+)\/([^/]+)$/);
    if (!m) continue;
    out.modes ??= {};
    (out.modes[m[1]] ??= {})[m[2]] = dtcgToGroup(g) as TokenOverrides;
  }
  return out;
}
