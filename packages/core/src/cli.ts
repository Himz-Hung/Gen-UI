#!/usr/bin/env node
import { basename, extname, join, relative, resolve, sep } from 'node:path';
import { existsSync, readdirSync, statSync } from 'node:fs';
import { loadProject, findRoot, readSpec, DIRS, type Project } from './loader.ts';
import { buildCatalog, writeCatalog } from './catalog.ts';
import { writeRules } from './rules.ts';
import { checkSpec } from './check.ts';
import { checkFlows } from './flowcheck.ts';
import { checkCode } from './codecheck.ts';
import { checkApp, progress, APP_FILE } from './appcheck.ts';
import { checkStrings, i18nContext } from './i18ncheck.ts';
import type { CodeI18n } from './codecheck.ts';
import { verifyReact } from './verify.ts';
import { verifyFlutter } from './dart.ts';
import { checkDartScreens } from './dartcheck.ts';
import { FLUTTER, writeFlutterFiles, dartFile } from './flutter.ts';
import { renderDocs, renderScreen } from './docs.ts';
import { didYouMean } from './suggest.ts';
import { addReactComponent } from './add.ts';
import { init } from './init.ts';
import type { Catalog } from './define.ts';
import type { Report } from './diagnostics.ts';

const [cmd, ...rest] = process.argv.slice(2);
const flags = new Map<string, string>();
const args: string[] = [];
for (let i = 0; i < rest.length; i++) {
  const a = rest[i];
  if (!a.startsWith('--')) { args.push(a); continue; }
  const [k, v] = a.slice(2).split('=');
  flags.set(k, v ?? (rest[i + 1] && !rest[i + 1].startsWith('--') ? rest[++i] : 'true'));
}

const HELP = `fw — contract-driven UI for coding agents

  fw init --agent <claude|cursor|codex|copilot> --platform <react|flutter> [--name "App"] [--create vite|next|flutter]
  fw add <file.tsx> [--name X]     register an existing component as a contract
  fw check                          check everything: outline, components, screens, specs, navigation, screen code
  fw check <path...>                check just these: *.ui.json specs, *.tsx screens, folders, ui-spec/screens, ui-spec/strings, ui-spec/app.ts

agent-side:
  fw docs <Name>                    print a contract (read before writing ui/<Name>), or a screen as a readable tree
  fw verify [<Name>...]             components in ui/ (React) or lib/ui/ (Flutter) against their contracts (all when no name)

Every command refreshes ui.catalog.json and the agent rules first. Exit 0 pass · 1 findings · 2 usage.
`;

async function main() {
  switch (cmd) {
    case undefined: case 'help': case '--help': case '-h': console.log(HELP); return;

    case 'init': {
      const agent = flags.get('agent'), platform = flags.get('platform'), create = flags.get('create');
      const AGENTS = ['claude', 'cursor', 'codex', 'copilot'], PLATFORMS = ['react', 'flutter'], CREATES = ['vite', 'next', 'flutter'];
      if (!agent || !AGENTS.includes(agent)) fail(`--agent must be one of ${AGENTS.join(', ')}`);
      if (!platform || !PLATFORMS.includes(platform)) fail(`--platform must be one of ${PLATFORMS.join(', ')}`);
      if (create !== undefined && !CREATES.includes(create)) fail(`--create must be one of ${CREATES.join(', ')}`);
      const root = resolve(process.cwd());
      const made = init(root, { agent: agent as never, platform: platform as never, create: create as never, name: flags.get('name') });
      for (const m of made) console.log(`created  ${m}`);
      await sync(root);
      console.log('\nNext: list every screen and component in ui-spec/app.ts (the outline), describe each screen in ui-spec/screens/, then ask your agent to build one. `fw check` verifies everything and shows what is left.');
      return;
    }

    case 'add': {
      const file = args[0]; if (!file || !existsSync(file)) fail('fw add <file.tsx>');
      const root = findRoot();
      const { project: pre } = await sync(root);
      if (!pre.config.platforms.includes('react')) fail('fw add registers React components only. For Flutter, write the contract in ui-spec/components/<Name>.rule.ts and point impl.flutter at the file.');
      const { contractFile, name, todo } = addReactComponent(root, resolve(file), flags.get('name'));
      console.log(`created  ${contractFile}  (component ${name})`);
      for (const t of todo) console.log(`todo     ${t}`);
      const { project, catalog } = await sync(root);
      const rs = verifyOne(project, catalog, name);
      writeCatalog(root, catalog);
      finish(rs);
    }

    case 'docs': {
      const name = args[0]; if (!name) fail('fw docs <Name>');
      const { project, catalog } = await sync(findRoot());
      const screenNames = [...new Set([...Object.keys(project.app?.screens ?? {}), ...project.screens.map((x) => x.name)])];
      const c = project.contracts.get(name);
      if (c) {
        if (screenNames.includes(name)) console.log(`> ${name} is both a component and a screen; showing the component. Give the screen another name.\n`);
        console.log(renderDocs(c.contract, project.config.platforms));
        return;
      }
      if (screenNames.includes(name)) {
        const specFile = collect([resolve(project.root, DIRS.screens)], project.root).specs.find((f) => readSpec(f).screen === name);
        const langs = project.config.languages ?? [];
        console.log(renderScreen({
          name, purpose: project.app?.screens[name], info: project.screens.find((x) => x.name === name), catalog,
          spec: specFile ? { file: relative(project.root, specFile), spec: readSpec(specFile) } : undefined,
          strings: langs.length ? project.strings.get(langs[0])?.flat : undefined,
        }));
        return;
      }
      fail(`no component or screen named ${name}.${didYouMean(name, [...project.contracts.keys(), ...screenNames])} Components: ${[...project.contracts.keys()].join(', ')}. Screens: ${screenNames.join(', ') || 'none'}`);
    }

    case 'verify': {
      const { project, catalog } = await sync(findRoot());
      const reports = verifyMany(project, catalog, args.length ? args : undefined);
      writeCatalog(project.root, catalog);
      finish(reports);
    }

    case 'check': {
      const { project, catalog } = await sync(findRoot());
      const reports: Report[] = [];
      const outline = project.app && { app: project.app, hasContract: (n: string) => project.contracts.has(n) };
      if (!args.length) {
        // everything: outline → components → specs → screen descriptions + navigation → screen code
        if (project.app) reports.push(checkApp(project));
        reports.push(...verifyMany(project, catalog));
        writeCatalog(project.root, catalog);
        const specs = collect([resolve(project.root, DIRS.screens)], project.root).specs;
        reports.push(...checkSpecs(project, catalog, specs));
        reports.push(...checkFlows(project, specs.map((f) => ({ file: f, spec: readSpec(f) }))));
        reports.push(...checkStrings(project, specs.map(readSpec)));
        reports.push(...screenCode(project, catalog, [...(platformsOf(project).includes('react') ? ['src/screens', 'screens'] : []), ...(platformsOf(project).includes('flutter') ? [FLUTTER.screens] : [])]));
        const notes = project.app
          ? progress(project, catalog, specs.map(readSpec), platformsOf(project))
          : [`hint  no ${APP_FILE}: outline checks skipped. Add one (defineApp) to list every screen and component up front.`];
        finish(reports, notes);
      } else {
        const targets = collect(args.map((a) => resolve(a)), project.root);
        if (targets.app) {
          if (!project.app) fail(`${APP_FILE} not found`);
          reports.push(checkApp(project));
        }
        reports.push(...checkSpecs(project, catalog, targets.specs));
        if (targets.flow) reports.push(...checkFlows(project, collect([resolve(project.root, DIRS.screens)], project.root).specs.map((f) => ({ file: f, spec: readSpec(f) }))));
        if (targets.strings) reports.push(...checkStrings(project, collect([resolve(project.root, DIRS.screens)], project.root).specs.map(readSpec)));
        if (targets.code.length) reports.push(...screenCode(project, catalog, targets.code));
        if (!targets.app && !targets.strings && !targets.specs.length && !targets.flow && !targets.code.length) fail(`nothing to check in: ${args.join(' ')} (expected *.ui.json, *.tsx/*.jsx/*.dart, folders, ui-spec/screens, ui-spec/strings, ui-spec/flows or ${APP_FILE})`);
        finish(reports);
      }
    }

    default: fail(`unknown command "${cmd}"\n\n${HELP}`);
  }
}

// ---------- helpers ----------

/** Rebuild catalog + agent rules. Cheap, so every command does it. */
async function sync(root: string): Promise<{ project: Project; catalog: Catalog }> {
  const project = await loadProject(root);
  const catalog = buildCatalog(project);
  writeCatalog(root, catalog);
  writeRules(root, project.config, catalog, !!project.app);
  if (platformsOf(project).includes('flutter')) {
    // Dart cannot import TypeScript: tokens, strings and the lib/ui barrel are generated from ui-spec/.
    const uiDir = join(root, FLUTTER.ui);
    const uiFiles = existsSync(uiDir) ? readdirSync(uiDir).filter((f) => f.endsWith('.dart') && !f.endsWith('.g.dart') && f !== 'ui.dart') : [];
    writeFlutterFiles(root, project.config, uiFiles, new Map([...project.strings].map(([k, v]) => [k, v.flat])));
  }
  return { project, catalog };
}

type Platform = 'react' | 'flutter';
function platformsOf(project: Project): Platform[] {
  const ps = project.config.platforms;
  for (const p of ps) if (p !== 'react' && p !== 'flutter') fail(`platform "${p}" is not supported (react, flutter)`);
  if (!ps.length) fail('ui-spec/project.ts platforms is empty');
  return ps;
}

/** One report per platform of the project. */
function verifyOne(project: Project, catalog: Catalog, name: string): Report[] {
  const c = project.contracts.get(name); if (!c) fail(`no contract named ${name}`);
  const entry = catalog.components[name];
  return platformsOf(project).map((p) => {
    const { report, implPath } = p === 'react' ? verifyReact(project.root, c.contract) : verifyFlutter(project.root, c.contract);
    if (entry) { if (implPath) entry.impl[p] = implPath; else delete entry.impl[p]; }
    return report;
  });
}

/** With names: those. Without: every contract that has a file (unmaterialized ones are skipped silently). */
function verifyMany(project: Project, catalog: Catalog, names?: string[]): Report[] {
  const out: Report[] = [];
  for (const n of names ?? [...project.contracts.keys()]) {
    for (const r of verifyOne(project, catalog, n)) {
      if (!names && r.items.length === 1 && r.items[0].where === 'file') continue;
      out.push(r);
    }
  }
  return out;
}

function checkSpecs(project: Project, catalog: Catalog, files: string[]): Report[] {
  const platforms = platformsOf(project);
  return files.map((f) => checkSpec(readSpec(f), catalog, relative(project.root, f), { domain: project.domain, platforms, app: project.app, screens: project.screens, i18n: i18nContext(project) }));
}

/** Screen code: *.tsx / *.jsx through the React check, *.dart through the Flutter check. */
function screenCode(project: Project, catalog: Catalog, paths: string[]): Report[] {
  const outline = project.app && { app: project.app, hasContract: (n: string) => project.contracts.has(n) };
  const isDart = (p: string) => p.endsWith('.dart') || p === FLUTTER.screens || p.startsWith(FLUTTER.screens + '/') || p.startsWith('lib/');
  const dart = paths.filter(isDart), web = paths.filter((p) => !isDart(p));
  const langs = project.config.languages ?? [];
  const out: Report[] = [];
  if (web.length) out.push(...checkCode(project.root, web, allowedImpl(catalog), outline, codeI18n(project, catalog)));
  if (dart.length) out.push(...checkDartScreens(project.root, dart, {
    outline,
    text: langs.length > 1 ? { props: (n) => catalog.components[n]?.props, languages: langs } : undefined,
  }));
  return out;
}

/** Hard-coded text is only an error in code when the project has several languages. */
function codeI18n(project: Project, catalog: Catalog): CodeI18n | undefined {
  const langs = project.config.languages ?? [];
  if (langs.length < 2) return undefined;
  return { props: (n) => catalog.components[n]?.props, languages: langs, library: project.config.i18nLibrary };
}

function allowedImpl(catalog: Catalog): string[] {
  return Object.values(catalog.components).flatMap((c) => Object.values(c.impl));
}

/** Classify paths: *.ui.json → specs, *.tsx/*.jsx → code, anything under ui-spec/screens or ui-spec/flows → navigation, ui-spec/app.ts → outline. Folders recurse. */
function collect(paths: string[], root: string): { specs: string[]; code: string[]; flow: boolean; app: boolean; strings: boolean } {
  const out = { specs: [] as string[], code: [] as string[], flow: false, app: false, strings: false };
  const navDirs = [resolve(root, DIRS.spec, 'flows'), resolve(root, DIRS.spec, 'screens'), resolve(root, DIRS.spec, 'domain.ts')];
  const appFile = resolve(root, APP_FILE);
  const visit = (p: string) => {
    if (!existsSync(p)) fail(`not found: ${relative(root, p)}`);
    if (p === appFile) { out.app = true; return; }
    const stringsDir = resolve(root, DIRS.spec, 'strings');
    if (p === stringsDir || p.startsWith(stringsDir + sep)) { out.strings = true; return; }
    if (navDirs.some((d) => p === d || p.startsWith(d + sep))) { out.flow = true; return; }
    if (statSync(p).isDirectory()) {
      if (basename(p) === 'node_modules' || basename(p) === DIRS.ui) return;
      for (const f of readdirSync(p)) visit(resolve(p, f));
      return;
    }
    if (p.endsWith('.ui.json')) out.specs.push(p);
    else if (['.tsx', '.jsx', '.dart'].includes(extname(p)) && !p.endsWith('.g.dart')) out.code.push(relative(root, p));
  };
  paths.forEach(visit);
  out.specs.sort(); out.code.sort();
  return out;
}

function finish(reports: Report[], notes: string[] = []): never {
  for (const r of reports) r.print();
  if (notes.length) console.log(`─────\n${notes.join('\n')}`);
  const failed = reports.filter((r) => !r.ok).length;
  console.log(`─────\n${failed} failed, ${reports.length - failed} passed`);
  process.exit(failed ? 1 : 0);
}

function fail(msg: string): never { console.error(`fw: ${msg}`); process.exit(2); }

main().catch((e) => { console.error(`fw: ${e instanceof Error ? e.message : e}`); process.exit(2); });
