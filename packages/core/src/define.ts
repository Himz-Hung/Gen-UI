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
  /** Machine-checked commitments: \`fw verify\` generates a test per check for every platform and runs it. */
  checks?: Check[];
  /** Bump when the contract changes in a way that requires re-verify. */
  version?: number;
  /** Where the implementation lives when it is NOT ui/<Name>. Set by `fw add` for pre-existing components. */
  impl?: Partial<Record<'react' | 'flutter', string>>;
}

// ---------- Behavioural checks ----------

/** Prop values for one render. Merged over the contract's first example; missing required props get a placeholder; null leaves an optional prop out. */
export type CheckProps = Record<string, unknown>;
/** A size in logical pixels, or a number from ui-spec/project.ts tokens by path ('size.controlMd'). */
export type CheckSize = number | { token: string };
/** How the user acts on the component: pointer tap/click, or Enter / Space after Tab focuses it. */
export type CheckActivation = 'press' | 'enter' | 'space';
export type CheckRole = 'button' | 'link' | 'checkbox' | 'switch' | 'radio' | 'textbox' | 'searchbox' | 'slider' | 'heading' | 'img' | 'dialog' | 'alertdialog' | 'tab' | 'status' | 'alert' | 'progressbar';
export type CheckKey = 'Escape' | 'Enter' | 'Space' | 'ArrowUp' | 'ArrowDown' | 'ArrowLeft' | 'ArrowRight' | 'Home' | 'End';

interface CheckBase {
  /** Props for the render (merged over examples[0]). */
  props?: CheckProps;
  /** error (default for most kinds) fails fw verify; warn only reports. */
  level?: 'error' | 'warn';
  /** Why, in one line. Shown when the check fails. */
  note?: string;
  /** Press this visible text instead of the component itself (the action lives on an inner element). */
  target?: string;
}
/**
 * One commitment a machine can test, the same on every platform.
 * Layout kinds (size, keepsSize, minTarget) need real layout: Flutter measures them, React (jsdom) reports them skipped.
 */
export type Check = CheckBase & (
  /** Rendered height / width for each value of an enum prop. */
  | { kind: 'size'; byProp: string; height?: Record<string, CheckSize>; width?: Record<string, CheckSize> }
  /** Rendered with \`props\`, the component has the same size as rendered with \`like\`. */
  | { kind: 'keepsSize'; props: CheckProps; like: CheckProps }
  /** Acting on it emits the event (each activation listed; default press). */
  | { kind: 'emits'; event: string; on?: CheckActivation[] }
  /** With \`props\`, acting on it never emits the event. */
  | { kind: 'neverEmits'; event: string; props: CheckProps; on?: CheckActivation[] }
  /** Exposes this role, with this accessible name (a literal, or the value of a prop). */
  | { kind: 'role'; role: CheckRole; name?: string | { fromProp: string } }
  /** Pressing a key (after Tab moves focus into it) emits the event. */
  | { kind: 'key'; key: CheckKey; emits: string }
  /** With \`props\`, nothing is drawn (closed overlay, hidden element). */
  | { kind: 'rendersNothing'; props: CheckProps }
  /** Pointer target at least this many logical pixels in both directions. Default level: warn. */
  | { kind: 'minTarget'; size: number }
  /** Typing into the component's text field emits the event (change on every keystroke, or once per entry on Flutter). */
  | { kind: 'types'; text: string; emits: string }
  /** Opening the component (pressing it, or the visible \`open\` text) and choosing the option with this visible text emits the event. */
  | { kind: 'selects'; option: string; emits: string; open?: string }
  /** A part is painted with a color token of ui-spec/project.ts (the root's background / its text). Default level: warn. */
  | { kind: 'tokenColor'; token: string; part?: 'background' | 'text' }
);
export type CheckKind = Check['kind'];

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
    /** Named sizes (control heights…) that checks can reference: { token: 'size.controlMd' }. */
    size?: Record<string, number>;
  };
  /** Named guards the flows may reference. Bodies are hand-written. */
  guards?: string[];
  /** The project's state, form, data and router libraries, e.g. 'bloc' or 'zustand, react-hook-form, @apollo/client, react-router'. Known ones allow their
   *  non-visual wrappers in screens (BlocBuilder, Obx, <FormProvider>…); see WRAPPER_PRESETS. */
  stateLibrary?: string;
  /** Extra components / widgets screens may use although they are not in ui/: wrappers that pass state and draw
   *  nothing. What they render is still checked. */
  screenWrappers?: string[];
  /** Folders whose code must be composed from ui/ (lib/ui/) only: \`fw check\` applies the screen rules there.
   *  Default: src/screens and screens (React), lib/screens (Flutter). */
  screenDirs?: string[];
  /** Folders deliberately left free (a marketing landing page, a hand-styled layout): never checked, and fw check stops
   *  suggesting them. Takes precedence over screenDirs for anything inside. */
  freeformDirs?: string[];
  /** Languages the UI is shown in; the first is the default. Omit for a single-language app. */
  languages?: string[];
  /** Convention only: how code looks up a translated string (a library such as 'i18next', or a file such as 'src/i18n.ts'). */
  i18nLibrary?: string;
}
export const defineProject = (p: ProjectConfig): ProjectConfig => p;

// ---------- Strings (one file per language: ui-spec/strings/<lang>.ts) ----------

/** Nested keys → text. "{count}" is a placeholder filled from params. */
export interface Strings { [key: string]: string | Strings }
export const defineStrings = (s: Strings): Strings => s;

// ---------- App outline (written first) ----------

/**
 * The whole app in one place: every screen and every component it uses, by name.
 * Written before any detail. Everything else (screen descriptions, flows, specs,
 * screen code) may only use names listed here; `fw check` enforces it.
 */
export interface AppOutline {
  name?: string;
  /** Screen name → one-line purpose. Details go in ui-spec/screens/<name>.ts later. */
  screens: Record<string, string>;
  /** Component names from the catalog (shipped, ui-spec/components or fw add). */
  components: string[];
}
export function defineApp(a: AppOutline): AppOutline {
  const bad = [...Object.keys(a.screens), ...a.components].filter((n) => !/^[A-Z][A-Za-z0-9]*$/.test(n));
  if (bad.length) throw new Error(`Names in defineApp must be PascalCase: ${bad.join(', ')}`);
  const dup = a.components.filter((n, i) => a.components.indexOf(n) !== i);
  if (dup.length) throw new Error(`Duplicate components in defineApp: ${[...new Set(dup)].join(', ')}`);
  return a;
}

// ---------- Domain ----------

export type DomainTypes = Record<string, TypeNode>;
export const defineDomain = (d: DomainTypes): DomainTypes =>
  Object.fromEntries(Object.entries(d).map(([k, v]) => [k, plain(v)]));

// ---------- Screen description (what the user writes) ----------

/** How the user gets to another screen. A string is the `how`. */
export interface GoTo {
  /** What the user does, in plain language: "press Checkout", "tap an item". */
  how: string;
  /** Action name. Default: go<Target>, e.g. goCheckout. */
  action?: string;
  /** Replace the current screen instead of pushing on top of it. */
  replace?: boolean;
  /** Open on top as a modal. */
  modal?: boolean;
}

/**
 * One screen, in ui-spec/screens/<name>.ts. The file name gives the screen name
 * (card-detail.ts → CardDetail) and the purpose lives in ui-spec/app.ts.
 * Navigation is described here too (goTo, back); there is no separate flow file.
 */
export interface ScreenDetail {
  /** What does the user see here? */
  shows: string[];
  /** What can the user do here that does NOT change screen? action name → what it does. */
  local?: Record<string, string>;
  /** Special cases: situation → what the screen does. "empty", "loading", "cart is empty"… */
  when?: Record<string, string>;
  /** Data the screen receives: name → type string ("Card[]", "Order"), types from domain.ts. */
  data?: Record<string, string>;
  /** Where can the user go from here, and how? target screen → how. */
  goTo?: Record<string, string | GoTo>;
  /** Omit: back to the previous screen. false: no back. 'X': back, falling back to X when there is no previous screen. */
  back?: false | string;
  /** What this screen receives when opened: name → type string. Declared here only, never by the caller. */
  params?: Record<string, string>;
  /** Guard from ui-spec/project.ts that must pass to open this screen. */
  guard?: string;
}

/** 1.0 screen description, used together with ui-spec/flows/*.ts. Still accepted. */
export interface LegacyScreenDescription {
  name: string;
  purpose: string;
  /** Data the screen receives: name → type string ("Card[]", "Order") */
  data?: Record<string, string>;
  /** Named actions the screen can raise. Bodies are hand-written. */
  actions?: string[];
  /** Plain-language needs. The agent turns these into a spec. */
  needs: string[];
}

export type ScreenDescription = ScreenDetail | LegacyScreenDescription;
export const defineScreen = <T extends ScreenDescription>(s: T): T => s;
/** 1.0 descriptions have both `name` and `needs`; everything else is read (and checked) as the current format. */
export const isScreenDetail = (s: ScreenDescription): s is ScreenDetail => !('needs' in s && typeof (s as LegacyScreenDescription).name === 'string');

// ---------- Flow (1.0; new projects describe navigation in each screen) ----------

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
  /** Render this element once per item of a list. Inside, "<as>/field" paths read the item. */
  repeat?: { path: string; as: string };
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
