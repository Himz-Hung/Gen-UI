import ts from 'typescript';
import { existsSync, readFileSync } from 'node:fs';
import { join, relative } from 'node:path';
import type { ComponentContract } from './define.ts';
import type { TypeNode } from './types.ts';
import { typeText } from './types.ts';
import { Report } from './diagnostics.ts';
import { DIRS } from './loader.ts';

/**
 * v0 static verify for React: does ui/<Name>.tsx export a component whose
 * props type honours the contract? Checks surface (names, kinds, enum
 * members, event handlers), not behaviour. Behavioural test generation is deferred.
 */
export function verifyReact(root: string, c: ComponentContract): { report: Report; implPath: string | null } {
  const candidates = [`${c.name}.tsx`, `${c.name}/index.tsx`, `${c.name}/${c.name}.tsx`].map((p) => join(root, DIRS.ui, p));
  if (c.impl?.react) candidates.unshift(join(root, c.impl.react));
  const file = candidates.find(existsSync);
  const rel = relative(root, candidates[0]);
  const r = new Report(rel);
  if (!file) { r.error('file', `not found. Expected ${rel} (or ${c.name}/index.tsx). Materialize it: fw docs ${c.name}`); return { report: r, implPath: null }; }
  r.file = relative(root, file);

  const src = readFileSync(file, 'utf8');
  const sf = ts.createSourceFile(file, src, ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX);

  // 1. exported symbol named c.name
  const exported = findExport(sf, c.name);
  if (!exported) { r.error('export', `no export named ${c.name}. Use "export function ${c.name}(props: ${c.name}Props)" or "export const ${c.name} = ..."`); return { report: r, implPath: null }; }

  // 2. props type: first parameter's type, resolved if it is a type reference
  const propsType = propsTypeOf(sf, exported);
  if (!propsType) { r.error('props', 'could not find a props type on the first parameter (use an interface/type literal, e.g. ButtonProps)'); return { report: r, implPath: null }; }
  const members = membersOf(sf, propsType);
  if (!members) { r.error('props', 'props type is not an object type'); return { report: r, implPath: null }; }

  // 3. each contract prop
  for (const [name, ty] of Object.entries(c.props)) {
    const m = members.get(name);
    if (!m) { r.error(`props.${name}`, `missing prop (${typeText(ty)})`); continue; }
    if (!ty.optional && m.optional) r.error(`props.${name}`, 'contract says required, implementation marks it optional');
    if (ty.optional && !m.optional && ty.default === undefined) r.warn(`props.${name}`, 'contract says optional, implementation requires it');
    const e = kindMismatch(ty, m.typeText);
    if (e) r.error(`props.${name}`, e);
  }
  // 4. events → onX handler
  for (const [ev, payload] of Object.entries(c.events ?? {})) {
    const handler = 'on' + ev[0].toUpperCase() + ev.slice(1);
    const m = members.get(handler);
    if (!m) { r.error(`events.${ev}`, `missing handler prop "${handler}"`); continue; }
    if (!/=>|\bFunction\b|\(\)/.test(m.typeText)) r.error(`events.${ev}`, `"${handler}" should be a function type, got ${m.typeText}`);
    void payload;
  }
  // 5. children
  if (c.children && !members.has('children')) r.error('children', 'contract accepts children but props have no "children"');
  if (!c.children && members.has('children')) r.error('children', 'contract does not accept children but props declare "children"');
  // 6. unknown props → warning (implementation may add internals like className)
  for (const k of members.keys()) {
    const isHandler = [...Object.keys(c.events ?? {})].some((ev) => k === 'on' + ev[0].toUpperCase() + ev.slice(1));
    if (!c.props[k] && !isHandler && k !== 'children') r.warn(`props.${k}`, 'prop not in contract (allowed, but the agent must not rely on it in specs)');
  }
  // 7. platform hints that are checkable: "<button" presence when hinted
  for (const hint of c.platform?.react ?? []) {
    const m = hint.match(/use <([a-z][a-z0-9]*)/i);
    if (m && !src.includes(`<${m[1]}`)) r.warn('platform.react', `hint says "${hint}" but <${m[1]} not found in source`);
  }
  return { report: r, implPath: r.ok ? relative(root, file) : null };
}

function findExport(sf: ts.SourceFile, name: string): ts.Node | null {
  let found: ts.Node | null = null;
  const isExported = (n: ts.Node) => !!(ts.getCombinedModifierFlags(n as ts.Declaration) & ts.ModifierFlags.Export);
  sf.forEachChild((n) => {
    if (found) return;
    if (ts.isFunctionDeclaration(n) && n.name?.text === name && isExported(n)) found = n;
    if (ts.isVariableStatement(n) && isExported(n)) {
      for (const d of n.declarationList.declarations) if (ts.isIdentifier(d.name) && d.name.text === name) found = d;
    }
    if (ts.isExportDeclaration(n) && n.exportClause && ts.isNamedExports(n.exportClause)) {
      for (const e of n.exportClause.elements) if (e.name.text === name) {
        const local = (e.propertyName ?? e.name).text;
        sf.forEachChild((m) => {
          if (ts.isFunctionDeclaration(m) && m.name?.text === local) found = m;
          if (ts.isVariableStatement(m)) for (const d of m.declarationList.declarations) if (ts.isIdentifier(d.name) && d.name.text === local) found = d;
        });
      }
    }
  });
  return found;
}

function propsTypeOf(sf: ts.SourceFile, node: ts.Node): ts.TypeNode | null {
  let fn: ts.SignatureDeclaration | null = null;
  if (ts.isFunctionDeclaration(node)) fn = node;
  else if (ts.isVariableDeclaration(node) && node.initializer) {
    let init: ts.Expression = node.initializer;
    // React.forwardRef(...) / memo(...) : take first arg
    while (ts.isCallExpression(init) && init.arguments.length) init = init.arguments[0];
    if (ts.isArrowFunction(init) || ts.isFunctionExpression(init)) fn = init;
    // const X: FC<Props> = ...
    if (!fn && node.type && ts.isTypeReferenceNode(node.type) && node.type.typeArguments?.length) return node.type.typeArguments[0];
  }
  const p = fn?.parameters[0];
  return p?.type ?? null;
}

interface Member { optional: boolean; typeText: string }

function membersOf(sf: ts.SourceFile, tn: ts.TypeNode): Map<string, Member> | null {
  if (ts.isTypeLiteralNode(tn)) return collect(sf, tn.members);
  if (ts.isTypeReferenceNode(tn) && ts.isIdentifier(tn.typeName)) {
    const name = tn.typeName.text;
    let out: Map<string, Member> | null = null;
    sf.forEachChild((n) => {
      if (ts.isInterfaceDeclaration(n) && n.name.text === name) {
        out = collect(sf, n.members);
        for (const h of n.heritageClauses ?? []) for (const t of h.types) {
          const base = membersOf(sf, ts.factory.createTypeReferenceNode(t.expression.getText(sf)));
          if (base) for (const [k, v] of base) if (!out.has(k)) out.set(k, v);
        }
      }
      if (ts.isTypeAliasDeclaration(n) && n.name.text === name) out = membersOf(sf, n.type);
    });
    return out;
  }
  if (ts.isIntersectionTypeNode(tn)) {
    const out = new Map<string, Member>();
    for (const part of tn.types) { const m = membersOf(sf, part); if (m) for (const [k, v] of m) out.set(k, v); }
    return out;
  }
  return null;
}

function collect(sf: ts.SourceFile, members: ts.NodeArray<ts.TypeElement>): Map<string, Member> {
  const out = new Map<string, Member>();
  for (const m of members) if (ts.isPropertySignature(m) && m.name) {
    const name = ts.isIdentifier(m.name) || ts.isStringLiteral(m.name) ? m.name.text : m.name.getText(sf);
    out.set(name, { optional: !!m.questionToken, typeText: m.type?.getText(sf) ?? 'any' });
  }
  return out;
}

/** Compare a contract type with the implementation's type text. Shallow, by kind. */
function kindMismatch(ty: TypeNode, text: string): string | null {
  const t = text.replace(/\s+/g, ' ').trim();
  switch (ty.kind) {
    case 'string': return /\bstring\b/.test(t) ? null : `expected string, got ${t}`;
    case 'number': return /\bnumber\b/.test(t) ? null : `expected number, got ${t}`;
    case 'boolean': return /\bboolean\b/.test(t) ? null : `expected boolean, got ${t}`;
    case 'enum': {
      const missing = (ty.values ?? []).filter((v) => !new RegExp(`['"]${v}['"]`).test(t));
      return missing.length ? `missing enum member(s): ${missing.map((v) => `'${v}'`).join(', ')} (got ${t})` : null;
    }
    case 'array': return /\[\]$|Array<|ReadonlyArray</.test(t) ? null : `expected ${typeText(ty)}, got ${t}`;
    case 'ref': return t.includes(ty.ref!) ? null : `expected ${ty.ref}, got ${t}`;
    case 'node': return /ReactNode|ReactElement|JSX\.Element/.test(t) ? null : `expected ReactNode, got ${t}`;
    default: return null;
  }
}
