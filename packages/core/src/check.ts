import type { Catalog, CatalogEntry, ScreenSpec } from './define.ts';
import { checkLiteral, parseTypeString, sameType, typeText, type TypeNode } from './types.ts';
import { Report } from './diagnostics.ts';

/**
 * Validate one screen spec against the catalog.
 * Every error carries a location such as elements.kpi.props.totals.
 */
export function checkSpec(spec: ScreenSpec, catalog: Catalog, file: string, opts: { domain?: Record<string, TypeNode>; platform?: string } = {}): Report {
  const r = new Report(file);
  const els = spec.elements ?? {};
  const actions = new Set(spec.actions ?? []);
  const data: Record<string, TypeNode> = {};
  for (const [k, v] of Object.entries(spec.data ?? {})) {
    data[k] = parseTypeString(v);
    const leaf = leafRef(data[k]);
    if (leaf && opts.domain && !opts.domain[leaf]) r.error(`data.${k}`, `unknown domain type "${leaf}"`);
  }

  if (!spec.screen) r.error('screen', 'missing screen name');
  if (!spec.root) { r.error('root', 'missing root'); return r; }
  if (!els[spec.root]) { r.error('root', `root "${spec.root}" is not in elements`); return r; }

  // Walk the tree from root: reachability, cycles, composition.
  const seen = new Set<string>();
  const walk = (id: string, ancestors: string[]) => {
    if (ancestors.includes(id)) { r.error(`elements.${id}`, `cycle: ${[...ancestors, id].join(' → ')}`); return; }
    seen.add(id);
    const el = els[id];
    const entry = catalog.components[el.type];
    const parentId = ancestors[ancestors.length - 1];
    const parent = parentId ? catalog.components[els[parentId].type] : undefined;

    if (entry) {
      // cannotBeInside: any ancestor
      for (const a of ancestors) {
        const aType = els[a].type;
        if (entry.composition?.cannotBeInside?.includes(aType)) r.error(`elements.${id}`, `${el.type} may not be inside ${aType} (ancestor "${a}")`);
      }
      // parent.canContain
      if (parent?.composition?.canContain && !parent.composition.canContain.includes(el.type))
        r.error(`elements.${id}`, parent.composition.canContain.length
          ? `${parent.name} may only contain ${parent.composition.canContain.join(', ')}; got ${el.type}`
          : `${parent.name} does not accept child components; got ${el.type}`);
    }
    for (const c of el.children ?? []) {
      if (!els[c]) { r.error(`elements.${id}.children`, `child "${c}" is not in elements`); continue; }
      walk(c, [...ancestors, id]);
    }
  };
  walk(spec.root, []);
  for (const id of Object.keys(els)) if (!seen.has(id)) r.warn(`elements.${id}`, 'not reachable from root');

  // Per element: type, props, events.
  for (const [id, el] of Object.entries(els)) {
    const where = `elements.${id}`;
    const entry = catalog.components[el.type];
    if (!entry) { r.error(`${where}.type`, `unknown component "${el.type}" — not in catalog`); continue; }
    if (opts.platform && !entry.impl[opts.platform as 'react' | 'flutter'])
      r.error(`${where}.type`, `${el.type} is not materialized for ${opts.platform} yet — run Phase A (write ui/${el.type}, then fw verify ${el.type})`);

    if (el.children?.length && !entry.children) r.error(`${where}.children`, `${el.type} does not accept children`);

    const props = el.props ?? {};
    for (const [p, ty] of Object.entries(entry.props)) {
      if (props[p] === undefined && !ty.optional) r.error(`${where}.props.${p}`, `required prop missing (${typeText(ty)})`);
    }
    for (const [p, val] of Object.entries(props)) {
      const ty = entry.props[p];
      const pw = `${where}.props.${p}`;
      if (!ty) { r.error(pw, `unknown prop on ${el.type}. Known: ${Object.keys(entry.props).join(', ')}`); continue; }
      if (isBinding(val)) {
        const bound = resolvePath(val.path, data);
        if (!bound) { r.error(pw, `path "${val.path}" does not resolve in screen data (${Object.keys(data).join(', ') || 'none'})`); continue; }
        if (!sameType(bound, ty)) r.error(pw, `path "${val.path}" is ${typeText(bound)}, prop expects ${typeText(ty)}`);
      } else {
        const e = checkLiteral(val, ty);
        if (e) r.error(pw, e);
      }
    }

    for (const [ev, action] of Object.entries(el.on ?? {})) {
      const ew = `${where}.on.${ev}`;
      if (!entry.events[ev]) { r.error(ew, `${el.type} has no event "${ev}". Known: ${Object.keys(entry.events).join(', ') || 'none'}`); continue; }
      if (typeof action !== 'string') { r.error(ew, 'action must be a name (string) — no code in specs'); continue; }
      if (!actions.has(action)) r.error(ew, `action "${action}" is not declared in this screen's actions [${[...actions].join(', ')}]`);
    }
  }
  return r;
}

function isBinding(v: unknown): v is { path: string } {
  return typeof v === 'object' && v !== null && typeof (v as { path?: unknown }).path === 'string';
}

function leafRef(t: TypeNode): string | null {
  if (t.kind === 'ref') return t.ref!;
  if (t.kind === 'array') return leafRef(t.of!);
  return null;
}

/** Resolve a JSON-pointer-like path "/cards" or "/order/items" against screen data. Only the first segment is typed; deeper segments are trusted. */
function resolvePath(path: string, data: Record<string, TypeNode>): TypeNode | null {
  if (!path.startsWith('/')) return null;
  const [head] = path.slice(1).split('/');
  return data[head] ?? null;
}

export function entryFor(catalog: Catalog, name: string): CatalogEntry | undefined {
  return catalog.components[name];
}
