import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs';
import { join, resolve, relative } from 'node:path';
import { pathToFileURL } from 'node:url';
import type { Catalog, ComponentContract, DomainTypes, FlowConfig, ProjectConfig, ScreenDescription, ScreenSpec, CatalogEntry } from './define.ts';

export const DIRS = {
  rules: 'ui-rules',
  spec: 'ui-spec',
  ui: 'ui',
  screens: 'screens',
  catalog: 'ui.catalog.json',
} as const;

/** Walk up from cwd until a folder containing ui-spec/ is found. */
export function findRoot(from = process.cwd()): string {
  let dir = resolve(from);
  for (;;) {
    if (existsSync(join(dir, DIRS.spec))) return dir;
    const parent = resolve(dir, '..');
    if (parent === dir) throw new Error(`No ${DIRS.spec}/ folder found from ${from}. Run "fw init" first.`);
    dir = parent;
  }
}

async function importDefault<T>(file: string): Promise<T> {
  const mod = await import(pathToFileURL(file).href);
  if (!('default' in mod)) throw new Error(`${file} has no default export`);
  return mod.default as T;
}

function listFiles(dir: string, suffix: string): string[] {
  if (!existsSync(dir)) return [];
  return readdirSync(dir).filter((f) => f.endsWith(suffix)).map((f) => join(dir, f)).sort();
}

export interface Project {
  root: string;
  config: ProjectConfig;
  domain: DomainTypes;
  flows: FlowConfig[];
  descriptions: ScreenDescription[];
  contracts: Map<string, { contract: ComponentContract; source: CatalogEntry['source']; file: string }>;
}

export async function loadProject(root = findRoot()): Promise<Project> {
  const specDir = join(root, DIRS.spec);
  const config = await importDefault<ProjectConfig>(join(specDir, 'project.ts'));
  const domainFile = join(specDir, 'domain.ts');
  const domain = existsSync(domainFile) ? await importDefault<DomainTypes>(domainFile) : {};

  const flows: FlowConfig[] = [];
  for (const f of listFiles(join(specDir, 'flows'), '.ts')) flows.push(await importDefault<FlowConfig>(f));

  const descriptions: ScreenDescription[] = [];
  for (const f of listFiles(join(specDir, 'screens'), '.ts')) descriptions.push(await importDefault<ScreenDescription>(f));

  const contracts: Project['contracts'] = new Map();
  const load = async (dir: string, source: CatalogEntry['source']) => {
    for (const f of listFiles(dir, '.rule.ts')) {
      const c = await importDefault<ComponentContract>(f);
      if (contracts.has(c.name)) {
        const prev = contracts.get(c.name)!;
        if (source === 'rules') continue; // project overrides shipped
        console.warn(`[fw] ${relative(root, f)} overrides ${relative(root, prev.file)}`);
      }
      contracts.set(c.name, { contract: c, source, file: f });
    }
  };
  await load(join(root, DIRS.rules), 'rules');
  await load(join(specDir, 'components'), 'project');
  await load(join(specDir, 'added'), 'added');

  return { root, config, domain, flows, descriptions, contracts };
}

export function readCatalog(root: string): Catalog | null {
  const p = join(root, DIRS.catalog);
  if (!existsSync(p)) return null;
  return JSON.parse(readFileSync(p, 'utf8')) as Catalog;
}

export function readSpec(file: string): ScreenSpec {
  return JSON.parse(readFileSync(file, 'utf8')) as ScreenSpec;
}

export function listSpecs(root: string): string[] {
  return listFiles(join(root, DIRS.screens), '.ui.json');
}

export function isFile(p: string): boolean {
  return existsSync(p) && statSync(p).isFile();
}
