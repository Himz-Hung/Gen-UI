import { writeFileSync } from 'node:fs';
import { join } from 'node:path';
import type { Catalog, CatalogEntry } from './define.ts';
import { DIRS, readCatalog, type Project } from './loader.ts';

/**
 * Build the catalog from loaded contracts. Shipped, project and added
 * contracts produce the exact same entry shape; only `source` differs.
 * Existing `impl` paths are carried over from the previous catalog.
 */
export function buildCatalog(project: Project): Catalog {
  const prev = readCatalog(project.root);
  const components: Record<string, CatalogEntry> = {};
  for (const [name, { contract: c, source }] of project.contracts) {
    const old = prev?.components[name];
    const impl = old && old.version === (c.version ?? 1) ? old.impl : {};
    components[name] = {
      name, category: c.category, purpose: c.purpose,
      props: c.props, events: c.events ?? {}, children: !!c.children,
      composition: c.composition ?? {}, version: c.version ?? 1, source, impl,
    };
  }
  return { version: 1, generatedAt: new Date().toISOString(), components };
}

export function writeCatalog(root: string, catalog: Catalog): string {
  const p = join(root, DIRS.catalog);
  writeFileSync(p, JSON.stringify(catalog, null, 2) + '\n');
  return p;
}
