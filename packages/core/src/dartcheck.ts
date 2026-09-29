// Screen code check for Flutter: the counterpart of codecheck.ts for lib/screens/*.dart.
import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs';
import { join, relative } from 'node:path';
import type { AppOutline } from './define.ts';
import { Report } from './diagnostics.ts';
import { closing, dartClasses, maskDart, splitTop } from './dart.ts';
import { FLUTTER } from './flutter.ts';
import { didYouMean } from './suggest.ts';
import type { TypeNode } from './types.ts';

/** Only these may come from package:flutter/widgets.dart in a screen (with `show`). */
export const SCREEN_BASE = ['StatelessWidget', 'StatefulWidget', 'State', 'Widget', 'BuildContext', 'Key', 'ValueKey', 'UniqueKey', 'VoidCallback', 'ValueChanged'];
/** Plain Dart types a screen may construct. */
const CORE = new Set(['List', 'Map', 'Set', 'Iterable', 'Duration', 'DateTime', 'Uri', 'RegExp', 'Future', 'Stream', 'Completer', 'Timer', 'Object', 'String', 'StringBuffer', 'Exception', 'StateError', 'ArgumentError', 'FormatException', 'UnimplementedError', 'Error', 'Symbol', 'Record', 'ValueKey', 'UniqueKey', 'Key']);
const WIDGET_BASES = /extends\s+(?:\w+\.)?(StatelessWidget|StatefulWidget|Widget|RenderObjectWidget|InheritedWidget)\b/;

export interface DartScreenCtx {
  outline?: { app: AppOutline; hasContract: (n: string) => boolean };
  /** Ui<Name> → props of the contract, for hard-coded text; undefined when the project has one language */
  text?: { props: (component: string) => Record<string, TypeNode> | undefined; languages: string[] };
  /** state-library wrappers a screen may construct (BlocBuilder, Obx…); what they build is still checked */
  wrappers?: string[];
}

export function checkDartScreens(root: string, paths: string[], ctx: DartScreenCtx = {}): Report[] {
  const files = paths.flatMap((p) => { const abs = join(root, p); return existsSync(abs) && statSync(abs).isFile() ? [abs] : walk(abs); }).filter((f) => f.endsWith('.dart') && !f.endsWith('.g.dart'));
  const { uiClasses, appClasses } = libClasses(root);
  const appName = pubspecName(root);
  return files.map((file) => {
    const rel = relative(root, file);
    const r = new Report(rel);
    const src = readFileSync(file, 'utf8');
    const m = maskDart(src);
    const line = (at: number) => m.slice(0, at).split('\n').length;

    // Imports: never the Material / Cupertino libraries; widgets.dart only with `show` of the base classes.
    for (const x of m.matchAll(/\bimport\s+(['"])/g)) {
      const q = x.index! + x[0].length - 1;
      const end = src.indexOf(x[1], q + 1);
      const uri = src.slice(q + 1, end);
      const tail = m.slice(end + 1, m.indexOf(';', end));
      const at = `line ${line(x.index!)}`;
      if (/^package:flutter\/(material|cupertino)\.dart$/.test(uri)) r.error(at, `imports ${uri}: screens compose from lib/ui/ only — import ${appName ? `package:${appName}/ui/ui.dart` : '../ui/ui.dart'} and, for the base classes, package:flutter/widgets.dart show ${SCREEN_BASE.slice(0, 5).join(', ')}`);
      else if (uri === 'package:flutter/widgets.dart') {
        const show = tail.match(/\bshow\s+([\w\s,]+)/);
        if (!show) r.error(at, `import package:flutter/widgets.dart with "show" and only the base classes: ${SCREEN_BASE.join(', ')}`);
        else for (const n of show[1].split(',').map((s) => s.trim()).filter(Boolean)) if (!SCREEN_BASE.includes(n)) r.error(at, `${n} from widgets.dart is a raw Flutter widget or helper: use a lib/ui component instead`);
      } else if (/^package:flutter\//.test(uri)) r.error(at, `imports ${uri}: screens only use lib/ui/ and the base classes of widgets.dart`);
    }

    // Classes in the screen file: one screen widget (plus its State); any other widget is a local component.
    const own = dartClasses(m);
    const widgets = own.filter((c) => WIDGET_BASES.test(c.header));
    for (const w of widgets.slice(1)) r.error(`line ${line(w.bodyStart)} class ${w.name}`, `locally defined widget: move it to lib/ui/ with a contract (fw docs / ui-spec/components/) and verify it`);
    const ownNames = new Set(own.map((c) => c.name));

    // Constructor calls: lib/ui classes, the app's own non-widget classes, or plain Dart types.
    for (const x of m.matchAll(/(?<![\w.$])(?:const\s+|new\s+)?([A-Z]\w*)(?:\s*<[^()]*?>)?(?:\.(\w+))?\s*\(/g)) {
      const name = x[1];
      const before = m.slice(Math.max(0, x.index! - 12), x.index!);
      if (/\b(class|extends|with|implements|enum|typedef)\s+$/.test(before)) continue;
      if (ctx.wrappers?.includes(name)) continue;
      if (uiClasses.has(name) || appClasses.has(name) || ownNames.has(name) || CORE.has(name)) {
        if (uiClasses.has(name) && ctx.outline && name.startsWith('Ui')) {
          const comp = name.slice(2);
          if (ctx.outline.hasContract(comp) && !ctx.outline.app.components.includes(comp))
            r.error(`line ${line(x.index!)} ${name}`, `${comp} is not in ui-spec/app.ts components. Add it to the outline first.`);
        }
        if (ctx.text && name.startsWith('Ui')) hardCodedText(src, m, x.index! + x[0].length - 1, name, ctx.text, r, line);
        continue;
      }
      const hint = uiClasses.has(`Ui${name}`) ? ` Use Ui${name} from lib/ui instead.` : didYouMean(`Ui${name}`, [...uiClasses.keys()]) || didYouMean(name, ctx.wrappers ?? []);
      r.error(`line ${line(x.index!)} ${name}(…)`, `${name} is not a lib/ui component or one of the app's own classes: raw Flutter and third-party widgets belong inside lib/ui/ behind a contract. A state-library wrapper that draws nothing (BlocBuilder, Obx…) is allowed when listed by stateLibrary or screenWrappers in ui-spec/project.ts.${hint}`);
    }
    return r;
  });
}

/** Named arguments of a Ui call whose contract prop is text must not be string literals with letters. */
function hardCodedText(src: string, m: string, open: number, cls: string, ctx: NonNullable<DartScreenCtx['text']>, r: Report, line: (at: number) => number) {
  const props = ctx.props(cls.slice(2));
  if (!props) return;
  const close = closing(m, open);
  if (close < 0) return;
  for (const [a, b] of splitTop(m, open + 1, close)) {
    const arg = m.slice(a, b).match(/^(\w+)\s*:/);
    if (!arg || !props[arg[1]]?.text) continue;
    const valueStart = a + arg[0].length;
    for (const lit of literalsAtTop(src, m, valueStart, b))
      r.error(`line ${line(a)} ${cls} ${arg[1]}`, `hard-coded text "${lit}" in a project with languages ${ctx.languages.join(', ')}: use UiStrings.<key> generated from ui-spec/strings/`);
  }
}

/** String literals directly in an expression (not inside nested calls), whose fixed part has letters. */
function literalsAtTop(src: string, m: string, start: number, end: number): string[] {
  const out: string[] = [];
  let depth = 0;
  for (let i = start; i < end; i++) {
    const ch = m[i];
    if (ch === '(' || ch === '[' || ch === '{') depth++;
    else if (ch === ')' || ch === ']' || ch === '}') depth--;
    else if ((ch === "'" || ch === '"') && depth === 0) {
      const triple = m.startsWith(ch.repeat(3), i);
      const q = triple ? ch.repeat(3) : ch;
      const close = m.indexOf(q, i + q.length);
      if (close < 0) break;
      const text = src.slice(i + q.length, close);
      const fixed = text.replace(/\$\{[^}]*\}/g, '').replace(/\$\w+/g, '');
      if (/\p{L}/u.test(fixed)) out.push(text);
      i = close + q.length - 1;
    }
  }
  return out;
}

/** Class names declared in lib/ui (with whether they are materialized components) and elsewhere in lib/ (non-widgets). */
function libClasses(root: string): { uiClasses: Map<string, boolean>; appClasses: Set<string> } {
  const uiClasses = new Map<string, boolean>(), appClasses = new Set<string>();
  const lib = join(root, 'lib');
  for (const f of walk(lib).filter((p) => p.endsWith('.dart'))) {
    const rel = relative(root, f);
    if (rel.startsWith(FLUTTER.screens + '/')) continue;
    const m = maskDart(readFileSync(f, 'utf8'));
    const inUi = rel.startsWith(FLUTTER.ui + '/') || rel.startsWith(FLUTTER.l10n + '/');
    for (const c of dartClasses(m)) {
      if (inUi) uiClasses.set(c.name, true);
      else if (!WIDGET_BASES.test(c.header)) appClasses.add(c.name);
    }
    for (const x of m.matchAll(/\benum\s+(\w+)/g)) (inUi ? uiClasses.set(x[1], true) : appClasses.add(x[1]));
  }
  return { uiClasses, appClasses };
}

export function pubspecName(root: string): string | null {
  const p = join(root, 'pubspec.yaml');
  if (!existsSync(p)) return null;
  return readFileSync(p, 'utf8').match(/^name:\s*([\w]+)/m)?.[1] ?? null;
}

function walk(dir: string): string[] {
  if (!existsSync(dir) || !statSync(dir).isDirectory()) return [];
  return readdirSync(dir).flatMap((f) => { const p = join(dir, f); return statSync(p).isDirectory() ? walk(p) : [p]; });
}
