import ts from 'typescript';
import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join, relative, resolve, dirname } from 'node:path';
import { Report } from './diagnostics.ts';
import { DIRS } from './loader.ts';
import { notInOutline } from './appcheck.ts';
import { didYouMean } from './suggest.ts';
import type { AppOutline } from './define.ts';
import type { TypeNode } from './types.ts';

/** Multi-language projects: which props of a component are text, and how code translates. */
export interface CodeI18n { props: (component: string) => Record<string, TypeNode> | undefined; languages: string[]; library?: string }

/**
 * Screens may only compose components from ui/. Any capitalized JSX tag in a
 * screen file must be imported from a path that resolves under ui/.
 * Lowercase (raw) markup is an error outside ui/.
 */
/** `dirs` may be folders or single .tsx/.jsx files, relative to root. With `outline`, tags must also be listed in ui-spec/app.ts. */
export function checkCode(root: string, dirs = ['src/screens', 'screens'], allowedImpl: string[] = [], outline?: { app: AppOutline; hasContract: (n: string) => boolean }, i18n?: CodeI18n, wrappers: string[] = []): Report[] {
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
        // Wrappers of the project's state / form libraries pass state and draw nothing; what they render is still checked.
        else if (wrappers.includes(tag.split('.')[0]) && !fromUi.has(tag.split('.')[0])) { /* allowed */ }
        else if (!fromUi.has(tag.split('.')[0])) {
          const from = fromElsewhere.get(tag.split('.')[0]);
          r.error(where, from ? `imported from "${from}", which is not ui/ or a registered impl (a state / form wrapper that draws nothing, like <FormProvider>, is allowed when listed by stateLibrary or screenWrappers in ui-spec/project.ts)${didYouMean(tag.split('.')[0], wrappers)}` : `not imported from ui/ (locally defined component?) — move it to ui/ and verify it.${didYouMean(tag.split('.')[0], [...fromUi, ...wrappers])}`);
        } else if (outline && !outline.app.components.includes(tag.split('.')[0])) {
          r.error(where, notInOutline(tag.split('.')[0], outline.app, outline.hasContract));
        }
        if (i18n) hardCodedText(n, tag, i18n, sf, r);
      }
      if (i18n && ts.isJsxText(n) && LETTERS.test(n.text)) {
        const { line } = sf.getLineAndCharacterOfPosition(n.getStart(sf));
        r.error(`line ${line + 1}`, `text "${n.text.trim()}" written directly in JSX: pass it to a text prop through ${how(i18n)}`);
      }
      n.forEachChild(visit);
    };
    visit(sf);
    reports.push(r);
  }
  return reports;
}

const LETTERS = /\p{L}/u;
const how = (i: CodeI18n) => `the project's i18n function${i.library ? ` (${i.library})` : ''} with a key from ui-spec/strings/`;

/**
 * String and template literals given to text props (at any depth: TopBar actions[].label, Select options[].label).
 * Only literals whose fixed part has letters count: `${a} × ${b}` is layout, `Cart (${n})` is text.
 * Values computed elsewhere (setState('…'), a variable) are not visible here.
 */
function hardCodedText(n: ts.JsxOpeningElement | ts.JsxSelfClosingElement, tag: string, i18n: CodeI18n, sf: ts.SourceFile, r: Report) {
  const props = i18n.props(tag.split('.')[0]);
  if (!props) return;
  const { line } = sf.getLineAndCharacterOfPosition(n.getStart(sf));
  const report = (lit: string, at: string) => r.error(`line ${line + 1} <${tag}> ${at}`, `hard-coded text "${lit}" in a project with languages ${i18n.languages.join(', ')}: use ${how(i18n)}`);
  const check = (e: ts.Expression, ty: TypeNode, at: string) => {
    if (ts.isParenthesizedExpression(e)) return check(e.expression, ty, at);
    if (ts.isConditionalExpression(e)) { check(e.whenTrue, ty, at); check(e.whenFalse, ty, at); return; }
    if (ts.isBinaryExpression(e) && [ts.SyntaxKind.BarBarToken, ts.SyntaxKind.QuestionQuestionToken].includes(e.operatorToken.kind)) { check(e.right, ty, at); return; }
    if (ty.kind === 'array' && ts.isArrayLiteralExpression(e)) { e.elements.forEach((x, i) => { if (!ts.isSpreadElement(x)) check(x, ty.of!, `${at}[${i}]`); }); return; }
    if (ty.kind === 'object' && ts.isObjectLiteralExpression(e)) {
      for (const p of e.properties) if (ts.isPropertyAssignment(p) && !ts.isComputedPropertyName(p.name)) {
        const f = ty.fields?.[p.name.getText(sf)];
        if (f) check(p.initializer, f, `${at}.${p.name.getText(sf)}`);
      }
      return;
    }
    if (!ty.text) return;
    if ((ts.isStringLiteral(e) || ts.isNoSubstitutionTemplateLiteral(e)) && LETTERS.test(e.text)) report(e.text, at);
    else if (ts.isTemplateExpression(e)) {
      const fixed = e.head.text + e.templateSpans.map((s) => s.literal.text).join('');
      if (LETTERS.test(fixed)) report(e.getText(sf).slice(1, -1), at);
    }
  };
  for (const a of n.attributes.properties) {
    if (!ts.isJsxAttribute(a) || !a.initializer) continue;
    const name = a.name.getText(sf), ty = props[name];
    if (!ty) continue;
    if (ts.isStringLiteral(a.initializer)) { if (ty.text && LETTERS.test(a.initializer.text)) report(a.initializer.text, name); }
    else if (ts.isJsxExpression(a.initializer) && a.initializer.expression) check(a.initializer.expression, ty, name);
  }
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
