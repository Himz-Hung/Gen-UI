// Flutter conventions in one place. Docs, verify, the Dart code check, the generated files and
// init all read these, so the signature the agent is shown is exactly the one it is checked against.
//
//   contract Button            → lib/ui/button.dart, class UiButton extends StatelessWidget
//   prop variant: enum         → enum UiButtonVariant { primary, secondary, … }
//   prop options: array(object)→ List<UiSelectOption>, class UiSelectOption { … }
//   event press                → VoidCallback? onPress        event change(string) → ValueChanged<String>? onChange
//   children                   → List<Widget> children (always a list, like the spec; one-child wrappers take one)
//
// Every class has the Ui prefix: 19 contract names collide with Flutter widgets (Text, Card, Switch…)
// and List collides with dart:core, so one rule for all is the only one that stays predictable.
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import type { ComponentContract, ProjectConfig } from './define.ts';
import type { TypeNode } from './types.ts';

export const FLUTTER = { ui: 'lib/ui', screens: 'lib/screens', l10n: 'lib/l10n' } as const;

const pascal = (s: string) => s.replace(/(^|[-_\s:.]+)(\w)/g, (_, __, c: string) => c.toUpperCase());
export const snake = (name: string) => name.replace(/([a-z0-9])([A-Z])/g, '$1_$2').replace(/([A-Z])([A-Z][a-z])/g, '$1_$2').toLowerCase();

/** Component file and class. */
export const dartFile = (component: string) => `${FLUTTER.ui}/${snake(component)}.dart`;
export const dartClass = (component: string) => `Ui${component}`;
/** Screen file and class: Cart → lib/screens/cart_screen.dart, class CartScreen. */
export const dartScreenFile = (screen: string) => `${FLUTTER.screens}/${snake(screen)}_screen.dart`;
export const dartScreenClass = (screen: string) => `${screen}Screen`;

/** 'sm' → sm, '5:7' → v5x7, '0' → v0, 'oldest-first' → oldestFirst, 'NM' → nm */
export function enumValue(v: string): string {
  const parts = v.replace(/:/g, 'x').split(/[^A-Za-z0-9]+/).filter(Boolean);
  let id = parts.map((p, i) => (i === 0 ? (p === p.toUpperCase() ? p.toLowerCase() : p[0].toLowerCase() + p.slice(1)) : p[0].toUpperCase() + p.slice(1).toLowerCase())).join('');
  if (!id || /^[0-9]/.test(id)) id = `v${id}`;
  if (DART_RESERVED.has(id)) id = `${id}Value`;
  return id;
}
const DART_RESERVED = new Set(['default', 'new', 'null', 'true', 'false', 'in', 'is', 'do', 'if', 'for', 'switch', 'case', 'class', 'enum', 'extends', 'final', 'const', 'var', 'void', 'return', 'this', 'super', 'try', 'with', 'while', 'values', 'index', 'name']);

/** options → Option, series → Series, entries → Entry, slices → Slice */
function singular(word: string): string {
  if (/series$/i.test(word)) return word;
  if (/ies$/.test(word)) return word.slice(0, -3) + 'y';
  if (/(ss|us)$/.test(word)) return word;
  if (/s$/.test(word)) return word.slice(0, -1);
  return word;
}

/** Name of the Dart type for an enum or object found at `field` of a component (props, fields inside, events). */
export const enumType = (component: string, field: string) => `Ui${component}${pascal(field)}`;
export const itemClass = (component: string, field: string, inArray: boolean) => `Ui${component}${pascal(inArray ? singular(field) : field)}`;

export interface DartDecl { kind: 'enum' | 'class'; name: string; values?: string[]; fields?: { name: string; type: string; required: boolean; def?: string }[] }

/** Dart type for a contract type, collecting the enums / item classes it needs into `decls`. */
export function dartType(node: TypeNode, component: string, field: string, decls: DartDecl[], inArray = false): string {
  switch (node.kind) {
    case 'string': return 'String';
    case 'number': return node.integer ? 'int' : 'double';
    case 'boolean': return 'bool';
    case 'node': return 'Widget';
    case 'void': return 'void';
    case 'ref': return 'Object';
    case 'enum': {
      const name = enumType(component, field);
      if (!decls.some((d) => d.name === name)) decls.push({ kind: 'enum', name, values: (node.values ?? []).map(enumValue) });
      return name;
    }
    case 'array': return `List<${dartType(node.of!, component, field, decls, true)}>`;
    case 'object': {
      const name = itemClass(component, field, inArray);
      if (!decls.some((d) => d.name === name)) {
        const decl: DartDecl = { kind: 'class', name, fields: [] };
        decls.push(decl);
        for (const [k, f] of Object.entries(node.fields ?? {})) {
          const t = dartType(f, component, k, decls);
          decl.fields!.push({ name: k, type: f.optional && f.default === undefined ? `${t}?` : t, required: !f.optional, def: f.default === undefined ? undefined : dartLiteral(f.default, f, component, k) });
        }
      }
      return name;
    }
  }
}

export function dartLiteral(v: unknown, node: TypeNode, component: string, field: string): string {
  if (node.kind === 'enum') return `${enumType(component, field)}.${enumValue(String(v))}`;
  if (typeof v === 'string') return `'${v.replace(/\\/g, '\\\\').replace(/'/g, "\\'").replace(/\$/g, '\\$')}'`;
  if (typeof v === 'number') return node.kind === 'number' && !node.integer && Number.isInteger(v) ? `${v}.0` : String(v);
  if (Array.isArray(v)) return v.length ? `const [${v.map((x) => dartLiteral(x, node.of ?? node, component, field)).join(', ')}]` : 'const []';
  return JSON.stringify(v);
}

/** onPress, onChange, onRowPress */
export const callbackName = (event: string) => `on${event[0].toUpperCase()}${event.slice(1)}`;

/** The expected shape of the widget, as data (verify) and as Dart source (docs). */
export function flutterSignature(c: ComponentContract) {
  const decls: DartDecl[] = [];
  const params = Object.entries(c.props).map(([name, ty]) => {
    const t = dartType(ty, c.name, name, decls);
    const hasDefault = ty.default !== undefined;
    return { name, type: ty.optional && !hasDefault ? `${t}?` : t, required: !ty.optional, def: hasDefault ? dartLiteral(ty.default, ty, c.name, name) : undefined, node: ty };
  });
  const callbacks = Object.entries(c.events ?? {}).map(([ev, ty]) => {
    const payload = ty.kind === 'void' ? null : dartType(ty, c.name, `${ev}Event`, decls);
    return { event: ev, name: callbackName(ev), type: payload ? `ValueChanged<${payload}>?` : 'VoidCallback?' };
  });
  return { className: dartClass(c.name), file: dartFile(c.name), params, callbacks, child: !!c.children, decls };
}

/** Dart source the agent completes: declarations, constructor, fields. Only build() is left to write. */
export function renderFlutterSignature(c: ComponentContract): string {
  const s = flutterSignature(c);
  const L: string[] = [`// ${s.file}`, "import 'package:flutter/material.dart';", "import 'tokens.g.dart';", ''];
  for (const d of s.decls) {
    if (d.kind === 'enum') L.push(`enum ${d.name} { ${d.values!.join(', ')} }`, '');
    else {
      L.push(`class ${d.name} {`);
      L.push(`  const ${d.name}({${d.fields!.map((f) => (f.required && f.def === undefined ? `required this.${f.name}` : `this.${f.name}${f.def ? ` = ${f.def}` : ''}`)).join(', ')}});`);
      for (const f of d.fields!) L.push(`  final ${f.type} ${f.name};`);
      L.push('}', '');
    }
  }
  const ctor = ['super.key', ...s.params.map((p) => (p.required ? `required this.${p.name}` : `this.${p.name}${p.def ? ` = ${p.def}` : ''}`)), ...s.callbacks.map((cb) => `this.${cb.name}`), ...(s.child ? ['this.children = const []'] : [])];
  L.push(`class ${s.className} extends StatelessWidget {   // or StatefulWidget`);
  L.push(`  const ${s.className}({${ctor.join(', ')}});`, '');
  for (const p of s.params) L.push(`  final ${p.type} ${p.name};`);
  for (const cb of s.callbacks) L.push(`  final ${cb.type} ${cb.name};`);
  if (s.child) L.push('  final List<Widget> children;');
  L.push('', '  @override', '  Widget build(BuildContext context) { … }   // honour every rule above; sizes and colors from UiTokens', '}');
  return L.join('\n');
}

// ---------- generated files ----------

/** Write a generated file only when its content changed, so file watchers stay quiet. */
function writeIfChanged(file: string, content: string) {
  if (existsSync(file) && readFileSync(file, 'utf8') === content) return;
  mkdirSync(dirname(file), { recursive: true });
  writeFileSync(file, content);
}
const HEADER = (from: string) => `// GENERATED by fw from ${from}. Do not edit: every fw command rewrites it.\n// ignore_for_file: type=lint\n`;
const dartString = (s: string) => `'${s.replace(/\\/g, '\\\\').replace(/'/g, "\\'").replace(/\$/g, '\\$').replace(/\n/g, '\\n')}'`;

/** lib/ui/tokens.g.dart from project.ts tokens. */
export function tokensDart(config: ProjectConfig): string {
  const t = config.tokens;
  const color = (hex: string) => {
    const h = hex.replace('#', '');
    const full = h.length === 3 ? h.split('').map((c) => c + c).join('') : h;
    return `Color(0x${full.length === 8 ? full : `FF${full}`.toUpperCase()})`;
  };
  const L = [HEADER('ui-spec/project.ts'), "import 'dart:ui' show Color;", '', 'abstract final class UiTokens {'];
  for (const [k, v] of Object.entries(t.color)) L.push(`  static const Color color${pascal(k)} = ${color(v)};`);
  L.push(`  static const List<double> spacing = [${t.spacing.map((n) => `${n}`).join(', ')}];`);
  L.push('  /** spacing step, e.g. UiTokens.space(4) */', '  static double space(int step) => step < spacing.length ? spacing[step] : spacing.last;');
  for (const [k, v] of Object.entries(t.radius)) L.push(`  static const double radius${pascal(k)} = ${v};`);
  for (const [k, v] of Object.entries(t.font)) L.push(`  static const String font${pascal(k)} = ${dartString(v)};`);
  L.push('}', '');
  return L.join('\n');
}

/** cart.empty.title → cartEmptyTitle */
export const stringGetter = (key: string) => key.split('.').map((p, i) => (i === 0 ? p[0].toLowerCase() + p.slice(1) : p[0].toUpperCase() + p.slice(1))).join('').replace(/[^A-Za-z0-9_]/g, '');

/** lib/l10n/strings.g.dart: a dependency-free translation class. UiStrings.lang picks the language. */
export function stringsDart(languages: string[], strings: Map<string, Record<string, string>>): string {
  const def = strings.get(languages[0]) ?? {};
  const L = [HEADER('ui-spec/strings/'), 'abstract final class UiStrings {', `  static const List<String> languages = [${languages.map(dartString).join(', ')}];`, `  static String lang = ${dartString(languages[0])};`, ''];
  for (const [key, text] of Object.entries(def)) {
    const ps = [...new Set([...text.matchAll(/\{(\w+)\}/g)].map((m) => m[1]))];
    L.push(`  /// ${text.replace(/\n/g, ' ')}`);
    L.push(ps.length
      ? `  static String ${stringGetter(key)}({${ps.map((p) => `required Object ${p}`).join(', ')}}) => _t(${dartString(key)}, {${ps.map((p) => `${dartString(p)}: ${p}`).join(', ')}});`
      : `  static String get ${stringGetter(key)} => _t(${dartString(key)});`);
  }
  L.push('', '  static String _t(String key, [Map<String, Object> params = const {}]) {');
  L.push('    final text = _all[lang]?[key] ?? _all[languages.first]![key] ?? key;');
  L.push("    return text.replaceAllMapped(RegExp(r'\\{(\\w+)\\}'), (m) => params.containsKey(m[1]) ? '${params[m[1]]}' : m[0]!);", '  }', '');
  L.push('  static const Map<String, Map<String, String>> _all = {');
  for (const lang of languages) {
    L.push(`    ${dartString(lang)}: {`);
    for (const [k, v] of Object.entries(strings.get(lang) ?? {})) L.push(`      ${dartString(k)}: ${dartString(v)},`);
    L.push('    },');
  }
  L.push('  };', '}', '');
  return L.join('\n');
}

/** lib/ui/ui.dart: the one import screens use. */
export function barrelDart(uiFiles: string[], hasStrings: boolean): string {
  const L = [HEADER('the files in lib/ui/'), "export 'tokens.g.dart';", ...(hasStrings ? ["export '../l10n/strings.g.dart';"] : [])];
  for (const f of uiFiles.sort()) L.push(`export '${f}';`);
  return L.join('\n') + '\n';
}

export function writeFlutterFiles(root: string, config: ProjectConfig, uiFiles: string[], strings: Map<string, Record<string, string>>) {
  writeIfChanged(join(root, FLUTTER.ui, 'tokens.g.dart'), tokensDart(config));
  const langs = config.languages ?? [];
  if (langs.length) writeIfChanged(join(root, FLUTTER.l10n, 'strings.g.dart'), stringsDart(langs, strings));
  writeIfChanged(join(root, FLUTTER.ui, 'ui.dart'), barrelDart(uiFiles, langs.length > 0));
}
