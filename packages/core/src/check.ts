import type { AppOutline, Catalog, CatalogEntry, ScreenDetail, ScreenSpec } from './define.ts';
import { parseTypeString, typeText, type TypeNode } from './types.ts';
import { checkValue, resolvePath, deref, type ValueCtx } from './values.ts';
import { Report } from './diagnostics.ts';
import { didYouMean, suggest } from './suggest.ts';
import { notInOutline } from './appcheck.ts';
import { BACK_ACTION, type ScreenInfo } from './screens.ts';
import { dartFile } from './flutter.ts';

/**
 * Validate one screen spec against the catalog.
 * Every error carries a location such as elements.kpi.props.totals.
 */
export function checkSpec(spec: ScreenSpec, catalog: Catalog, file: string, opts: { domain?: Record<string, TypeNode>; platforms?: ('react' | 'flutter')[]; app?: AppOutline; screens?: ScreenInfo[]; i18n?: ValueCtx['i18n'] } = {}): Report {
  const r = new Report(file);
  const els = spec.elements ?? {};
  // The screen description is the source of truth for actions and data; the spec may omit both.
  const info = opts.screens?.find((s) => s.name === spec.screen);
  if (opts.screens && spec.screen && !info) r.warn('screen', `screen "${spec.screen}" has no description in ui-spec/screens/`);
  let actions = new Set(spec.actions ?? []);
  if (info?.format === 'detail') {
    actions = new Set(info.actions);
    (spec.actions ?? []).forEach((a, i) => {
      if (!actions.has(a)) r.error(`actions[${i}]`, `"${a}" is not an action of ${info.name} in ${info.file} [${info.actions.join(', ')}].${didYouMean(a, actions)} Remove "actions" from the spec: it comes from the description.`);
    });
  } else if (info && !spec.actions) actions = new Set(info.actions);
  const data: Record<string, TypeNode> = {};
  for (const [k, v] of Object.entries(spec.data ?? info?.data ?? {})) {
    data[k] = parseTypeString(v);
    const leaf = leafRef(data[k]);
    if (leaf && opts.domain && !opts.domain[leaf]) r.error(`data.${k}`, `unknown domain type "${leaf}".${didYouMean(leaf, Object.keys(opts.domain))} Declare it in ui-spec/domain.ts (when drafting this screen, draft the type too and show both to the user).`);
  }

  if (!spec.screen) r.error('screen', 'missing screen name');
  else if (opts.app && !opts.app.screens[spec.screen])
    r.error('screen', `screen "${spec.screen}" is not in ui-spec/app.ts screens.${didYouMean(spec.screen, Object.keys(opts.app.screens))} Add it to the outline first.`);
  const outlined = opts.app ? new Set(opts.app.components) : null;
  if (!spec.root) { r.error('root', 'missing root'); return r; }
  if (!els[spec.root]) { r.error('root', `root "${spec.root}" is not in elements`); return r; }

  const domain = opts.domain ?? {};
  // Walk the tree from root: reachability, cycles, composition, repeat scopes.
  const seen = new Set<string>();
  const scopes = new Map<string, Map<string, TypeNode>>(); // element → repeat variables its props can use
  const parentOf = new Map<string, string>();
  const walk = (id: string, ancestors: string[], outer: Map<string, TypeNode>) => {
    if (ancestors.includes(id)) { r.error(`elements.${id}`, `cycle: ${[...ancestors, id].join(' → ')}`); return; }
    const parentId = ancestors[ancestors.length - 1];
    if (seen.has(id)) { r.error(`elements.${id}`, `has two parents ("${parentOf.get(id)}" and "${parentId}"); an element appears once, give the copy its own id`); return; }
    seen.add(id);
    if (parentId) parentOf.set(id, parentId);
    const el = els[id];
    const scope = new Map(outer);
    if (el.repeat !== undefined) {
      const rw = `elements.${id}.repeat`;
      const rp = el.repeat as { path?: unknown; as?: unknown };
      if (typeof rp !== 'object' || rp === null || typeof rp.path !== 'string' || typeof rp.as !== 'string') r.error(rw, 'repeat is { "path": "/list", "as": "item" }');
      else {
        const list = resolvePath(rp.path, { data, scope: outer, domain });
        const concrete = typeof list === 'string' ? null : deref(list, domain);
        if (typeof list === 'string') r.error(`${rw}.path`, list);
        else if (concrete!.kind !== 'array') r.error(`${rw}.path`, `"${rp.path}" is ${typeText(list)}, repeat needs a list`);
        if (!/^[a-z][A-Za-z0-9]*$/.test(rp.as)) r.error(`${rw}.as`, 'a repeat variable is a camelCase name: item, card, line');
        else if (data[rp.as] || outer.has(rp.as)) r.error(`${rw}.as`, `"${rp.as}" is already ${data[rp.as] ? 'screen data' : 'a repeat variable above'}; pick another name`);
        else if (concrete?.kind === 'array') scope.set(rp.as, concrete.of!);
      }
    }
    scopes.set(id, scope);
    const entry = catalog.components[el.type];
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
      walk(c, [...ancestors, id], scope);
    }
  };
  walk(spec.root, [], new Map());
  for (const id of Object.keys(els)) if (!seen.has(id)) r.warn(`elements.${id}`, 'not reachable from root');

  // Per element: type, props, events.
  for (const [id, el] of Object.entries(els)) {
    const where = `elements.${id}`;
    const entry = catalog.components[el.type];
    if (!entry) {
      // Suggest from the outline first (what this app uses), then the whole catalog.
      const hint = (outlined && didYouMean(el.type, outlined)) || didYouMean(el.type, Object.keys(catalog.components));
      const add = 'add it to ui-spec/app.ts and write its contract in ui-spec/components/.';
      r.error(`${where}.type`, `unknown component "${el.type}", not in the catalog.${hint ? `${hint} If it is really a new component, ${add}` : ` To use a new component, ${add}`}`);
    } else if (outlined && !outlined.has(el.type)) {
      r.error(`${where}.type`, notInOutline(el.type, opts.app!, (n) => !!catalog.components[n]));
    }
    // Actions do not depend on the component, so they are checked even when the type is wrong.
    for (const [ev, action] of Object.entries(el.on ?? {})) {
      if (typeof action !== 'string' || actions.has(action)) continue;
      if (action === BACK_ACTION && info?.format === 'detail')
        r.error(`${where}.on.${ev}`, `${info.name} has no back (${(info.raw as ScreenDetail).back === false ? 'back: false' : 'it is the first screen'}), so "${BACK_ACTION}" does not exist here`);
      else if (info?.format === 'detail' && opts.app && brokenNav(info, opts.app, action))
        r.error(`${where}.on.${ev}`, `action "${action}" is not declared for this screen: ${info.file} has ${brokenNav(info, opts.app, action)}, which is not a screen. Fix the typo there.`);
      else
        r.error(`${where}.on.${ev}`, `action "${action}" is not declared for this screen [${[...actions].join(', ')}].${didYouMean(action, actions)}${info?.format === 'detail' ? ` Add it to goTo or local in ${info.file}.` : ''}`);
    }
    if (!entry) continue;
    for (const p of opts.platforms ?? []) if (!entry.impl[p])
      r.error(`${where}.type`, `${el.type} is not materialized for ${p} yet — run Phase A (write ${p === 'react' ? `ui/${el.type}.tsx` : dartFile(el.type)}, then fw verify ${el.type})`);

    if (el.children?.length && !entry.children) r.error(`${where}.children`, `${el.type} does not accept children`);

    const props = el.props ?? {};
    for (const [p, ty] of Object.entries(entry.props)) {
      if (props[p] === undefined && !ty.optional) r.error(`${where}.props.${p}`, `required prop missing (${typeText(ty)})`);
    }
    const ctx: ValueCtx = { data, scope: scopes.get(id) ?? new Map(), domain, i18n: opts.i18n };
    for (const [p, val] of Object.entries(props)) {
      const ty = entry.props[p];
      const pw = `${where}.props.${p}`;
      if (!ty) { r.error(pw, `unknown prop on ${el.type}.${didYouMean(p, Object.keys(entry.props))} Known: ${Object.keys(entry.props).join(', ')}`); continue; }
      checkValue(val, ty, pw, ctx, r);
    }

    for (const [ev, action] of Object.entries(el.on ?? {})) {
      const ew = `${where}.on.${ev}`;
      if (!entry.events[ev]) { r.error(ew, `${el.type} has no event "${ev}".${didYouMean(ev, Object.keys(entry.events))} Known: ${Object.keys(entry.events).join(', ') || 'none'}`); continue; }
      if (typeof action !== 'string') r.error(ew, 'action must be a name (string) — no code in specs');
    }
  }
  return r;
}

/** A goTo whose target is misspelled makes a wrong action name (goChekout); point at it instead of suggesting it. */
function brokenNav(info: ScreenInfo, app: AppOutline, action: string): string | null {
  const broken = info.nav.filter((e) => !app.screens[e.to]);
  const hit = suggest(action, broken.map((e) => e.action));
  return hit ? broken.find((e) => e.action === hit.name)!.where : null;
}

function leafRef(t: TypeNode): string | null {
  if (t.kind === 'ref') return t.ref!;
  if (t.kind === 'array') return leafRef(t.of!);
  return null;
}

export function entryFor(catalog: Catalog, name: string): CatalogEntry | undefined {
  return catalog.components[name];
}
