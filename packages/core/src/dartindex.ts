import { existsSync, readFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { dartClasses, maskDart } from './dart.ts';

/** What a screen check needs to know about a class a screen can see. */
export interface DartSymbol { isWidget: boolean; ctors: Set<string> }

/**
 * A light index of the classes a Dart library makes visible: the library, its `export`s and `part`s, followed
 * through `.dart_tool/package_config.json` (so the Flutter SDK and pub packages resolve like the compiler resolves
 * them). No analyzer: class headers give the superclass (a class is a widget when its chain reaches Widget, or an
 * unindexed superclass whose name ends in Widget) and class bodies give the constructor names, which is what tells
 * `X(` / `X.named(` (a construction) from `X.of(context)` / `Get.toNamed(…)` (a static call).
 */
export class DartIndex {
  private packages = new Map<string, string>();
  private classes = new Map<string, { base?: string; ctors: Set<string> }>();
  private seen = new Set<string>();
  private widgetMemo = new Map<string, boolean>();

  constructor(root: string) {
    const cfg = join(root, '.dart_tool', 'package_config.json');
    if (!existsSync(cfg)) return;
    try {
      const json = JSON.parse(readFileSync(cfg, 'utf8')) as { packages: { name: string; rootUri: string; packageUri?: string }[] };
      for (const p of json.packages) {
        const rootDir = p.rootUri.startsWith('file:') ? fileURLToPath(p.rootUri) : resolve(dirname(cfg), p.rootUri);
        this.packages.set(p.name, join(rootDir, p.packageUri ?? 'lib/'));
      }
    } catch { /* unreadable config: nothing resolves, callers fall back to the old rule */ }
  }

  get ready(): boolean { return this.packages.size > 0; }

  /** package:x/y.dart → file; relative uris against `from`. dart: libraries → null. */
  resolveUri(uri: string, from?: string): string | null {
    if (uri.startsWith('dart:')) return null;
    const pkg = uri.match(/^package:([^/]+)\/(.+)$/);
    if (pkg) { const base = this.packages.get(pkg[1]); return base ? join(base, pkg[2]) : null; }
    return from ? resolve(dirname(from), uri) : null;
  }

  /** Index a library and everything it exports (transitively). */
  addLibrary(file: string): void {
    if (this.seen.has(file) || !existsSync(file)) return;
    this.seen.add(file);
    this.widgetMemo.clear();
    const src = readFileSync(file, 'utf8');
    const m = maskDart(src);
    for (const c of dartClasses(m)) {
      const base = c.header.match(/\bextends\s+([A-Za-z_]\w*)/)?.[1];
      const body = m.slice(c.bodyStart, c.bodyEnd);
      const ctors = new Set<string>();
      // a declaration starts a member at the top level of the class body (depth 0), never a call inside a method
      const depth = new Int32Array(body.length + 1);
      for (let i = 0, d = 0; i < body.length; i++) { const ch = body[i]; if (ch === '{' || ch === '(' || ch === '[') d++; else if (ch === '}' || ch === ')' || ch === ']') d--; depth[i + 1] = d; }
      for (const x of body.matchAll(new RegExp(`(?:^|[;{}])\\s*(?:@\\w+(?:\\([^)]*\\))?\\s*)*(?:const\\s+|factory\\s+|external\\s+)*${c.name}(?:\\.(\\w+))?\\s*\\(`, 'g'))) {
        const at = x.index! + x[0].length - 1;   // the "(" of the declaration
        if (depth[at] === 0) ctors.add(x[1] ?? '');  // the body starts after the class "{": members sit at depth 0
      }
      if (!ctors.size) ctors.add('');
      if (!this.classes.has(c.name)) this.classes.set(c.name, { base, ctors });
    }
    // export 'x.dart'; part 'y.dart';  (uris are masked in m, read them from src at the same offsets)
    for (const x of m.matchAll(/\b(export|part)\s+(['"])/g)) {
      if (x[1] === 'part' && /^\s*of\b/.test(m.slice(x.index! + 4))) continue;
      const q = x.index! + x[0].length - 1;
      const end = src.indexOf(x[2], q + 1);
      const target = this.resolveUri(src.slice(q + 1, end), file);
      if (target) this.addLibrary(target);
    }
  }

  get(name: string): DartSymbol | undefined {
    const c = this.classes.get(name);
    return c && { isWidget: this.isWidget(name), ctors: c.ctors };
  }

  isWidget(name: string, depth = 0): boolean {
    if (name === 'Widget') return true;
    const memo = this.widgetMemo.get(name);
    if (memo !== undefined) return memo;
    const c = this.classes.get(name);
    const out = !c ? /Widget$/.test(name) : !c.base || depth > 40 ? false : this.isWidget(c.base, depth + 1);
    this.widgetMemo.set(name, out);
    return out;
  }
}
