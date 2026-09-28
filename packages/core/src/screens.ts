import { basename, extname } from 'node:path';
import { isScreenDetail, type GoTo, type ScreenDescription } from './define.ts';

/** One way out of a screen, from `goTo` (or from a 1.0 flow). */
export interface NavEdge {
  action: string;
  to: string;
  mode: 'push' | 'replace' | 'modal';
  /** where in the source it was declared, e.g. goTo.Checkout */
  where: string;
}

/**
 * A screen description in one shape, whichever format it was written in.
 * Everything downstream (spec check, flow check, progress) reads this.
 */
export interface ScreenInfo {
  name: string;
  /** relative to the project root */
  file: string;
  format: 'detail' | 'legacy';
  data: Record<string, string>;
  /** Every action a spec may bind: go<Target> / custom goTo actions, local actions, goBack. */
  actions: string[];
  /** detail format only; 1.0 navigation lives in ui-spec/flows/ */
  nav: NavEdge[];
  /** Does the screen have a back action? */
  back: boolean;
  /** back: 'X' — where back goes when there is no previous screen */
  backFallback?: string;
  params: Record<string, string>;
  guard?: string;
  raw: ScreenDescription;
}

/** card-detail.ts → CardDetail, order_success.ts → OrderSuccess, cart.ts → Cart */
export function screenNameFromFile(file: string): string {
  return basename(file, extname(file)).split(/[-_\s]+/).filter(Boolean).map((w) => w[0].toUpperCase() + w.slice(1)).join('');
}

export const BACK_ACTION = 'goBack';
export const goAction = (target: string) => `go${target}`;

export function toScreenInfo(raw: ScreenDescription, file: string, entry?: string): ScreenInfo {
  if (!isScreenDetail(raw)) {
    return { name: raw.name, file, format: 'legacy', data: raw.data ?? {}, actions: [...(raw.actions ?? [])], nav: [], back: true, params: {}, raw };
  }
  const name = screenNameFromFile(file);
  const nav: NavEdge[] = Object.entries(raw.goTo ?? {}).map(([to, g]) => {
    const o: Partial<GoTo> = typeof g === 'string' ? { how: g } : (g ?? {});
    return { action: o.action ?? goAction(to), to, mode: o.modal ? 'modal' : o.replace ? 'replace' : 'push', where: `goTo.${to}` };
  });
  // The first screen has nowhere to go back to.
  const back = raw.back !== false && name !== entry;
  const actions = [...nav.map((e) => e.action), ...Object.keys(raw.local ?? {})];
  if (back) actions.push(BACK_ACTION);
  return {
    name, file, format: 'detail', data: raw.data ?? {}, actions: [...new Set(actions)], nav, back,
    backFallback: typeof raw.back === 'string' ? raw.back : undefined,
    params: raw.params ?? {}, guard: raw.guard, raw,
  };
}
