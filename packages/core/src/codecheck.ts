import ts from 'typescript';
import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join, relative, resolve, dirname } from 'node:path';
import { Report } from './diagnostics.ts';
import { DIRS } from './loader.ts';

/**
 * Screens may only compose components from ui/. Any capitalized JSX tag in a
 * screen file must be imported from a path that resolves under ui/.
 * Lowercase (raw) markup is an error outside ui/.
 */
/** `dirs` may be folders or single .tsx/.jsx files, relative to root. */
export function checkCode(root: string, dirs = ['src/screens', 'screens'], allowedImpl: string[] = []): Report[] {
  const reports: Report[] = [];
  const uiDir = resolve(root, DIRS.ui);
  const allowed = allowedImpl.map((p) => resolve(root, p).replace(/\.(tsx|ts|jsx|js)$/, ''));
  const files = dirs.flatMap((d) => { const p = join(root, d); return /\.(tsx|jsx)$/.test(d) && statSync(p).isFile() ? [p] : walk(p, /\.(tsx|jsx)$/); });
  for (const file of files) {
    if (allowed.includes(resolve(file).replace(/\.(tsx|ts|jsx|js)$/, ''))) continue; // registered component impl, checked by fw verify
    const r = new Report(relative(root, file));
    const src = readFileSync(file, 'utf8');
    const sf = ts.createSourceFile(file, src, ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX);
    const fromUi = new Set<string>();
    const fromElsewhere = new Map<string, string>();
    sf.forEachChild((n) => {
      if (!ts.isImportDeclaration(n) || !n.importClause) return;
      const spec = (n.moduleSpecifier as ts.StringLiteral).text;
      const abs = spec.startsWith('.') ? resolve(dirname(file), spec) : spec.startsWith('@/ui') || spec.startsWith('~/ui') ? join(uiDir, spec.slice(spec.indexOf('ui') + 2)) : null;
      const isUi = !!abs && (abs.startsWith(uiDir) || allowed.includes(abs.replace(/\.(tsx|ts|jsx|js)$/, '')));
      const names: string[] = [];
      if (n.importClause.name) names.push(n.importClause.name.text);
      const nb = n.importClause.namedBindings;
      if (nb && ts.isNamedImports(nb)) for (const e of nb.elements) names.push(e.name.text);
      for (const nm of names) isUi ? fromUi.add(nm) : fromElsewhere.set(nm, spec);
    });
    const visit = (n: ts.Node) => {
      if (ts.isJsxOpeningElement(n) || ts.isJsxSelfClosingElement(n)) {
        const tag = n.tagName.getText(sf);
        const { line } = sf.getLineAndCharacterOfPosition(n.getStart(sf));
        const where = `line ${line + 1} <${tag}>`;
        if (/^[a-z]/.test(tag)) r.error(where, 'raw markup outside ui/ — compose from ui/ components instead');
        else if (!fromUi.has(tag.split('.')[0])) {
          const from = fromElsewhere.get(tag.split('.')[0]);
          r.error(where, from ? `imported from "${from}", which is not ui/ or a registered impl` : 'not imported from ui/ (locally defined component?) — move it to ui/ and verify it');
        }
      }
      n.forEachChild(visit);
    };
    visit(sf);
    reports.push(r);
  }
  return reports;
}

function walk(dir: string, re: RegExp): string[] {
  try { if (!statSync(dir).isDirectory()) return []; } catch { return []; }
  const out: string[] = [];
  for (const f of readdirSync(dir)) {
    const p = join(dir, f);
    if (statSync(p).isDirectory()) { if (f !== 'node_modules') out.push(...walk(p, re)); }
    else if (re.test(f)) out.push(p);
  }
  return out;
}
