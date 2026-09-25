import { plain, type TypeNode } from './types.ts';

// ---------- Component contract ----------

export interface ComponentContract {
  name: string;
  category: 'layout' | 'typography' | 'action' | 'input' | 'form' | 'data' | 'feedback' | 'overlay' | 'navigation' | 'media' | 'chart' | 'composite';
  /** What it is for, and what NOT to use it for. */
  purpose: string;
  props: Record<string, TypeNode>;
  /** Events the component emits. Key is event name, value is payload type. */
  events?: Record<string, TypeNode>;
  /** Does it accept child elements? */
  children?: boolean;
  /** Visual/interaction states the implementation must have. */
  states?: string[];
  /** Behaviour every platform must honour. Platform-neutral wording only. */
  rules?: string[];
  a11y?: string[];
  composition?: {
    /** Only these component names may be direct children. Omit = any. */
    canContain?: string[];
    /** May never appear (at any depth) inside these. */
    cannotBeInside?: string[];
  };
  /** Hints per platform. Advisory, never a shared commitment. */
  platform?: Partial<Record<'react' | 'flutter', string[]>>;
  examples?: Record<string, unknown>[];
  /** Bump when the contract changes in a way that requires re-verify. */
  version?: number;
  /** Where the implementation lives when it is NOT ui/<Name>. Set by `fw add` for pre-existing components. */
  impl?: Partial<Record<'react' | 'flutter', string>>;
}

export function defineComponent(c: ComponentContract): ComponentContract {
  if (!/^[A-Z][A-Za-z0-9]*$/.test(c.name)) throw new Error(`Component name must be PascalCase: ${c.name}`);
  return {
    ...c,
    version: c.version ?? 1,
    props: Object.fromEntries(Object.entries(c.props).map(([k, v]) => [k, plain(v)])),
    events: c.events ? Object.fromEntries(Object.entries(c.events).map(([k, v]) => [k, plain(v)])) : undefined,
  };
}

// ---------- Project ----------

export interface ProjectConfig {
  name: string;
  platforms: ('react' | 'flutter')[];
  agent: 'claude' | 'cursor' | 'codex' | 'copilot';
  tokens: {
    color: Record<string, string>;
    spacing: number[];
    radius: Record<string, number>;
    font: Record<string, string>;
  };
  /** Named guards the flows may reference. Bodies are hand-written. */
  guards?: string[];
  /** Convention only: one state library for the whole project. */
  stateLibrary?: string;
}
export const defineProject = (p: ProjectConfig): ProjectConfig => p;

// ---------- Domain ----------

export type DomainTypes = Record<string, TypeNode>;
export const defineDomain = (d: DomainTypes): DomainTypes =>
  Object.fromEntries(Object.entries(d).map(([k, v]) => [k, plain(v)]));

// ---------- Screen description (what the user writes) ----------

export interface ScreenDescription {
  name: string;
  purpose: string;
  /** Data the screen receives: name → type string ("Card[]", "Order") */
  data?: Record<string, string>;
  /** Named actions the screen can raise. Bodies are hand-written. */
  actions?: string[];
  /** Plain-language needs. The agent turns these into a spec. */
  needs: string[];
}
export const defineScreen = (s: ScreenDescription): ScreenDescription => s;

// ---------- Flow ----------

export type Transition =
  | { go: string; mode?: 'push' | 'modal' | 'replace'; params?: Record<string, string> }
  | { back: true };

export interface FlowScreen {
  params?: Record<string, string>;
  /** action name → where it leads */
  on?: Record<string, Transition>;
  back?: string;
  guard?: string;
}
export interface FlowConfig {
  name: string;
  entry: string;
  screens: Record<string, FlowScreen>;
}
export const defineFlow = (f: FlowConfig): FlowConfig => f;

// ---------- Screen spec (what the agent writes, JSON) ----------

export interface SpecElement {
  type: string;
  props?: Record<string, unknown>;
  children?: string[];
  /** event name → action name */
  on?: Record<string, string>;
}
export interface ScreenSpec {
  screen: string;
  data?: Record<string, string>;
  actions?: string[];
  root: string;
  elements: Record<string, SpecElement>;
}

// ---------- Catalog (generated) ----------

export interface CatalogEntry {
  name: string;
  category: string;
  purpose: string;
  props: Record<string, TypeNode>;
  events: Record<string, TypeNode>;
  children: boolean;
  composition?: ComponentContract['composition'];
  version: number;
  /** 'rules' = shipped contract, 'project' = contract written in ui-spec/components, 'added' = fw add */
  source: 'rules' | 'project' | 'added';
  /** Per platform: path of the materialized implementation, once verified. */
  impl: Partial<Record<'react' | 'flutter', string>>;
}
export interface Catalog {
  version: 1;
  generatedAt: string;
  components: Record<string, CatalogEntry>;
}
