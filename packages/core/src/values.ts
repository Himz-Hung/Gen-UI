// Prop values in a spec, at any depth: a literal, a binding { "path": … }, or a
// translated text { "i18n": key, "params"?: {…} }. Used by check.ts.
import type { Report } from './diagnostics.ts';
import { didYouMean } from './suggest.ts';
import { checkLiteral, sameType, typeText, type TypeNode } from './types.ts';

export interface ValueCtx {
  /** screen data: name → type */
  data: Record<string, TypeNode>;
  /** repeat variables in scope at this element: name → item type */
  scope: Map<string, TypeNode>;
  domain: Record<string, TypeNode>;
  /** absent when the project declares no languages */
  i18n?: { languages: string[]; file: string; strings: Record<string, string> };
}

export const isBinding = (v: unknown): v is { path: string } =>
  typeof v === 'object' && v !== null && !Array.isArray(v) && typeof (v as { path?: unknown }).path === 'string';
export const isI18n = (v: unknown): v is { i18n: string; params?: Record<string, unknown> } =>
  typeof v === 'object' && v !== null && !Array.isArray(v) && typeof (v as { i18n?: unknown }).i18n === 'string';

/** {count} placeholders in a translated string */
export const placeholders = (s: string): string[] => [...new Set([...s.matchAll(/\{(\w+)\}/g)].map((m) => m[1]))].sort();

/** Follow domain refs until a concrete type. */
export function deref(t: TypeNode, domain: Record<string, TypeNode>): TypeNode {
  let cur = t;
  for (let i = 0; cur.kind === 'ref' && i < 20; i++) { const next = domain[cur.ref!]; if (!next) return cur; cur = next; }
  return cur;
}

/**
 * "/cart/items" starts from screen data, "item/card/name" from a repeat variable.
 * Every segment is typed through the domain. Returns the type or an error message.
 */
export function resolvePath(path: string, ctx: ValueCtx): TypeNode | string {
  const fromData = path.startsWith('/');
  const [head, ...rest] = (fromData ? path.slice(1) : path).split('/');
  let cur: TypeNode | undefined = fromData ? ctx.data[head] : ctx.scope.get(head);
  if (!cur) {
    if (fromData) return `"/${head}" is not in the screen data (${Object.keys(ctx.data).join(', ') || 'none'}).${didYouMean(head, Object.keys(ctx.data))}`;
    const vars = [...ctx.scope.keys()];
    if (ctx.data[head]) return `screen data needs a leading slash: "/${path}"`;
    return `"${head}" is not a repeat variable here (${vars.length ? `in scope: ${vars.join(', ')}` : 'no repeat above this element'}).${didYouMean(head, vars)}`;
  }
  let at = fromData ? `/${head}` : head;
  for (const seg of rest) {
    const t = deref(cur, ctx.domain);
    if (t.kind === 'array') return `${at} is a list (${typeText(cur)}); show its items with "repeat": { "path": "${at}", "as": "item" }`;
    if (t.kind !== 'object') return `${at} is ${typeText(cur)}, it has no field "${seg}"`;
    const next: TypeNode | undefined = t.fields?.[seg];
    if (!next) return `${at} (${cur.kind === 'ref' ? cur.ref : 'object'}) has no field "${seg}".${didYouMean(seg, Object.keys(t.fields ?? {}))} Fields: ${Object.keys(t.fields ?? {}).join(', ')}`;
    cur = next;
    at += `/${seg}`;
  }
  return cur;
}

/** Can a bound value of type `bound` go into a prop of type `prop`? An enum value is a string. */
export function assignable(bound: TypeNode, prop: TypeNode, domain: Record<string, TypeNode>): boolean {
  if (prop.kind === 'ref') return sameType(bound, prop);
  const b = deref(bound, domain);
  if (prop.kind === 'string' && (b.kind === 'string' || b.kind === 'enum')) return true;
  if (prop.kind === 'array' && b.kind === 'array') return assignable(b.of!, prop.of!, domain);
  return sameType(b, prop);
}

const LETTERS = /\p{L}/u;

export function checkValue(value: unknown, ty: TypeNode, where: string, ctx: ValueCtx, r: Report): void {
  if (isBinding(value)) {
    const bound = resolvePath(value.path, ctx);
    if (typeof bound === 'string') r.error(where, `path "${value.path}": ${bound}`);
    else if (!assignable(bound, ty, ctx.domain)) r.error(where, `path "${value.path}" is ${typeText(bound)}, prop expects ${typeText(ty)}`);
    return;
  }
  if (isI18n(value)) return checkI18n(value, ty, where, ctx, r);

  if (ty.kind === 'array' && Array.isArray(value)) {
    value.forEach((v, i) => checkValue(v, ty.of!, `${where}[${i}]`, ctx, r));
    return;
  }
  if (ty.kind === 'object' && typeof value === 'object' && value !== null && !Array.isArray(value)) {
    const v = value as Record<string, unknown>;
    const fields = ty.fields ?? {};
    for (const [k, f] of Object.entries(fields)) if (v[k] === undefined && !f.optional) r.error(`${where}.${k}`, `missing field (${typeText(f)})`);
    for (const [k, fv] of Object.entries(v)) {
      if (!fields[k]) { r.error(`${where}.${k}`, `unknown field.${didYouMean(k, Object.keys(fields))} Fields: ${Object.keys(fields).join(', ')}`); continue; }
      checkValue(fv, fields[k], `${where}.${k}`, ctx, r);
    }
    return;
  }
  const e = checkLiteral(value, ty);
  if (e) { r.error(where, e); return; }
  if (ty.text && ctx.i18n && ctx.i18n.languages.length > 1 && typeof value === 'string' && LETTERS.test(value))
    r.error(where, `hard-coded text "${value}" in a project with languages ${ctx.i18n.languages.join(', ')}: use { "i18n": "some.key" } and add the key to ${ctx.i18n.file}`);
}

function checkI18n(value: { i18n: string; params?: Record<string, unknown> }, ty: TypeNode, where: string, ctx: ValueCtx, r: Report): void {
  if (!(ty.kind === 'string' && ty.text)) { r.error(where, `only text props take { "i18n": … }; this one is ${typeText(ty)}`); return; }
  if (!ctx.i18n) { r.error(where, 'the project declares no languages: add languages to ui-spec/project.ts, or write the text directly'); return; }
  const keys = Object.keys(ctx.i18n.strings);
  const text = ctx.i18n.strings[value.i18n];
  if (text === undefined) { r.error(`${where}.i18n`, `no string "${value.i18n}" in ${ctx.i18n.file}.${didYouMean(value.i18n, keys)} Add it there (and to the other languages).`); return; }
  const params = value.params ?? {};
  if (typeof params !== 'object' || params === null || Array.isArray(params)) { r.error(`${where}.params`, 'params is an object: placeholder → value or { "path": … }'); return; }
  const need = placeholders(text);
  for (const p of need) if (!(p in params)) r.error(`${where}.params`, `"${value.i18n}" ("${text}") needs param "${p}"`);
  for (const [p, pv] of Object.entries(params)) {
    const pw = `${where}.params.${p}`;
    if (!need.includes(p)) { r.error(pw, `"${value.i18n}" ("${text}") has no {${p}} placeholder.${didYouMean(p, need)}`); continue; }
    if (isBinding(pv)) {
      const b = resolvePath(pv.path, ctx);
      if (typeof b === 'string') r.error(pw, `path "${pv.path}": ${b}`);
      else if (!['string', 'number', 'boolean', 'enum'].includes(deref(b, ctx.domain).kind)) r.error(pw, `path "${pv.path}" is ${typeText(b)}; a placeholder takes a string, number or enum`);
    } else if (typeof pv !== 'string' && typeof pv !== 'number') r.error(pw, 'a placeholder takes a string, a number or { "path": … }');
  }
}
