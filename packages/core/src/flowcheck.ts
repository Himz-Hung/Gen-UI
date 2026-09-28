import type { ScreenDetail, ScreenSpec } from './define.ts';
import { Report } from './diagnostics.ts';
import type { Project } from './loader.ts';
import { BACK_ACTION, type ScreenInfo } from './screens.ts';
import { didYouMean } from './suggest.ts';
import { parseTypeString, refsIn, type TypeNode } from './types.ts';

/**
 * Navigation and screen descriptions.
 *
 * Screens written with `shows` (one report per file): structure, goTo targets, action names,
 * back, params, guard, data types, reachability from the first outline screen.
 * 1.0 flows in ui-spec/flows/ (one report): targets, params, guards, declared actions, reachability.
 * Both may coexist in a project, but one screen is described by one of them only.
 */
export function checkFlows(project: Project, specs: { file: string; spec: ScreenSpec }[]): Report[] {
  const reports: Report[] = [];
  const outline = project.app ? Object.keys(project.app.screens) : null;
  const legacyFlowScreens = new Set(project.flows.flatMap((f) => Object.keys(f.screens)));
  const names = outline ?? [...new Set([...project.screens.map((s) => s.name), ...legacyFlowScreens])];
  const guards = [...(project.config.guards ?? [])];
  const detail = project.screens.filter((s) => s.format === 'detail');

  const byFile = new Map<string, Report>();
  for (const s of detail) {
    const r = checkDetail(s, { project, names, guards, inFlows: legacyFlowScreens.has(s.name) });
    byFile.set(s.name, r);
    reports.push(r);
  }

  // Reachability over goTo edges, back fallbacks and 1.0 flow transitions, from the first outline screen.
  if (outline && detail.length) {
    const entry = outline[0];
    const edges = new Map<string, string[]>();
    const add = (from: string, to: string) => edges.set(from, [...(edges.get(from) ?? []), to]);
    for (const s of project.screens) { for (const e of s.nav) add(s.name, e.to); if (s.backFallback) add(s.name, s.backFallback); }
    for (const f of project.flows) for (const [n, sc] of Object.entries(f.screens))
      for (const tr of Object.values(sc.on ?? {})) if ('go' in tr) add(n, tr.go);
    const reach = new Set<string>();
    const queue = [entry];
    while (queue.length) { const n = queue.shift()!; if (reach.has(n)) continue; reach.add(n); queue.push(...(edges.get(n) ?? [])); }
    for (const s of detail) if (!reach.has(s.name))
      byFile.get(s.name)!.warn('goTo', `not reachable from ${entry} (the first screen in ui-spec/app.ts): no screen has goTo.${s.name}`);
  }

  if (project.flows.length) reports.push(checkLegacyFlows(project, specs, outline));
  reports.push(checkDomain(project));
  return reports;
}

/** Domain types may only refer to declared domain types. */
function checkDomain(project: Project): Report {
  const r = new Report('ui-spec/domain.ts');
  const names = Object.keys(project.domain);
  for (const [name, ty] of Object.entries(project.domain))
    for (const ref of new Set(refsIn(ty))) if (!project.domain[ref])
      r.error(name, `refers to "${ref}", which is not declared.${didYouMean(ref, names)} Declare it here (when drafting, show it to the user with the screen that needs it).`);
  return r;
}

function checkDetail(s: ScreenInfo, ctx: { project: Project; names: string[]; guards: string[]; inFlows: boolean }): Report {
  const r = new Report(s.file);
  const d = s.raw as ScreenDetail;
  const { project, names } = ctx;

  if (!project.app) r.error('file', 'this screen format (shows / goTo / back) needs ui-spec/app.ts: the screen purpose and the first screen come from the outline');
  if (ctx.inFlows) r.error('file', `${s.name} is described here with goTo/back and also appears in ui-spec/flows/. Pick one: remove it from the flow.`);
  const FIELDS = ['shows', 'local', 'when', 'data', 'goTo', 'back', 'params', 'guard'];
  for (const k of Object.keys(d)) {
    if (k === 'name') r.warn('name', `not needed: the file name gives the screen name (${s.name})`);
    else if (k === 'purpose') r.warn('purpose', 'not needed: the purpose lives in ui-spec/app.ts screens');
    else if (k === 'needs') r.error(k, 'this is the 1.0 field: write what the user sees as shows, special cases as when');
    else if (k === 'actions') r.error(k, 'this is the 1.0 field: actions that change screen go in goTo, the others in local');
    else if (!FIELDS.includes(k)) r.error(k, `unknown field.${didYouMean(k, FIELDS)} Fields: ${FIELDS.join(', ')}`);
  }

  if (!Array.isArray(d.shows) || !d.shows.length || d.shows.some((x) => typeof x !== 'string'))
    r.error('shows', 'list what the user sees on this screen, as plain-language strings');
  for (const field of ['local', 'when'] as const) {
    const obj = d[field];
    if (obj === undefined) continue;
    if (typeof obj !== 'object' || obj === null || Array.isArray(obj)) { r.error(field, `must be an object: ${field === 'local' ? 'action name → what it does' : 'situation → what the screen does'}`); continue; }
    for (const [k, v] of Object.entries(obj)) if (typeof v !== 'string') r.error(`${field}.${k}`, 'describe it as a plain-language string');
  }
  for (const k of Object.keys(d.local ?? {})) {
    if (k === BACK_ACTION) r.error(`local.${k}`, `"${BACK_ACTION}" is reserved: back is automatic, set back: false to remove it`);
    else if (!/^[a-z][A-Za-z0-9]*$/.test(k)) r.error(`local.${k}`, 'action names are camelCase: changeQty, removeItem');
  }

  const domain = Object.keys(project.domain);
  for (const field of ['data', 'params'] as const) for (const [k, v] of Object.entries(d[field] ?? {})) {
    if (typeof v !== 'string') { r.error(`${field}.${k}`, 'give the type as a string: "Card", "Card[]", "string", "number"'); continue; }
    const leaf = leafRef(parseTypeString(v));
    if (leaf && !project.domain[leaf]) r.error(`${field}.${k}`, `unknown domain type "${leaf}".${didYouMean(leaf, domain)} Declare it in ui-spec/domain.ts (when drafting this screen, draft the type too and show both to the user).`);
  }

  for (const [target, g] of Object.entries(d.goTo ?? {})) {
    const w = `goTo.${target}`;
    if (!names.includes(target)) r.error(w, `screen "${target}" is not in ${project.app ? 'ui-spec/app.ts screens' : 'this project'}.${didYouMean(target, names)}`);
    if (target === s.name) r.error(w, 'a screen cannot go to itself; use a local action');
    if (typeof g === 'string') { if (!g.trim()) r.error(w, 'say how the user gets there: "press Checkout"'); continue; }
    if (typeof g !== 'object' || g === null || typeof g.how !== 'string') { r.error(w, 'give how the user gets there: "press Checkout", or { how, action?, replace?, modal? }'); continue; }
    if (g.replace && g.modal) r.error(w, 'choose replace or modal, not both');
    if (g.action !== undefined && !/^[a-z][A-Za-z0-9]*$/.test(g.action)) r.error(`${w}.action`, 'action names are camelCase: placeOrder');
    if (g.action === BACK_ACTION) r.error(`${w}.action`, `"${BACK_ACTION}" is reserved for back`);
  }

  const seen = new Map<string, string>();
  for (const [a, where] of [...s.nav.map((e) => [e.action, e.where]), ...Object.keys(d.local ?? {}).map((k) => [k, `local.${k}`])]) {
    if (seen.has(a)) r.error(where, `action "${a}" is also declared at ${seen.get(a)}; each action has one meaning`);
    else seen.set(a, where);
  }

  if (d.back !== undefined && d.back !== false && typeof d.back !== 'string') r.error('back', "omit it (back to the previous screen), false (no back), or a screen name ('Home')");
  if (typeof d.back === 'string') {
    if (!names.includes(d.back)) r.error('back', `screen "${d.back}" is not in ui-spec/app.ts screens.${didYouMean(d.back, names)}`);
    if (project.app && Object.keys(project.app.screens)[0] === s.name) r.warn('back', `${s.name} is the first screen, it has no back`);
  }
  if (d.guard !== undefined && !ctx.guards.includes(d.guard))
    r.error('guard', `guard "${d.guard}" is not declared in ui-spec/project.ts guards [${ctx.guards.join(', ')}].${didYouMean(d.guard, ctx.guards)}`);
  return r;
}

/** 1.0 flows: ui-spec/flows/*.ts. Unchanged behaviour, plus outline names and suggestions. */
function checkLegacyFlows(project: Project, specs: { file: string; spec: ScreenSpec }[], outline: string[] | null): Report {
  const r = new Report('ui-spec/flows');
  const known = new Map<string, Set<string>>(); // screen → declared actions
  for (const s of project.screens) known.set(s.name, new Set(s.actions));
  for (const { spec } of specs) {
    const set = known.get(spec.screen) ?? new Set<string>();
    for (const a of spec.actions ?? []) set.add(a);
    known.set(spec.screen, set);
  }
  const guards = new Set(project.config.guards ?? []);

  for (const flow of project.flows) {
    const fw = `${flow.name}`;
    const inFlow = Object.keys(flow.screens);
    if (!flow.screens[flow.entry]) r.error(`${fw}.entry`, `entry "${flow.entry}" is not in this flow.${didYouMean(flow.entry, inFlow)}`);
    const reach = new Set<string>();
    const queue = [flow.entry];
    while (queue.length) {
      const s = queue.shift()!;
      if (reach.has(s) || !flow.screens[s]) continue;
      reach.add(s);
      for (const tr of Object.values(flow.screens[s].on ?? {})) if ('go' in tr) queue.push(tr.go);
      if (flow.screens[s].back) queue.push(flow.screens[s].back!);
    }
    for (const [name, sc] of Object.entries(flow.screens)) {
      const sw = `${fw}.screens.${name}`;
      if (outline && !outline.includes(name)) r.error(sw, `screen "${name}" is not in ui-spec/app.ts screens.${didYouMean(name, outline)} Add it to the outline first.`);
      // With an outline, an outlined screen with no detail yet is a todo (see the progress lines), not an error.
      else if (!outline && !known.has(name)) r.error(sw, `screen "${name}" has no description in ui-spec/screens/ and no spec in screens/`);
      if (!reach.has(name)) r.warn(sw, 'not reachable from entry');
      if (sc.guard && !guards.has(sc.guard)) r.error(`${sw}.guard`, `guard "${sc.guard}" is not declared in ui-spec/project.ts guards [${[...guards].join(', ')}].${didYouMean(sc.guard, guards)}`);
      if (sc.back && !flow.screens[sc.back]) r.error(`${sw}.back`, `back target "${sc.back}" is not in this flow.${didYouMean(sc.back, inFlow)}`);
      for (const [action, tr] of Object.entries(sc.on ?? {})) {
        const aw = `${sw}.on.${action}`;
        const declared = known.get(name);
        if (declared && !declared.has(action)) r.error(aw, `screen "${name}" does not declare action "${action}" [${[...declared].join(', ')}].${didYouMean(action, declared)}`);
        if ('go' in tr) {
          const target = flow.screens[tr.go];
          if (!target) { r.error(aw, `target "${tr.go}" is not in this flow.${didYouMean(tr.go, inFlow)}`); continue; }
          for (const [p, ty] of Object.entries(target.params ?? {})) {
            const given = tr.params?.[p];
            if (!given) r.error(`${aw}.params`, `target "${tr.go}" requires param "${p}: ${ty}"`);
            else if (given !== ty) r.error(`${aw}.params.${p}`, `type "${given}" does not match target param "${p}: ${ty}"`);
          }
          for (const p of Object.keys(tr.params ?? {})) if (!target.params?.[p]) r.error(`${aw}.params.${p}`, `target "${tr.go}" has no param "${p}"`);
        }
      }
    }
  }
  // Actions with no transition are local by definition (search, changeQty…). Nothing to report.
  return r;
}

function leafRef(t: TypeNode): string | null {
  if (t.kind === 'ref') return t.ref!;
  if (t.kind === 'array') return leafRef(t.of!);
  return null;
}
