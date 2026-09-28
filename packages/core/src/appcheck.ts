import { existsSync, readdirSync } from 'node:fs';
import { join, basename, extname } from 'node:path';
import type { AppOutline, Catalog, ScreenSpec } from './define.ts';
import { Report } from './diagnostics.ts';
import { DIRS, type Project } from './loader.ts';
import { didYouMean, suggest } from './suggest.ts';
import { parseTypeString, refsIn } from './types.ts';
import { stringsProgress } from './i18ncheck.ts';

export const APP_FILE = `${DIRS.spec}/app.ts`;

/**
 * The outline (ui-spec/app.ts) is the list of names everything else may use.
 * Here: outline components must have a contract, screen descriptions must be in
 * the outline, and components in ui/ that the outline does not list are flagged.
 * Screens and components listed but not yet detailed are NOT errors: see progress().
 */
export function checkApp(project: Project): Report {
  const r = new Report(APP_FILE);
  const app = project.app!;
  const contracts = [...project.contracts.keys()];

  app.components.forEach((name, i) => {
    if (!project.contracts.has(name))
      r.error(`components[${i}]`, `"${name}" has no contract.${didYouMean(name, contracts)} Shipped ones are in ui-rules/; for a new one write ui-spec/components/${name}.rule.ts or run fw add <file>.`);
  });

  const screens = Object.keys(app.screens);
  for (const d of project.screens) {
    if (!app.screens[d.name])
      r.error(d.file, `screen "${d.name}" is not in ${APP_FILE} screens.${didYouMean(d.name, screens)} ${d.format === 'detail' ? 'Rename the file or add' : 'Add'} it to the outline first.`);
  }

  const listed = new Set(app.components);
  for (const name of uiFiles(project.root)) {
    if (project.contracts.has(name) && !listed.has(name)) {
      const typo = suggest(name, app.components.filter((c) => !project.contracts.has(c)));
      r.warn(`${DIRS.ui}/${name}`, typo
        ? `${name} is implemented but the outline lists "${typo.name}" instead. Fix the typo.`
        : `${name} is implemented but not listed in components. List it, or delete ui/${name} if no screen needs it.`);
    }
  }
  return r;
}

/**
 * Message for a component that exists (has a contract) but is used without being in the outline.
 * If the outline holds a near-miss with no contract ("Buton"), the outline has the typo, so say that
 * instead of suggesting the typo back.
 */
export function notInOutline(name: string, app: AppOutline, hasContract: (n: string) => boolean): string {
  const typo = suggest(name, app.components.filter((c) => !hasContract(c)));
  if (typo) return `${name} is not in ${APP_FILE} components, which lists "${typo.name}" (no such contract). Fix the typo in ${APP_FILE}.`;
  return `${name} is in the catalog but not in ${APP_FILE} components. Add it to the outline first.`;
}

/**
 * What is done and what is left, per outline entry. Informational only:
 * an outlined screen with no spec yet is work to do, not a failure.
 */
export function progress(project: Project, catalog: Catalog, specs: ScreenSpec[], platform: 'react' | 'flutter'): string[] {
  const app = project.app!;
  const screens = Object.keys(app.screens);
  const described = new Set(project.screens.map((d) => d.name));
  const specced = new Set(specs.map((s) => s.screen));
  const coded = new Set(screens.filter((s) => existsSync(join(project.root, 'src', DIRS.screens, `${s}Screen.tsx`))));
  const built = new Set(app.components.filter((c) => catalog.components[c]?.impl[platform]));

  const stage = (label: string, done: Set<string>, of: string[], hint: string) => {
    const missing = of.filter((n) => !done.has(n));
    const line = `  ${label.padEnd(12)} ${String(of.length - missing.length).padStart(3)}/${of.length}`;
    return missing.length ? `${line}   todo: ${missing.join(', ')}  (${hint})` : line;
  };
  // Domain types used by screens, specs and other domain types, but not declared yet.
  const used = new Set<string>([
    ...project.screens.flatMap((s) => Object.values({ ...s.data, ...s.params })),
    ...specs.flatMap((s) => Object.values(s.data ?? {})),
  ].filter((v): v is string => typeof v === 'string').flatMap((v) => refsIn(parseTypeString(v))));
  for (const ty of Object.values(project.domain)) refsIn(ty).forEach((n) => used.add(n));
  const declared = new Set(Object.keys(project.domain));
  return [
    `Outline  ${APP_FILE}: ${plural(screens.length, 'screen')}, ${plural(app.components.length, 'component')}`,
    ...(used.size ? [stage('domain', declared, [...used].sort(), `${DIRS.spec}/domain.ts`)] : []),
    stage('described', described, screens, `${DIRS.spec}/screens/<name>.ts`),
    stage('spec', specced, screens, `${DIRS.screens}/<name>.ui.json`),
    stage('code', coded, screens, `src/${DIRS.screens}/<Name>Screen.tsx`),
    stage('in ui/', built, app.components, 'fw docs <Name>, write ui/<Name>, fw verify <Name>'),
    ...stringsProgress(project),
    ...navigationMap(project),
  ];
}

/** Where each outline screen leads, from goTo / back (and 1.0 flows). Read-only picture of the app. */
function navigationMap(project: Project): string[] {
  const app = project.app!;
  const out = new Map<string, string[]>();
  const tags = new Map<string, string>();
  const add = (from: string, to: string) => out.set(from, [...new Set([...(out.get(from) ?? []), to])]);
  for (const s of project.screens) {
    for (const e of s.nav) add(s.name, e.mode === 'push' ? e.to : `${e.to} (${e.mode})`);
    if (s.format === 'detail') tags.set(s.name, !s.back ? 'no back' : s.backFallback ? `back, else ${s.backFallback}` : 'back');
  }
  for (const f of project.flows) for (const [n, sc] of Object.entries(f.screens))
    for (const tr of Object.values(sc.on ?? {})) if ('go' in tr) add(n, tr.mode && tr.mode !== 'push' ? `${tr.go} (${tr.mode})` : tr.go);
  const names = Object.keys(app.screens);
  if (!names.some((n) => out.has(n) || tags.has(n))) return [];
  const w = Math.max(...names.map((n) => n.length));
  return ['Navigation', ...names.map((n, i) =>
    `  ${n.padEnd(w)}  → ${(out.get(n) ?? []).join(', ') || '(nowhere)'}${tags.has(n) ? `   [${tags.get(n)}]` : ''}${i === 0 ? '   (first screen)' : ''}`)];
}

const plural = (n: number, word: string) => `${n} ${word}${n === 1 ? '' : 's'}`;

function uiFiles(root: string): string[] {
  const dir = join(root, DIRS.ui);
  if (!existsSync(dir)) return [];
  return readdirSync(dir).filter((f) => /\.(tsx|jsx|dart)$/.test(f)).map((f) => basename(f, extname(f)));
}
