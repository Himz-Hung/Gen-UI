import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs';
import { basename, join, resolve, relative } from 'node:path';
import { pathToFileURL } from 'node:url';
import type { Strings, AppOutline, Catalog, ComponentContract, DomainTypes, FlowConfig, ProjectConfig, ScreenDescription, ScreenSpec, CatalogEntry } from './define.ts';
import { toScreenInfo, type ScreenInfo } from './screens.ts';

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
  /** ui-spec/app.ts, when the project has one. Absent = outline checks are skipped (1.0 projects). */
  app?: AppOutline;
  domain: DomainTypes;
  flows: FlowConfig[];
  /** ui-spec/screens/*.ts, both formats, normalized */
  screens: ScreenInfo[];
  /** ui-spec/strings/<lang>.ts, flattened: "cart.title" → "Your cart". `invalid` lists keys whose value is not a string. */
  strings: Map<string, { file: string; flat: Record<string, string>; invalid: string[] }>;
  contracts: Map<string, { contract: ComponentContract; source: CatalogEntry['source']; file: string }>;
}

export async function loadProject(root = findRoot()): Promise<Project> {
  const specDir = join(root, DIRS.spec);
  const config = await importDefault<ProjectConfig>(join(specDir, 'project.ts'));
  const appFile = join(specDir, 'app.ts');
  const app = existsSync(appFile) ? await importDefault<AppOutline>(appFile) : undefined;
  const domainFile = join(specDir, 'domain.ts');
  const domain = existsSync(domainFile) ? await importDefault<DomainTypes>(domainFile) : {};

  const flows: FlowConfig[] = [];
  for (const f of listFiles(join(specDir, 'flows'), '.ts')) flows.push(await importDefault<FlowConfig>(f));

  const entry = app ? Object.keys(app.screens)[0] : undefined;
  const screens: ScreenInfo[] = [];
  for (const f of listFiles(join(specDir, 'screens'), '.ts'))
    screens.push(toScreenInfo(await importDefault<ScreenDescription>(f), relative(root, f), entry));

  const strings: Project['strings'] = new Map();
  for (const f of listFiles(join(specDir, 'strings'), '.ts')) {
    const flat: Record<string, string> = {}, invalid: string[] = [];
    const visit = (o: Strings, prefix: string) => {
      for (const [k, v] of Object.entries(o ?? {})) {
        const key = prefix ? `${prefix}.${k}` : k;
        if (typeof v === 'string') flat[key] = v;
        else if (typeof v === 'object' && v !== null && !Array.isArray(v)) visit(v, key);
        else invalid.push(key);
      }
    };
    visit(await importDefault<Strings>(f), '');
    strings.set(basename(f, '.ts'), { file: relative(root, f), flat, invalid });
  }

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

  return { root, config, app, domain, flows, screens, strings, contracts };
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
