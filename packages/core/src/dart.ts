// A light Dart reader, enough for the conventions in flutter.ts: enums, classes, constructors with
// named parameters, final fields, imports and constructor calls. No Dart SDK needed; `flutter analyze`
// remains the real type check, the way tsc is for React.
import { existsSync, readFileSync } from 'node:fs';
import { join, relative } from 'node:path';
import type { ComponentContract } from './define.ts';
import { Report } from './diagnostics.ts';
import { flutterSignature, dartFile, type DartDecl } from './flutter.ts';
import type { TypeNode } from './types.ts';

/** Same length as src, with comments blanked and string contents replaced by spaces (quotes kept). */
export function maskDart(src: string): string {
  const out = src.split('');
  let i = 0;
  const blank = (a: number, b: number) => { for (let k = a; k < b; k++) if (out[k] !== '\n') out[k] = ' '; };
  while (i < src.length) {
    if (src.startsWith('//', i)) { const e = src.indexOf('\n', i); const end = e < 0 ? src.length : e; blank(i, end); i = end; continue; }
    if (src.startsWith('/*', i)) { const e = src.indexOf('*/', i + 2); const end = e < 0 ? src.length : e + 2; blank(i, end); i = end; continue; }
    const raw = src[i] === 'r' && (src[i + 1] === "'" || src[i + 1] === '"') && !/\w/.test(src[i - 1] ?? '');
    const q0 = raw ? i + 1 : i;
    if (src[q0] === "'" || src[q0] === '"') {
      const triple = src.startsWith(src[q0].repeat(3), q0);
      const quote = triple ? src[q0].repeat(3) : src[q0];
      let j = q0 + quote.length;
      while (j < src.length) {
        if (!raw && src[j] === '\\') { j += 2; continue; }
        if (src.startsWith(quote, j)) break;
        if (!triple && src[j] === '\n') break;
        j++;
      }
      blank(q0 + quote.length, j);
      i = j + quote.length;
      continue;
    }
    i++;
  }
  return out.join('');
}

const OPEN: Record<string, string> = { '(': ')', '{': '}', '[': ']' };
/** Index of the bracket closing the one at `at` (in masked source), or -1. */
export function closing(m: string, at: number): number {
  const stack: string[] = [];
  for (let i = at; i < m.length; i++) {
    const ch = m[i];
    if (OPEN[ch]) stack.push(OPEN[ch]);
    else if (ch === ')' || ch === '}' || ch === ']') { if (stack.pop() !== ch) return -1; if (!stack.length) return i; }
  }
  return -1;
}

/** Split m[start, end) at top-level commas; returns [start, end) ranges, trimmed, empty ones dropped. */
export function splitTop(m: string, start: number, end: number): [number, number][] {
  const parts: [number, number][] = [];
  let depth = 0, angle = 0, from = start;
  for (let i = start; i <= end; i++) {
    const ch = i === end ? ',' : m[i];
    if ('([{'.includes(ch)) depth++;
    else if (')]}'.includes(ch)) depth--;
    else if (ch === '<') angle++;
    else if (ch === '>' && angle > 0 && m[i - 1] !== '=') angle--;
    else if (ch === ',' && depth === 0 && angle === 0) {
      let a = from, b = i;
      while (a < b && /\s/.test(m[a])) a++;
      while (b > a && /\s/.test(m[b - 1])) b--;
      if (b > a) parts.push([a, b]);
      from = i + 1;
    }
  }
  return parts;
}

export interface DartClass { name: string; header: string; bodyStart: number; bodyEnd: number }
export interface DartParam { name: string; required: boolean; hasDefault: boolean; thisBound: boolean; type?: string }

export function dartEnums(m: string): Map<string, string[]> {
  const out = new Map<string, string[]>();
  for (const x of m.matchAll(/\benum\s+(\w+)\s*(?:with\s+[\w\s,]+|implements\s+[\w\s,<>]+)*\{/g)) {
    const open = x.index! + x[0].length - 1, close = closing(m, open);
    if (close < 0) continue;
    const body = m.slice(open + 1, close);
    const head = body.split(';')[0];
    out.set(x[1], head.split(',').map((v) => v.replace(/\(.*$/s, '').trim()).filter((v) => /^\w+$/.test(v)));
  }
  return out;
}

export function dartClasses(m: string): DartClass[] {
  const out: DartClass[] = [];
  for (const x of m.matchAll(/\b(?:(?:abstract|final|sealed|base|interface|mixin)\s+)*class\s+(\w+)(\s*<[^{]*?>)?([^{;]*)\{/g)) {
    const open = x.index! + x[0].length - 1, close = closing(m, open);
    if (close > 0) out.push({ name: x[1], header: x[3].trim(), bodyStart: open + 1, bodyEnd: close });
  }
  return out;
}

/** Named / positional parameters of the constructor `Name(…)` inside the class body. */
export function dartConstructor(m: string, cls: DartClass): DartParam[] | null {
  const body = m.slice(cls.bodyStart, cls.bodyEnd);
  const re = new RegExp(`(^|[^.\\w])(?:const\\s+)?${cls.name}\\s*\\(`, 'g');
  const hit = re.exec(body);
  if (!hit) return null;
  const open = cls.bodyStart + hit.index + hit[0].length - 1, close = closing(m, open);
  if (close < 0) return null;
  let inner = m.slice(open + 1, close);
  let base = open + 1;
  const brace = inner.indexOf('{');
  if (brace >= 0) { const end = closing(m, base + brace); if (end > 0) { base = base + brace + 1; inner = m.slice(base, end); } }
  return splitTop(m, base, base + inner.length).map(([a, b]) => {
    const p = m.slice(a, b).trim();
    const required = /^required\b/.test(p);
    const rest = p.replace(/^required\s+/, '');
    const [decl, def] = rest.split(/=(.*)/s);
    const thisBound = /^(this|super)\./.test(decl.trim());
    const name = (decl.trim().match(/(\w+)\s*$/) ?? [])[1] ?? '';
    const type = thisBound ? undefined : decl.trim().replace(/\s*\w+\s*$/, '').trim() || undefined;
    return { name: /^super\./.test(decl.trim()) ? `super.${name}` : name, required, hasDefault: def !== undefined, thisBound, type };
  });
}

/** `final Type name;` at the top level of the class body (not locals inside methods). */
export function dartFields(m: string, cls: DartClass): Map<string, string> {
  const out = new Map<string, string>();
  let depth = 0, stmt = cls.bodyStart;
  for (let i = cls.bodyStart; i < cls.bodyEnd; i++) {
    const ch = m[i];
    if (ch === '{' || ch === '(' || ch === '[') depth++;
    else if (ch === '}' || ch === ')' || ch === ']') { depth--; if (depth === 0 && ch === '}') stmt = i + 1; }
    else if (ch === ';' && depth === 0) {
      const s = m.slice(stmt, i).trim();
      const f = s.match(/^(?:late\s+)?final\s+(.+?)\s+(\w+)(?:\s*=.*)?$/s);
      if (f) out.set(f[2], f[1].replace(/\s+/g, ' ').trim());
      stmt = i + 1;
    }
  }
  return out;
}

// ---------- verify ----------

const NUM = /^(int|double|num)\??$/;
const base = (t: string) => t.replace(/\?$/, '').replace(/\s+/g, '');

function kindMismatch(ty: TypeNode, expected: string, actual: string): string | null {
  const a = base(actual), e = base(expected);
  switch (ty.kind) {
    case 'string': return a === 'String' ? null : `expected String, got ${actual}`;
    case 'number': return ty.integer ? (a === 'int' ? null : `expected int (the contract says a whole number), got ${actual}`) : NUM.test(a) ? null : `expected double (int / num also accepted), got ${actual}`;
    case 'boolean': return a === 'bool' ? null : `expected bool, got ${actual}`;
    case 'node': return /^(Widget|List<Widget>)$/.test(a) ? null : `expected Widget, got ${actual}`;
    case 'ref': return null;
    case 'enum': case 'object': return a === e ? null : `expected ${e}, got ${actual}`;
    case 'array': {
      if (!a.startsWith('List<')) return `expected ${e}, got ${actual}`;
      const of = ty.of!;
      if (of.kind === 'number') return (of.integer ? /^List<int>$/ : /^List<(int|double|num)>$/).test(a) ? null : `expected ${e}, got ${actual}`;
      return a === e ? null : `expected ${e}, got ${actual}`;
    }
    default: return null;
  }
}

/**
 * lib/ui/<snake>.dart against the contract, by the conventions in flutter.ts: class Ui<Name>
 * extending StatelessWidget / StatefulWidget, one named constructor parameter and one final field per
 * prop with the expected type, onX callbacks for events, `children` iff the contract accepts children,
 * and the enums / item classes with the expected names and members.
 */
export function verifyFlutter(root: string, c: ComponentContract): { report: Report; implPath: string | null } {
  const sig = flutterSignature(c);
  const rel = c.impl?.flutter ?? dartFile(c.name);
  const r = new Report(rel);
  const file = join(root, rel);
  if (!existsSync(file)) { r.error('file', `not found. Expected ${rel} with class ${sig.className}. Materialize it: fw docs ${c.name}`); return { report: r, implPath: null }; }
  const m = maskDart(readFileSync(file, 'utf8'));
  const classes = dartClasses(m);
  const enums = dartEnums(m);

  const cls = classes.find((x) => x.name === sig.className);
  if (!cls) { r.error('class', `no class ${sig.className}. The widget for contract ${c.name} is named ${sig.className} (Ui prefix, see fw docs ${c.name})`); return { report: r, implPath: null }; }
  if (!/extends\s+(?:\w+\.)?(StatelessWidget|StatefulWidget)\b/.test(cls.header)) r.error('class', `${sig.className} must extend StatelessWidget or StatefulWidget`);
  const params = dartConstructor(m, cls);
  if (!params) { r.error('constructor', `no constructor ${sig.className}({…}) with named parameters`); return { report: r, implPath: null }; }
  const byName = new Map(params.map((p) => [p.name, p]));
  const fields = dartFields(m, cls);
  const typeOf = (name: string) => fields.get(name) ?? byName.get(name)?.type;

  for (const p of sig.params) {
    const w = `props.${p.name}`;
    const got = byName.get(p.name);
    if (!got) { r.error(w, `missing constructor parameter ${p.required ? `required this.${p.name}` : `this.${p.name}${p.def ? ` = ${p.def}` : ''}`} (${p.type})`); continue; }
    if (p.required && !got.required) r.error(w, 'contract says required: mark it "required"');
    if (!p.required && got.required) r.error(w, `contract says optional${p.def ? ` with default ${p.def}` : ''}: not "required"`);
    if (p.def && !got.hasDefault && !got.required) r.warn(w, `contract default is ${p.def}; give the parameter that default`);
    const t = typeOf(p.name);
    if (!t) { r.error(w, `no field "final ${p.type} ${p.name};"`); continue; }
    const e = kindMismatch(p.node, p.type, t);
    if (e) r.error(w, e);
    if (!p.required && p.def === undefined && !t.trim().endsWith('?')) r.error(w, `optional without default: the type must be nullable (${p.type})`);
  }
  for (const cb of sig.callbacks) {
    const w = `events.${cb.event}`;
    if (!byName.has(cb.name)) { r.error(w, `missing callback parameter this.${cb.name} (${cb.type})`); continue; }
    const t = typeOf(cb.name) ?? '';
    if (!/^(VoidCallback|ValueChanged<.+>|ValueSetter<.+>|void Function\(.*\)|Function)\??$/.test(t.trim())) { r.error(w, `"${cb.name}" should be ${cb.type}, got ${t || 'no field'}`); continue; }
    // The payload type must match too: ValueChanged<int> is not ValueChanged<double>.
    const want = payloadOf(cb.type), got = payloadOf(t);
    if (want !== got && !(want === null && got === '')) r.error(w, `"${cb.name}" should be ${cb.type}, got ${t}`);
  }
  if (sig.child && !byName.has('children')) r.error('children', 'contract accepts children: add "this.children = const []" (List<Widget>)');
  if (!sig.child && (byName.has('children') || byName.has('child'))) r.error('children', 'contract does not accept children, but the constructor takes them');

  // Enums and item classes the signature needs.
  const allEnums = new Map(enums);
  for (const d of sig.decls) checkDecl(d, allEnums, classes, m, r);

  const known = new Set([...sig.params.map((p) => p.name), ...sig.callbacks.map((cb) => cb.name), 'children', 'super.key', 'key']);
  for (const p of params) if (!known.has(p.name)) r.warn(`props.${p.name}`, 'parameter not in the contract (allowed, but specs cannot use it)');
  return { report: r, implPath: r.ok ? relative(root, file) : null };
}

/** VoidCallback → null; ValueChanged<int> / ValueSetter<int> / void Function(int value) → 'int'. */
function payloadOf(t: string): string | null {
  const x = t.trim().replace(/\?$/, '');
  if (x === 'VoidCallback' || /^void\s+Function\(\s*\)$/.test(x)) return null;
  const vc = x.match(/^(?:ValueChanged|ValueSetter)\s*<(.+)>$/);
  if (vc) return vc[1].replace(/\s+/g, '');
  const fn = x.match(/^void\s+Function\(\s*(.+?)(?:\s+\w+)?\s*\)$/);
  return fn ? fn[1].replace(/\s+/g, '') : '';
}

function checkDecl(d: DartDecl, enums: Map<string, string[]>, classes: DartClass[], m: string, r: Report) {
  if (d.kind === 'enum') {
    const got = enums.get(d.name);
    if (!got) { r.error(`types.${d.name}`, `missing enum ${d.name} { ${d.values!.join(', ')} }`); return; }
    const missing = d.values!.filter((v) => !got.includes(v));
    if (missing.length) r.error(`types.${d.name}`, `missing enum value(s): ${missing.join(', ')} (have ${got.join(', ')})`);
    return;
  }
  const cls = classes.find((x) => x.name === d.name);
  if (!cls) { r.error(`types.${d.name}`, `missing class ${d.name} with fields ${d.fields!.map((f) => f.name).join(', ')}`); return; }
  const fields = dartFields(m, cls);
  for (const f of d.fields!) {
    const got = fields.get(f.name);
    if (!got) { r.error(`types.${d.name}.${f.name}`, `missing field "final ${f.type} ${f.name};"`); continue; }
    const want = f.type.replace(/\s+/g, ''), have = got.replace(/\s+/g, '');
    const ok = want === have || (want.replace(/\?$/, '') === 'double' && NUM.test(have) && want.endsWith('?') === have.endsWith('?'));
    if (!ok) r.error(`types.${d.name}.${f.name}`, `expected "final ${f.type} ${f.name};", got ${got}`);
  }
}
