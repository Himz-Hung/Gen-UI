#!/usr/bin/env node
import { basename, extname, relative, resolve, sep } from 'node:path';
import { existsSync, readdirSync, statSync } from 'node:fs';
import { loadProject, findRoot, readSpec, DIRS, type Project } from './loader.ts';
import { buildCatalog, writeCatalog } from './catalog.ts';
import { writeRules } from './rules.ts';
import { checkSpec } from './check.ts';
import { checkFlows } from './flowcheck.ts';
import { checkCode } from './codecheck.ts';
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
  fw check                          check everything: components, specs, flows, screen code
  fw check <path...>                check just these: *.ui.json specs, *.tsx screens, folders, ui-spec/flows

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
      console.log('\nNext: describe your app in ui-spec/, then ask your agent to build a screen. `fw check` verifies everything.');
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
      if (!args.length) {
        // everything: components → specs → flows → screen code
        reports.push(...verifyMany(project, catalog));
        writeCatalog(project.root, catalog);
        const specs = collect([resolve(project.root, DIRS.screens)], project.root).specs;
        reports.push(...checkSpecs(project, catalog, specs));
        reports.push(checkFlows(project, specs.map((f) => ({ file: f, spec: readSpec(f) }))));
        reports.push(...checkCode(project.root, ['src/screens', 'screens'], allowedImpl(catalog)));
      } else {
        const targets = collect(args.map((a) => resolve(a)), project.root);
        reports.push(...checkSpecs(project, catalog, targets.specs));
        if (targets.flow) reports.push(checkFlows(project, collect([resolve(project.root, DIRS.screens)], project.root).specs.map((f) => ({ file: f, spec: readSpec(f) }))));
        if (targets.code.length) reports.push(...checkCode(project.root, targets.code, allowedImpl(catalog)));
        if (!targets.specs.length && !targets.flow && !targets.code.length) fail(`nothing to check in: ${args.join(' ')} (expected *.ui.json, *.tsx/*.jsx, folders, or ui-spec/flows)`);
      }
      finish(reports);
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
  writeRules(root, project.config, catalog);
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
  return files.map((f) => checkSpec(readSpec(f), catalog, relative(project.root, f), { domain: project.domain, platform }));
}

function allowedImpl(catalog: Catalog): string[] {
  return Object.values(catalog.components).flatMap((c) => Object.values(c.impl));
}

/** Classify paths: *.ui.json → specs, *.tsx/*.jsx → code, anything under ui-spec/flows → flow. Folders recurse. */
function collect(paths: string[], root: string): { specs: string[]; code: string[]; flow: boolean } {
  const out = { specs: [] as string[], code: [] as string[], flow: false };
  const flowsDir = resolve(root, DIRS.spec, 'flows');
  const visit = (p: string) => {
    if (!existsSync(p)) fail(`not found: ${relative(root, p)}`);
    if (p === flowsDir || p.startsWith(flowsDir + sep)) { out.flow = true; return; }
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

function finish(reports: Report[]): never {
  for (const r of reports) r.print();
  const failed = reports.filter((r) => !r.ok).length;
  console.log(`─────\n${failed} failed, ${reports.length - failed} passed`);
  process.exit(failed ? 1 : 0);
}

function fail(msg: string): never { console.error(`fw: ${msg}`); process.exit(2); }

main().catch((e) => { console.error(`fw: ${e instanceof Error ? e.message : e}`); process.exit(2); });
