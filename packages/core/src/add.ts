import ts from 'typescript';
import { mkdirSync, readFileSync, writeFileSync, existsSync } from 'node:fs';
import { join, relative, basename } from 'node:path';
import { DIRS } from './loader.ts';
import { resolveProps } from './propsof.ts';
import { closing, dartClasses, dartConstructor, dartEnums, dartFields, maskDart, splitTop, type DartClass } from './dart.ts';

/**
 * fw add <file>: read an existing component's props and write a minimal contract into ui-spec/added/<Name>.rule.ts.
 * The source file is not touched. React: props come from the type checker (forwardRef, memo, extends and intersections
 * resolve); props inherited from a library (MUI, HTML attributes) are listed as todo, not copied, so the contract stays
 * the part screens may use. Flutter: the widget's constructor.
 */
export function addReactComponent(root: string, file: string, nameOverride?: string): { contractFile: string; name: string; todo: string[] } {
  const src = readFileSync(file, 'utf8');
  const sf = ts.createSourceFile(file, src, ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX);
  const exportName = nameOverride ?? guessExport(sf) ?? basename(file).replace(/\.\w+$/, '');
  const name = nameOverride ?? exportName;
  const todo: string[] = [];
  const resolved = resolveProps(root, file, exportName);
  let props: Map<string, { optional: boolean; typeText: string }>;
  if (resolved) {
    props = new Map([...resolved].filter(([, p]) => !p.library));
    const byLib = new Map<string, string[]>();
    for (const [k, p] of resolved) if (p.library) byLib.set(p.library, [...(byLib.get(p.library) ?? []), k]);
    for (const [lib, names] of byLib) {
      if (lib === 'react') { todo.push(`${names.length} HTML / React attribute(s) inherited (id, className, aria-*, DOM events…) are not in the contract. Add only the ones screens may use.`); continue; }
      const shown = names.slice(0, 30).join(', ') + (names.length > 30 ? ` … (${names.length - 30} more)` : '');
      todo.push(`${names.length} prop(s) inherited from ${lib} are not in the contract: ${shown}. Add the ones screens may use (fw verify resolves them).`);
    }
  } else {
    props = extractProps(sf, exportName);
    if (!props.size) todo.push(`no props found for ${exportName}: the type checker could not resolve it (are React types installed?) and no Props interface is declared in the file`);
  }
  const lines: string[] = [];
  const events: string[] = [];
  for (const [k, m] of props) {
    if (k === 'children') continue;
    const ev = k.match(/^on([A-Z]\w*)$/);
    if (ev) {
      const payload = eventPayload(m.typeText);
      if (payload === null) todo.push(`event "${k}": payload of "${m.typeText}" could not be mapped — t.void() written, edit by hand`);
      events.push(`    ${ev[1][0].toLowerCase() + ev[1].slice(1)}: ${payload ?? 't.void()'},`);
      continue;
    }
    const t = toT(m.typeText);
    if (!t) todo.push(`prop "${k}": type "${m.typeText}" could not be mapped — edit the contract by hand`);
    lines.push(`    ${k}: ${t ?? `t.string() /* TODO: was ${m.typeText.replace(/\*\//g, '')} */`}${m.optional ? '.opt()' : ''},`);
  }
  return writeContract(root, name, file, 'react', lines, events, props.has('children'), todo);
}

/** fw add lib/…/<file>.dart: the first public widget class (or --name) and its named constructor parameters. */
export function addFlutterWidget(root: string, file: string, nameOverride?: string): { contractFile: string; name: string; todo: string[] } {
  const src = readFileSync(file, 'utf8');
  const m = maskDart(src);
  const widgets = dartClasses(m).filter((c) => /extends\s+(?:\w+\.)?(StatelessWidget|StatefulWidget)\b/.test(c.header) && !c.name.startsWith('_'));
  const cls = nameOverride ? widgets.find((c) => c.name === nameOverride || c.name === `Ui${nameOverride}`) : widgets[0];
  if (!cls) throw new Error(nameOverride ? `no widget class ${nameOverride} in ${relative(root, file)}` : `no public StatelessWidget / StatefulWidget in ${relative(root, file)}`);
  const name = nameOverride ?? cls.name.replace(/^Ui(?=[A-Z])/, '');
  const params = dartConstructor(m, cls);
  if (!params) throw new Error(`${cls.name} has no constructor with named parameters`);
  const fields = dartFields(m, cls);
  const enums = dartEnums(m);
  const defaults = constructorDefaults(src, m, cls);
  const todo: string[] = [];
  const lines: string[] = [];
  const events: string[] = [];
  let children = false;
  for (const p of params) {
    if (p.name === 'key' || p.name.startsWith('super.')) continue;
    const type = (fields.get(p.name) ?? p.type ?? '').trim();
    const nullable = type.endsWith('?');
    const base = type.replace(/\?$/, '');
    if (p.name === 'children' && /^List<Widget>$/.test(base)) { children = true; continue; }
    const cb = dartCallback(base, enums);
    if (cb !== undefined && /^on[A-Z]/.test(p.name)) {
      if (cb === null) todo.push(`event "${p.name}": payload of "${type}" could not be mapped — t.void() written, edit by hand`);
      events.push(`    ${p.name[2].toLowerCase() + p.name.slice(3)}: ${cb ?? 't.void()'},`);
      continue;
    }
    const t = dartToT(base, enums);
    if (!t) todo.push(`prop "${p.name}": Dart type "${type}" could not be mapped — edit the contract by hand`);
    let mod = '';
    if (!p.required) {
      const def = defaults.get(p.name);
      const lit = def !== undefined ? dartDefault(def, base, enums) : undefined;
      if (lit !== undefined) mod = `.def(${lit})`;
      else { mod = '.opt()'; if (def !== undefined && !nullable) todo.push(`prop "${p.name}": default "${def}" could not be read — add .def(…) (fw verify needs it for a non-nullable optional)`); }
    }
    lines.push(`    ${p.name}: ${t ?? `t.string() /* TODO: was ${type} */`}${mod},`);
  }
  if (cls.name !== `Ui${name}` && cls.name !== name) todo.push(`class ${cls.name}: the contract is named ${name}`);
  return writeContract(root, name, file, 'flutter', lines, events, children, todo);
}

function writeContract(root: string, name: string, file: string, platform: 'react' | 'flutter', lines: string[], events: string[], children: boolean, todo: string[]) {
  const contract = `import { defineComponent, t } from '@himz-genui/core';

// Generated by \`fw add\` from ${relative(root, file)}. Edit freely: this file is yours.
export default defineComponent({
  name: '${name}',
  category: 'composite',
  purpose: 'TODO: what it is for, and what not to use it for.',
  props: {
${lines.join('\n')}
  },${events.length ? `\n  events: {\n${events.join('\n')}\n  },` : ''}${children ? '\n  children: true,' : ''}
  rules: [],
  impl: { ${platform}: '${relative(root, file)}' },
});
`;
  const dir = join(root, DIRS.spec, 'added');
  mkdirSync(dir, { recursive: true });
  const out = join(dir, `${name}.rule.ts`);
  if (existsSync(out)) throw new Error(`${relative(root, out)} already exists`);
  writeFileSync(out, contract);
  return { contractFile: relative(root, out), name, todo };
}

function guessExport(sf: ts.SourceFile): string | null {
  let name: string | null = null;
  sf.forEachChild((n) => {
    if (name) return;
    const exp = !!(ts.getCombinedModifierFlags(n as ts.Declaration) & ts.ModifierFlags.Export);
    if (ts.isFunctionDeclaration(n) && exp && n.name && /^[A-Z]/.test(n.name.text)) name = n.name.text;
    if (ts.isVariableStatement(n) && exp) for (const d of n.declarationList.declarations) if (ts.isIdentifier(d.name) && /^[A-Z]/.test(d.name.text)) name = d.name.text;
  });
  return name;
}

function extractProps(sf: ts.SourceFile, exportName: string): Map<string, { optional: boolean; typeText: string }> {
  // reuse verify's approach in a compact form: find the first interface/type ending with Props, else first param literal
  const out = new Map<string, { optional: boolean; typeText: string }>();
  const collect = (members: ts.NodeArray<ts.TypeElement>) => {
    for (const m of members) if (ts.isPropertySignature(m) && m.name)
      out.set(m.name.getText(sf), { optional: !!m.questionToken, typeText: m.type?.getText(sf) ?? 'any' });
  };
  let done = false;
  sf.forEachChild((n) => {
    if (done) return;
    if (ts.isInterfaceDeclaration(n) && /Props$/.test(n.name.text)) { collect(n.members); done = true; }
    if (ts.isTypeAliasDeclaration(n) && /Props$/.test(n.name.text) && ts.isTypeLiteralNode(n.type)) { collect(n.type.members); done = true; }
  });
  if (!done) sf.forEachChild((n) => {
    if (done) return;
    if (ts.isFunctionDeclaration(n) && n.name?.text === exportName && n.parameters[0]?.type && ts.isTypeLiteralNode(n.parameters[0].type)) { collect(n.parameters[0].type.members); done = true; }
  });
  return out;
}

function toT(text: string): string | null {
  const t = text.replace(/\s+/g, ' ').trim();
  if (t === 'string') return 't.string()';
  if (t === 'number') return 't.number()';
  if (t === 'boolean') return 't.boolean()';
  const en = t.match(/^(['"][\w-]+['"](\s*\|\s*)?)+$/);
  if (en) return `t.enum([${t.split('|').map((s) => s.trim().replace(/"/g, "'")).join(', ')}])`;
  const arr = t.match(/^(\w+)\[\]$/);
  if (arr) { const inner = toT(arr[1]); return inner ? `t.array(${inner})` : `t.array(t.ref('${arr[1]}'))`; }
  if (/^[A-Z]\w*$/.test(t)) return `t.ref('${t}')`;
  if (/ReactNode/.test(t)) return 't.node()';
  return null;
}

/** () => void → t.void(); (value: string) => void → t.string(); anything else → null (caller writes t.void() + todo). */
function eventPayload(text: string): string | null {
  const t = text.replace(/\s+/g, ' ').trim().replace(/^\((.*)\)$/, '$1');
  if (/^\(\) => (void|unknown|any)$/.test(t)) return 't.void()';
  const one = t.match(/^\(\w+\??: (.+?)\) => (void|unknown|any)$/);
  return one ? toT(one[1]) : null;
}

// ---------- Flutter ----------

/** Dart type → t expression; enums declared in the same file become t.enum with their values. */
function dartToT(type: string, enums: Map<string, string[]>): string | null {
  const t = type.replace(/\s+/g, '');
  if (t === 'String') return 't.string()';
  if (t === 'int') return 't.number().int()';
  if (t === 'double' || t === 'num') return 't.number()';
  if (t === 'bool') return 't.boolean()';
  if (t === 'Widget') return 't.node()';
  if (enums.has(t)) return `t.enum([${enums.get(t)!.map((v) => `'${v}'`).join(', ')}])`;
  const list = t.match(/^List<(.+)>$/);
  if (list) { const inner = dartToT(list[1], enums); return inner ? `t.array(${inner})` : null; }
  return null;
}
/** undefined = not a callback; null = a callback whose payload could not be mapped. */
function dartCallback(type: string, enums: Map<string, string[]>): string | null | undefined {
  const t = type.replace(/\s+/g, ' ').trim();
  if (t === 'VoidCallback' || /^void Function\(\s*\)$/.test(t)) return 't.void()';
  const vc = t.match(/^(?:ValueChanged|ValueSetter)<(.+)>$/) ?? t.match(/^void Function\((\w[\w<>, ]*?)(?: \w+)?\)$/);
  if (vc) return dartToT(vc[1], enums);
  return /Function|Callback/.test(t) ? null : undefined;
}
/** Default expression of each named parameter, read from the original source (strings are masked in m). */
function constructorDefaults(src: string, m: string, cls: DartClass): Map<string, string> {
  const out = new Map<string, string>();
  const body = m.slice(cls.bodyStart, cls.bodyEnd);
  const hit = new RegExp(`(^|[^.\\w])(?:const\\s+)?${cls.name}\\s*\\(`).exec(body);
  if (!hit) return out;
  const open = cls.bodyStart + hit.index + hit[0].length - 1;
  const brace = m.indexOf('{', open);
  const end = brace >= 0 ? closing(m, brace) : -1;
  if (end < 0) return out;
  for (const [a, b] of splitTop(m, brace + 1, end)) {
    const [decl, def] = src.slice(a, b).trim().replace(/^required\s+/, '').split(/=(.*)/s);
    const name = (decl.trim().match(/(\w+)\s*$/) ?? [])[1];
    if (name && def !== undefined) out.set(name, def.trim());
  }
  return out;
}
/** A Dart default literal as a contract .def() argument, or undefined when it is not a plain literal. */
function dartDefault(def: string, type: string, enums: Map<string, string[]>): string | undefined {
  const d = def.trim();
  if (d === 'true' || d === 'false') return d;
  if (/^-?\d+(\.\d+)?$/.test(d)) return d;
  const str = d.match(/^'([^'\\$]*)'$/) ?? d.match(/^"([^"\\$]*)"$/);
  if (str) return `'${str[1]}'`;
  const en = d.match(/^(\w+)\.(\w+)$/);
  if (en && en[1] === type && enums.get(type)?.includes(en[2])) return `'${en[2]}'`;
  if (/^(const\s*)?\[\s*\]$/.test(d)) return '[]';
  return undefined;
}
