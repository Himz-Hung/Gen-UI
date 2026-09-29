import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs';
import { join } from 'node:path';
import type { ScreenSpec } from './define.ts';
import { Report } from './diagnostics.ts';
import { DIRS, type Project } from './loader.ts';
import { didYouMean } from './suggest.ts';
import { stringGetter } from './flutter.ts';
import { isI18n, placeholders, type ValueCtx } from './values.ts';

export const stringsFile = (lang: string) => `${DIRS.spec}/strings/${lang}.ts`;

/** What the spec checker needs: the default language's strings. Undefined when the project declares no languages. */
export function i18nContext(project: Project): ValueCtx['i18n'] {
  const langs = project.config.languages;
  if (!langs?.length) return undefined;
  return { languages: langs, file: stringsFile(langs[0]), strings: project.strings.get(langs[0])?.flat ?? {} };
}

/**
 * ui-spec/strings/<lang>.ts against project.ts languages and against each other:
 * every language has the default language's keys, no extra keys, the same placeholders.
 * Keys that no spec and no source file mention are reported as unused.
 */
export function checkStrings(project: Project, specs: ScreenSpec[]): Report[] {
  const langs = project.config.languages ?? [];
  const reports: Report[] = [];
  if (!langs.length) {
    for (const [lang, s] of project.strings) {
      const r = new Report(s.file);
      r.warn('file', `ui-spec/project.ts declares no languages, so this file is not used. Add languages: ['${lang}', …] to use it.`);
      reports.push(r);
    }
    return reports;
  }
  const def = langs[0];
  const base = project.strings.get(def);
  for (const lang of langs) {
    const s = project.strings.get(lang);
    const r = new Report(s?.file ?? stringsFile(lang));
    reports.push(r);
    if (!s) { r.error('file', `missing: ui-spec/project.ts lists "${lang}" in languages${lang === def ? ' (the default language)' : ''}. Create it with defineStrings({ … }).`); continue; }
    for (const k of s.invalid) r.error(k, 'a value is a string, or an object of nested keys');
    if (lang === def || !base) continue;
    const missing = Object.keys(base.flat).filter((k) => s.flat[k] === undefined);
    if (missing.length) r.error('keys', `missing ${missing.length} translation${missing.length === 1 ? '' : 's'} of ${def}.ts: ${missing.join(', ')}`);
    for (const k of Object.keys(s.flat)) {
      if (base.flat[k] === undefined) { r.error(k, `not in ${def}.ts, the default language.${didYouMean(k, Object.keys(base.flat))} Add it there first, or remove it here.`); continue; }
      const a = placeholders(base.flat[k]).join(', '), b = placeholders(s.flat[k]).join(', ');
      if (a !== b) r.error(k, `placeholders {${b || 'none'}} here, but {${a || 'none'}} in ${def}.ts ("${base.flat[k]}")`);
    }
  }
  for (const [lang, s] of project.strings) if (!langs.includes(lang)) {
    const r = new Report(s.file);
    r.warn('file', `"${lang}" is not in the languages of ui-spec/project.ts [${langs.join(', ')}]`);
    reports.push(r);
  }

  if (base) {
    const used = new Set<string>();
    const visit = (v: unknown) => {
      if (isI18n(v)) { used.add(v.i18n); return; }
      if (Array.isArray(v)) v.forEach(visit);
      else if (typeof v === 'object' && v !== null) Object.values(v).forEach(visit);
    };
    for (const spec of specs) for (const el of Object.values(spec.elements ?? {})) visit(el.props);
    for (const lit of quotedInSource(join(project.root, 'src'))) used.add(lit);
    // Flutter code reads UiStrings.cartEmptyTitle: count the generated getter name as a use of cart.empty.title.
    const dartWords = wordsInDart(join(project.root, 'lib'));
    const unused = Object.keys(base.flat).filter((k) => !used.has(k) && !dartWords.has(`UiStrings.${stringGetter(k)}`));
    if (unused.length) reports[0].warn('keys', `not used by any spec or source file: ${unused.join(', ')}`);
  }
  return reports;
}

/** Every quoted string in src/, to see which keys the screen code passes to the i18n function. */
function quotedInSource(dir: string): Set<string> {
  const out = new Set<string>();
  const walk = (d: string) => {
    if (!existsSync(d)) return;
    for (const f of readdirSync(d)) {
      const p = join(d, f);
      if (statSync(p).isDirectory()) { if (f !== 'node_modules') walk(p); continue; }
      if (!/\.(tsx?|jsx?)$/.test(f)) continue;
      for (const m of readFileSync(p, 'utf8').matchAll(/['"`]([\w.-]+)['"`]/g)) out.add(m[1]);
    }
  };
  walk(dir);
  return out;
}

/** Every `UiStrings.x` reference in lib/ (generated files excluded). */
function wordsInDart(dir: string): Set<string> {
  const out = new Set<string>();
  const walk = (d: string) => {
    if (!existsSync(d)) return;
    for (const f of readdirSync(d)) {
      const p = join(d, f);
      if (statSync(p).isDirectory()) { walk(p); continue; }
      if (!f.endsWith('.dart') || f.endsWith('.g.dart')) continue;
      for (const m of readFileSync(p, 'utf8').matchAll(/UiStrings\.(\w+)/g)) out.add(m[0]);
    }
  };
  walk(dir);
  return out;
}

/** Progress line per non-default language. */
export function stringsProgress(project: Project): string[] {
  const langs = project.config.languages ?? [];
  const base = project.strings.get(langs[0]);
  if (langs.length < 2 || !base) return [];
  const keys = Object.keys(base.flat);
  return langs.slice(1).map((lang) => {
    const s = project.strings.get(lang);
    const missing = keys.filter((k) => s?.flat[k] === undefined);
    const line = `  ${`strings ${lang}`.padEnd(12)} ${String(keys.length - missing.length).padStart(3)}/${keys.length}`;
    if (!missing.length) return line;
    const shown = missing.slice(0, 6).join(', ') + (missing.length > 6 ? `, +${missing.length - 6} more` : '');
    return `${line}   todo: ${shown}  (${stringsFile(lang)})`;
  });
}
