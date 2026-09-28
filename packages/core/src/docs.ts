import { isScreenDetail, type Catalog, type ComponentContract, type ScreenDetail, type ScreenSpec } from './define.ts';
import { typeText, type TypeNode } from './types.ts';
import type { ScreenInfo } from './screens.ts';
import { isBinding, isI18n } from './values.ts';

/** Markdown the agent reads before materializing a component. */
export function renderDocs(c: ComponentContract, platform?: 'react' | 'flutter'): string {
  const L: string[] = [];
  L.push(`# ${c.name}`, '', `_${c.category}_ · contract v${c.version ?? 1}`, '', c.purpose, '');
  L.push('## Props', '', '| prop | type | default | notes |', '|---|---|---|---|');
  for (const [k, v] of Object.entries(c.props)) {
    const def = v.default !== undefined ? `\`${JSON.stringify(v.default)}\`` : v.optional ? '—' : '**required**';
    L.push(`| ${k} | \`${typeText(v)}\`${v.text ? ' (text)' : ''} | ${def} | ${v.description ?? ''} |`);
  }
  if (Object.values(c.props).some((v) => v.text)) L.push('', '_(text)_ = a string the user reads. In a multi-language project it is never hard-coded: specs use `{ "i18n": "key" }`, code uses the project\'s i18n function.');
  if (c.children) L.push('', 'Accepts children.');
  if (c.events && Object.keys(c.events).length) {
    L.push('', '## Events', '');
    for (const [k, v] of Object.entries(c.events)) L.push(`- \`${k}\`${v.kind === 'void' ? '' : ` (${typeText(v)})`}${v.description ? ` — ${v.description}` : ''}`);
  }
  if (c.states?.length) L.push('', '## States', '', c.states.map((s) => `\`${s}\``).join(', '));
  if (c.rules?.length) L.push('', '## Rules (every platform)', '', ...c.rules.map((x) => `- ${x}`));
  if (c.a11y?.length) L.push('', '## Accessibility', '', ...c.a11y.map((x) => `- ${x}`));
  if (c.composition) {
    L.push('', '## Composition', '');
    if (c.composition.canContain) L.push(`- May only contain: ${c.composition.canContain.join(', ')}`);
    if (c.composition.cannotBeInside) L.push(`- Never inside: ${c.composition.cannotBeInside.join(', ')}`);
  }
  const plats = platform ? [platform] : (Object.keys(c.platform ?? {}) as ('react' | 'flutter')[]);
  for (const p of plats) {
    const hints = c.platform?.[p];
    if (hints?.length) L.push('', `## ${p} hints (advisory)`, '', ...hints.map((x) => `- ${x}`));
  }
  if (c.examples?.length) {
    L.push('', '## Examples', '', '```json', ...c.examples.map((e) => JSON.stringify(e)), '```');
  }
  return L.join('\n') + '\n';
}

// ---------- Screens: a readable picture for people, so nobody has to read the spec JSON ----------

/** What `fw docs <Screen>` prints: the description, the layout the agent built, and where the screen leads. */
export function renderScreen(s: {
  name: string;
  purpose?: string;
  info?: ScreenInfo;
  spec?: { file: string; spec: ScreenSpec };
  catalog: Catalog;
  strings?: Record<string, string>;
}): string {
  const L: string[] = [`# ${s.name}  (screen)`, ''];
  if (s.purpose) L.push(s.purpose, '');
  L.push([s.info?.file, s.spec?.file].filter(Boolean).join(' · ') || '(no description or spec yet)', '');
  const raw = s.info?.raw;
  if (raw && isScreenDetail(raw)) {
    list(L, 'Shows', raw.shows);
    list(L, 'Local actions', Object.entries(raw.local ?? {}).map(([k, v]) => `${k}: ${v}`));
    list(L, 'When', Object.entries(raw.when ?? {}).map(([k, v]) => `${k}: ${v}`));
    const facts = [
      raw.data && Object.keys(raw.data).length ? `data ${Object.entries(raw.data).map(([k, v]) => `${k}: ${v}`).join(', ')}` : '',
      raw.params && Object.keys(raw.params).length ? `params ${Object.entries(raw.params).map(([k, v]) => `${k}: ${v}`).join(', ')}` : '',
      raw.guard ? `guard ${raw.guard}` : '',
    ].filter(Boolean);
    if (facts.length) L.push(facts.join(' · '), '');
  } else if (raw) {
    list(L, 'Needs', raw.needs);
  }
  if (s.spec) {
    L.push(`## Layout (${s.spec.file})`, '');
    L.push(...layout(s.spec.spec, s.catalog, s.strings ?? {}), '');
  }
  if (s.info?.format === 'detail') {
    const goTo = (s.info.raw as ScreenDetail).goTo ?? {};
    const ways = s.info.nav.map((e) => {
      const g = goTo[e.to];
      const how = typeof g === 'string' ? g : g?.how;
      return `${e.to}${e.mode === 'push' ? '' : ` (${e.mode})`}: ${how} → ${e.action}`;
    });
    ways.push(s.info.back ? `back → goBack${s.info.backFallback ? ` (else ${s.info.backFallback})` : ''}` : 'no back');
    list(L, 'Goes to', ways);
  }
  return L.join('\n').replace(/\n+$/, '') + '\n';
}

function list(L: string[], title: string, items: string[] | undefined) {
  if (!items?.length) return;
  L.push(`## ${title}`, '', ...items.map((x) => `- ${x}`), '');
}

/** The spec as an indented tree. Shows text, bindings, repeats and events; styling literals are left out. */
function layout(spec: ScreenSpec, catalog: Catalog, strings: Record<string, string>): string[] {
  const els = spec.elements ?? {};
  const out: string[] = [];
  const show = (v: unknown, ty?: TypeNode): string | null => {
    if (isBinding(v)) return v.path;
    if (isI18n(v)) {
      const text = strings[v.i18n] ?? v.i18n;
      return `"${text.replace(/\{(\w+)\}/g, (m, p) => { const pv = v.params?.[p]; return pv === undefined ? m : isBinding(pv) ? `{${pv.path}}` : String(pv); })}"`;
    }
    if (ty?.text && typeof v === 'string' && v) return `"${v}"`;
    if (Array.isArray(v) && ty?.kind === 'array') { const xs = v.map((x) => show(x, ty.of)).filter(Boolean); return xs.length ? `[${xs.join(', ')}]` : null; }
    if (v && typeof v === 'object' && ty?.kind === 'object') {
      const xs = Object.entries(v as Record<string, unknown>).map(([k, x]) => { const sv = show(x, ty.fields?.[k]); return sv && `${k} ${sv}`; }).filter(Boolean);
      return xs.length ? `{ ${xs.join(', ')} }` : null;
    }
    return null;
  };
  const visit = (id: string, prefix: string, last: boolean, depth: number, seen: Set<string>) => {
    const el = els[id];
    if (!el || seen.has(id)) return;
    seen.add(id);
    const entry = catalog.components[el.type];
    const parts: string[] = [];
    const each = el.repeat ? `for each ${el.repeat.path} as ${el.repeat.as}: ` : '';
    for (const [p, v] of Object.entries(el.props ?? {})) { const sv = show(v, entry?.props[p]); if (sv) parts.push(`${p} ${sv}`); }
    for (const [ev, a] of Object.entries(el.on ?? {})) parts.push(`${ev} → ${a}`);
    const branch = depth === 0 ? '' : last ? '└─ ' : '├─ ';
    out.push(`${prefix}${branch}${el.type}${parts.length || each ? `   ${each}${parts.join(' · ')}` : ''}`);
    const kids = el.children ?? [];
    const next = depth === 0 ? '' : prefix + (last ? '   ' : '│  ');
    kids.forEach((c, i) => visit(c, next, i === kids.length - 1, depth + 1, seen));
  };
  visit(spec.root, '', true, 0, new Set());
  return out;
}
