import { basename } from 'node:path';
import type { FlowConfig, ScreenSpec } from './define.ts';
import { Report } from './diagnostics.ts';
import type { Project } from './loader.ts';

/**
 * Flows, screen descriptions and screen specs must agree:
 * - every flow screen exists (description or spec)
 * - every `on` action is declared by that screen
 * - every action a screen declares has a destination in some flow (warning otherwise)
 * - targets exist, params required by the target are provided, guards are declared
 * - every screen is reachable from entry
 */
export function checkFlows(project: Project, specs: { file: string; spec: ScreenSpec }[]): Report {
  const r = new Report('ui-spec/flows');
  const known = new Map<string, Set<string>>(); // screen → declared actions
  for (const d of project.descriptions) known.set(d.name, new Set(d.actions ?? []));
  for (const { spec } of specs) {
    const set = known.get(spec.screen) ?? new Set<string>();
    for (const a of spec.actions ?? []) set.add(a);
    known.set(spec.screen, set);
  }
  const guards = new Set(project.config.guards ?? []);
  const handled = new Map<string, Set<string>>(); // screen → actions with a destination

  for (const flow of project.flows) {
    const fw = `${flow.name}`;
    if (!flow.screens[flow.entry]) r.error(`${fw}.entry`, `entry "${flow.entry}" is not in this flow`);
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
      if (!known.has(name)) r.error(sw, `screen "${name}" has no description in ui-spec/screens/ and no spec in screens/`);
      if (!reach.has(name)) r.warn(sw, 'not reachable from entry');
      if (sc.guard && !guards.has(sc.guard)) r.error(`${sw}.guard`, `guard "${sc.guard}" is not declared in ui-spec/project.ts guards [${[...guards].join(', ')}]`);
      if (sc.back && !flow.screens[sc.back]) r.error(`${sw}.back`, `back target "${sc.back}" is not in this flow`);
      for (const [action, tr] of Object.entries(sc.on ?? {})) {
        const aw = `${sw}.on.${action}`;
        const declared = known.get(name);
        if (declared && !declared.has(action)) r.error(aw, `screen "${name}" does not declare action "${action}" [${[...declared].join(', ')}]`);
        handled.set(name, new Set([...(handled.get(name) ?? []), action]));
        if ('go' in tr) {
          const target = flow.screens[tr.go];
          if (!target) { r.error(aw, `target "${tr.go}" is not in this flow`); continue; }
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
  void handled;
  // spec ↔ description name agreement
  for (const { file, spec } of specs) if (!project.descriptions.some((d) => d.name === spec.screen))
    r.warn(basename(file), `spec screen "${spec.screen}" has no description in ui-spec/screens/`);
  return r;
}
