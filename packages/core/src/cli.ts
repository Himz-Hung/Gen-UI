#!/usr/bin/env node
import { basename, extname, relative, resolve, sep } from 'node:path';
import { existsSync, readdirSync, statSync } from 'node:fs';
import { loadProject, findRoot, readSpec, DIRS, type Project } from './loader.ts';
import { buildCatalog, writeCatalog } from './catalog.ts';
import { writeRules } from './rules.ts';
import { checkSpec } from './check.ts';
import { checkFlows } from './flowcheck.ts';
import { checkCode } from './codecheck.ts';
import { checkApp, progress, APP_FILE } from './appcheck.ts';
import { verifyReact } from './verify.ts';
import { renderDocs } from './docs.ts';
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
  fw check <path...>                check just these: *.ui.json specs, *.tsx screens, folders, ui-spec/screens, ui-spec/flows, ui-spec/app.ts

agent-side:
  fw docs <Name>                    print a contract (read before writing ui/<Name>)
  fw verify [<Name>...]             components in ui/ against their contracts (all when no name)

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
      const { contractFile, name, todo } = addReactComponent(root, resolve(file), flags.get('name'));
      console.log(`created  ${contractFile}  (component ${name})`);
      for (const t of todo) console.log(`todo     ${t}`);
      const { project, catalog } = await sync(root);
      const r = verifyOne(project, catalog, name);
      writeCatalog(root, catalog);
      finish([r]);
    }

    case 'docs': {
      const name = args[0]; if (!name) fail('fw docs <Name>');
      const { project } = await sync(findRoot());
      const c = project.contracts.get(name); if (!c) fail(`no contract named ${name}. Known: ${[...project.contracts.keys()].join(', ')}`);
      console.log(renderDocs(c.contract, project.config.platforms[0]));
      return;
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
        reports.push(...checkCode(project.root, ['src/screens', 'screens'], allowedImpl(catalog), outline));
        const notes = project.app
          ? progress(project, catalog, specs.map(readSpec), platformOf(project))
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
        if (targets.code.length) reports.push(...checkCode(project.root, targets.code, allowedImpl(catalog), outline));
        if (!targets.app && !targets.specs.length && !targets.flow && !targets.code.length) fail(`nothing to check in: ${args.join(' ')} (expected *.ui.json, *.tsx/*.jsx, folders, ui-spec/screens, ui-spec/flows or ${APP_FILE})`);
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
  return { project, catalog };
}

function platformOf(project: Project): 'react' | 'flutter' {
  const p = project.config.platforms[0];
  if (p !== 'react') fail(`platform "${p}" is not supported in this version (react only)`);
  return p;
}

function verifyOne(project: Project, catalog: Catalog, name: string): Report {
  const c = project.contracts.get(name); if (!c) fail(`no contract named ${name}`);
  platformOf(project);
  const { report, implPath } = verifyReact(project.root, c.contract);
  const entry = catalog.components[name];
  if (entry) { if (implPath) entry.impl.react = implPath; else delete entry.impl.react; }
  return report;
}

/** With names: those. Without: every contract that has a file (unmaterialized ones are skipped silently). */
function verifyMany(project: Project, catalog: Catalog, names?: string[]): Report[] {
  const out: Report[] = [];
  for (const n of names ?? [...project.contracts.keys()]) {
    const r = verifyOne(project, catalog, n);
    if (!names && r.items.length === 1 && r.items[0].where === 'file') continue;
    out.push(r);
  }
  return out;
}

function checkSpecs(project: Project, catalog: Catalog, files: string[]): Report[] {
  const platform = platformOf(project);
  return files.map((f) => checkSpec(readSpec(f), catalog, relative(project.root, f), { domain: project.domain, platform, app: project.app, screens: project.screens }));
}

function allowedImpl(catalog: Catalog): string[] {
  return Object.values(catalog.components).flatMap((c) => Object.values(c.impl));
}

/** Classify paths: *.ui.json → specs, *.tsx/*.jsx → code, anything under ui-spec/screens or ui-spec/flows → navigation, ui-spec/app.ts → outline. Folders recurse. */
function collect(paths: string[], root: string): { specs: string[]; code: string[]; flow: boolean; app: boolean } {
  const out = { specs: [] as string[], code: [] as string[], flow: false, app: false };
  const navDirs = [resolve(root, DIRS.spec, 'flows'), resolve(root, DIRS.spec, 'screens'), resolve(root, DIRS.spec, 'domain.ts')];
  const appFile = resolve(root, APP_FILE);
  const visit = (p: string) => {
    if (!existsSync(p)) fail(`not found: ${relative(root, p)}`);
    if (p === appFile) { out.app = true; return; }
    if (navDirs.some((d) => p === d || p.startsWith(d + sep))) { out.flow = true; return; }
    if (statSync(p).isDirectory()) {
      if (basename(p) === 'node_modules' || basename(p) === DIRS.ui) return;
      for (const f of readdirSync(p)) visit(resolve(p, f));
      return;
    }
    if (p.endsWith('.ui.json')) out.specs.push(p);
    else if (['.tsx', '.jsx'].includes(extname(p))) out.code.push(relative(root, p));
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
