# genui-fw

**Contract-driven UI for coding agents.**

`genui-fw` ships *contracts* for UI components, not code. Your coding agent — Claude Code, Cursor,
Codex or GitHub Copilot — implements each contract once for your platform, then composes screens
from those implementations. Three deterministic checks keep the agent inside the lines, so the UI
it produces is consistent across the whole project.

```
Phase A  materialize     contract ──▶ agent writes ui/Button.tsx ──▶ fw verify Button
Phase B  compose         your screen description ──▶ agent writes screens/home.ui.json ──▶ fw check screens/home.ui.json
                         ──▶ agent composes src/screens/HomeScreen.tsx from ui/ ──▶ fw check src/screens/HomeScreen.tsx
```

Two packages:

| package | what |
|---|---|
| `@himz-genui/core` | the `fw` CLI, the `t` type system and `define*` helpers |
| `@himz-genui/rules` | 76 platform-neutral component contracts |

> Status: **1.2.1** on npm ([`@himz-genui/core`](https://www.npmjs.com/package/@himz-genui/core), [`@himz-genui/rules`](https://www.npmjs.com/package/@himz-genui/rules)), React and Flutter, 76 contracts. Behavioural test generation is on the roadmap (see [Limitations](#limitations)).

---

## Table of contents

- [Why](#why)
- [Install](#install)
- [Quick start](#quick-start)
- [How it works](#how-it-works)
- [Project layout](#project-layout)
- [Describing your app (`ui-spec/`)](#describing-your-app-ui-spec)
- [Languages](#languages)
- [Flutter](#flutter)
- [State and form libraries](#state-and-form-libraries)
- [Contracts](#contracts)
- [Screen specs](#screen-specs)
- [Commands](#commands)
- [Agent rules](#agent-rules)
- [Registering existing components](#registering-existing-components)
- [CI](#ci)
- [Limitations](#limitations)
- [FAQ](#faq)
- [Example](#example)
- [Contributing](#contributing)
- [License](#license)

---

## Why

Letting an agent write UI freely gives you a different Button on every screen, hard-coded colors,
invented routes and components nobody can find. Rules files (`CLAUDE.md`, `.cursorrules`) help a
little, but they are soft: the agent reads them and still drifts.

`genui-fw` moves the hard rules out of prose and into **validators**, and gives the agent a small,
fixed set of building blocks:

- **A contract per component** — props, events, states, behaviour rules, accessibility, composition
  constraints — written once in TypeScript, valid for any platform.
- **One implementation per component per project**, written by the agent from the contract into `ui/`,
  verified against the contract, then reused. Never rewritten per screen.
- **A JSON spec per screen** that may only reference catalog components, checked before any code exists.
- **A lint on screen code**: compose from `ui/` only, no raw markup, no foreign component libraries.
- **Navigation declared per screen** (`goTo`, `back`, `params`), so the agent cannot invent routes.

The promise is precise: *within one project, every component and screen the agent produces matches its
contract and is consistent with the others.* It does not promise that two different projects produce
identical code.

Compared to alternatives:

| | ships | agent does | consistency comes from |
|---|---|---|---|
| Runtime renderers (json-render, A2UI) | renderer + real components | emits JSON at runtime | the renderer |
| shadcn/ui | component source for one platform | composes | copied code |
| Rules files | prose | everything | hoping the agent reads |
| **genui-fw** | **contracts + validators** | **implements once, composes many** | **`fw verify` / `fw check`** |

---

## Install

Requires Node ≥ 20 and a React + TypeScript project (or an empty folder — see `--create`).

```sh
npm i -D @himz-genui/core @himz-genui/rules
npx fw init --agent claude --platform react --name "My App"
```

`--agent` is one of `claude`, `cursor`, `codex`, `copilot`. Add `--create vite` to scaffold a Vite React TS
app first.

---

## Quick start

**1. Describe the app** in `ui-spec/` (you write these; no code, no JSON). Start with the outline, the whole
app by name, then fill in details:

```ts
// ui-spec/app.ts: written first
export default defineApp({
  screens: {
    Home: 'Browse and search the card catalog',
    CardDetail: 'One card with all details',
    Cart: 'Review items and go to checkout',
  },
  components: ['Container', 'Stack', 'Grid', 'TopBar', 'Card', 'Image', 'Heading', 'Text', 'Button', 'Pagination'],
});

// ui-spec/domain.ts
export default defineDomain({
  Card: t.object({ id: t.string(), name: t.string(), imageUrl: t.string(), priceLabel: t.string(), stock: t.number() }),
});

// ui-spec/screens/home.ts: one file per screen, the file name is the screen name
export default defineScreen({
  shows: [
    'Top bar with the shop name and a cart action showing the item count',
    'Responsive grid of cards: image, name, rarity badge, price, add-to-cart button',
    'Pagination below the grid',
  ],
  local: { search: 'search cards by name', changePage: 'go to another page', addToCart: 'add a card to the cart' },
  when: { 'nothing matches': 'show an empty state that clears the search' },
  data: { cards: 'Card[]', cartCount: 'number', page: 'number', pageCount: 'number' },
  goTo: { CardDetail: 'tap a card', Cart: 'press the cart action' },
});

// ui-spec/screens/card-detail.ts
export default defineScreen({
  shows: ['Large card image with name, rarity, price', 'Add-to-cart button'],
  params: { cardId: 'string' },
  goTo: { Cart: 'press the cart action' },
  back: 'Home',   // back to the previous screen; Home when opened from a link
});
```

Not sure what to put in a screen file or in `domain.ts`? Write only the outline and ask the agent
(*"Draft the Cart screen for me to review"*): it drafts `ui-spec/screens/<name>.ts` plus any domain types
the screen needs, runs `fw check`, and shows you both before building anything. Waiting for your approval is
an instruction in the agent rules, not something `fw check` can enforce.

**2. Ask your agent** for a screen:

> Build the Home screen from ui-spec/screens/home.ts

The agent follows the generated rules: `fw docs Button` → writes `ui/Button.tsx` → `fw verify Button`
until it passes; writes `screens/home.ui.json` → `fw check screens/home.ui.json` until it passes; composes
`src/screens/HomeScreen.tsx` from `ui/` → `fw check src/screens/HomeScreen.tsx`.

**3. Check everything** before you commit:

```sh
npx fw check
```

Besides findings, `fw check` prints what is left for every outline entry:

```
Outline  ui-spec/app.ts: 3 screens, 10 components
  described      3/3
  spec           1/3   todo: CardDetail, Cart  (screens/<name>.ui.json)
  code           1/3   todo: CardDetail, Cart  (src/screens/<Name>Screen.tsx)
  in ui/         8/10  todo: Pagination, Image  (fw docs <Name>, write ui/<Name>, fw verify <Name>)
Navigation
  Home        → CardDetail, Cart   [no back]   (first screen)
  CardDetail  → Cart   [back, else Home]
  Cart        → Checkout   [back]
```

---

## How it works

**Contracts are the source of truth.** One `defineComponent({...})` file produces three things: the
markdown the agent reads (`fw docs`), the types the spec checker validates against, and the assertions
`fw verify` runs on the implementation. Nothing is duplicated, so docs, validation and verification can't
disagree.

**A contract is a shared UI/UX commitment; code is a per-platform implementation.** Two platforms may —
should — differ in code and idiom, but must satisfy the same assertions:

| shared commitment (must match) | platform freedom (may differ) |
|---|---|
| props, types, defaults, events, states | `<button>` vs `FilledButton` |
| behaviour rules (loading disables and keeps size…) | ripple, hover, haptics |
| sizes and spacing via project tokens | font rendering |
| accessibility meaning (role, name, focus) | `aria-*` vs `Semantics` |
| composition (what may contain what) | animation defaults |

**Hard rules live in validators, prose only describes the process.** The generated agent rules file is ~40
lines. It tells the agent *what order to work in* and *which command to run*; every name, type and
structural rule is enforced by `fw check` / `fw verify`.

**Materialize once, compose many.** `ui/` is owned by the project. A component is written when the first
screen needs it and reused by every later screen. If the agent writes a component anywhere else, or writes
raw markup in a screen, `fw check` fails.

---

## Project layout

```
my-app/
├─ ui-rules/                 shipped contracts (copied by fw init; do not edit — override instead)
├─ ui-spec/                  ← YOU write this
│   ├─ app.ts                the outline: every screen and component, by name (write it first)
│   ├─ project.ts            name, platform, agent, design tokens, guard names
│   ├─ domain.ts             business types (Card, Cart, Order…)
│   ├─ screens/*.ts          one per screen: what it shows, what the user can do, where it leads
│   ├─ components/*.rule.ts  extra contracts (yours or the agent's); same-name overrides ui-rules/
│   └─ added/*.rule.ts       contracts generated by `fw add`
├─ ui/                       ← AGENT writes: one implementation per contract, verified
├─ screens/*.ui.json         ← AGENT writes: one spec per screen, checked
├─ src/screens/*Screen.tsx   ← AGENT writes: screens composed from ui/, linted
├─ src/                      app shell (router, store, main) — hand-written, not linted
├─ ui.catalog.json           generated: every contract + where its implementation lives
└─ CLAUDE.md / AGENTS.md / .cursor/rules/ui.mdc / .github/copilot-instructions.md   generated rules
```

---

## Describing your app (`ui-spec/`)

### `app.ts`: the outline

The whole app on one screen: every screen with a one-line purpose, and every component it uses. Write it
before anything else. Every other file may only use names listed here:

```ts
import { defineApp } from '@himz-genui/core';

export default defineApp({
  name: 'PokéCards Shop',
  screens: {
    Home: 'Browse and search the card catalog, open a card, jump to the cart',
    Cart: 'Review items, change quantities, proceed to checkout',
  },
  components: ['Container', 'Stack', 'TopBar', 'List', 'ListItem', 'Button', 'EmptyState', 'Stat'],
});
```

| check | level |
|---|---|
| an outline component has no contract | error |
| a screen description, `goTo` / `back` target or spec uses a screen not in the outline | error |
| a spec or screen file uses a component not in the outline | error |
| `ui/X` exists but `X` is not in the outline | warning |
| an outline screen or component with no detail yet | **not an error**: listed as *todo* in the progress lines |

Every unknown name (component, screen, prop, event, action, domain type, guard) comes with a suggestion
when one is close, including wrong case and swapped words:

```
unknown component "itemlisst", not in the catalog. Did you mean "ListItem"?
action "opencard" is not declared in this screen's actions [...]. Wrong case: it is "openCard".
Button is not in ui-spec/app.ts components, which lists "Buton" (no such contract). Fix the typo in ui-spec/app.ts.
```

`app.ts` is optional: without it `fw check` skips outline checks and prints one hint, so 1.0 projects keep
working.

### `project.ts`

```ts
import { defineProject } from '@himz-genui/core';

export default defineProject({
  name: 'PokéCards Shop',
  platforms: ['react'],
  agent: 'claude',                       // which rules file to generate
  tokens: {
    color:   { primary: '#E3350D', secondary: '#3B4CCA', danger: '#B91C1C', success: '#15803D',
               surface: '#FFFFFF', text: '#1F2937', muted: '#6B7280' },
    spacing: [0, 4, 8, 12, 16, 24, 32, 48],   // specs say "gap": "4" → 16px
    radius:  { sm: 4, md: 8, lg: 16, full: 9999 },
    font:    { body: 'Inter', heading: 'Inter' },
  },
  guards: ['requireCartNotEmpty'],       // names screens may use as guard; bodies are hand-written
  stateLibrary: 'zustand',               // convention: one store library for the project
});
```

Implementations read tokens through `ui/tokens.ts`; change a color here, not in twenty files.

### `domain.ts`

```ts
export default defineDomain({
  Rarity: t.enum(['common', 'uncommon', 'rare', 'holo', 'ultra']),
  Card:   t.object({ id: t.string(), name: t.string(), rarity: t.ref('Rarity'), priceLabel: t.string(), stock: t.number() }),
  Cart:   t.object({ items: t.array(t.ref('CartItem')), subtotalLabel: t.string(), count: t.number() }),
});
```

Screens reference these by name: `"Card[]"`, `"Cart"`.

### The `t` type system

| | |
|---|---|
| `t.string()` `t.number()` `t.boolean()` | primitives |
| `t.text()` | a string the user reads (label, title…): translated in multi-language projects |
| `.int()` | on a number: whole numbers only (page, index, count); `int` in Dart |
| `t.enum(['a', 'b'])` | one of |
| `t.ref('Card')` | a domain type |
| `t.array(x)` `t.object({ … })` | containers |
| `t.void()` | event with no payload |
| `t.node()` | slot content (children) |
| `.opt()` | optional |
| `.def(value)` | optional with default |
| `.desc('…')` | description shown to the agent |

### `screens/*.ts`

One file per screen. The file name is the screen name (`card-detail.ts` → `CardDetail`), the purpose is
in `app.ts`. Every field answers one question:

```ts
// ui-spec/screens/cart.ts
export default defineScreen({
  // What does the user see here?
  shows: ['Each item: thumbnail, name, quantity, line total, remove', 'Subtotal and a checkout button'],

  // What can the user do here that does NOT change screen? action → what it does
  local: { changeQty: 'change the quantity of an item', removeItem: 'remove an item' },

  // Special cases: situation → what the screen does
  when: { 'cart is empty': 'show an empty state with "Continue shopping"; checkout is disabled' },

  // Which data does the screen receive? Types come from domain.ts
  data: { cart: 'Cart' },

  // Where can the user go from here, and how? target screen → what the user does
  goTo: {
    CardDetail: 'tap an item',
    Checkout: 'press Checkout',
    Home: { how: 'press Continue shopping', replace: true },
  },
});
```

| field | meaning | required |
|---|---|---|
| `shows` | what the user sees, plain language | yes |
| `local` | actions that stay on the screen: name → what it does | no |
| `when` | special cases: situation → what the screen does | no |
| `data` | data the screen receives: name → type string (`"Card[]"`) | no |
| `goTo` | target screen → how: a string, or `{ how, action?, replace?, modal? }` | no |
| `back` | omit: back to the previous screen · `false`: no back · `'Home'`: back, to Home when there is no previous screen | no |
| `params` | what the screen receives when opened: name → type string. Declared here only, never by the caller | no |
| `guard` | a guard from `project.ts` that must pass to open the screen | no |

**Navigation is part of each screen.** There is no flow file:

- Each `goTo` target becomes an action `go<Target>` (`goCheckout`). Name it yourself with `action` when it
  does more than navigate: `OrderSuccess: { how: 'press Place order', action: 'placeOrder', replace: true }`.
- Every screen has `goBack`, except the first screen of the outline and screens with `back: false`.
- The screen's actions, the only ones a spec may bind, are the `goTo` actions, the `local` keys and `goBack`.
  The spec does not repeat them.
- The first screen in `app.ts` is where the app starts. Screens no `goTo` leads to are reported as unreachable.
- `shows`, `local` descriptions and `when` are for the agent to read; `fw check` checks the structure and
  every name (targets, actions, types, guards), with *Did you mean …?* on typos.

**1.0 projects:** descriptions with `name` / `purpose` / `actions` / `needs` plus `ui-spec/flows/*.ts`
(`defineFlow`) are still accepted and checked as before. Don't mix them for one screen: a screen described
with `goTo` must not also appear in a flow.

---

## Languages

Single-language apps need nothing. For several languages:

```ts
// ui-spec/project.ts
languages: ['en', 'vi'],        // the first is the default
i18nLibrary: 'i18next',         // convention: how code translates (a library, or your own file)

// ui-spec/strings/en.ts (one file per language, same keys)
export default defineStrings({
  cart: { title: 'Your cart', line: '{set} · {condition} · {price} each' },
});
```

- Contracts mark the props a user reads with `t.text()` (`label`, `title`, `description`, `placeholder`,
  `alt`, `Text.value`…). `fw docs` shows them as *(text)*.
- In specs a text prop takes `{ "i18n": "cart.title" }`; `{placeholders}` are filled from `params`.
- In screen code the agent calls the project's i18n function with the same key.
- The agent adds new keys to the default language, drafts the others, and shows you the new strings.

`fw check` (and `fw check ui-spec/strings`):

| check | level |
|---|---|
| a language in `languages` has no strings file | error |
| a key of the default language missing in another language, or an extra key | error |
| `{placeholders}` differ between languages | error |
| a spec key that does not exist (with *Did you mean*), a missing or unknown param | error |
| `{ "i18n": … }` on a prop that is not text, or in a project without `languages` | error |
| hard-coded text on a text prop, in a spec or in screen code (string or template literal with letters, at any depth; `` `${a} × ${b}` `` passes) | error |
| text written directly between JSX tags in a screen | error |
| a key no spec or source file uses | warning |

Progress gains one line per extra language: `strings vi  34/35   todo: cart.oneLess`.

Not caught: text that reaches a prop through a variable or `setState('…')`, and the unused-key warning is a hint only (any quoted word in `src/` that equals a key counts as a use); and contract defaults such as
`SearchBox.placeholder = 'Search'` (pass the prop). Currency, dates and numbers are formatted by the app
(domain values are pre-formatted strings such as `priceLabel`); data from an API is not translated.

**Upgrading a 1.0 project:** `ui-rules/` is a copy made by `fw init`, so it does not get `t.text()` by
itself. Copy the new contracts from `node_modules/@himz-genui/rules/src/` into `ui-rules/` (they change no
props, so implementations stay verified).

## Flutter

`fw init --platform flutter` (in a Flutter project, or `--create flutter` to scaffold one) sets up the same
`ui-spec/` and screen specs; only the code side differs. Everything is checked the same way.

`fw` itself runs on Node, so a Flutter project also needs a `package.json` with `@himz-genui/core` and
`@himz-genui/rules` as dev dependencies (`npm i -D @himz-genui/core @himz-genui/rules`); `ui-spec/*.ts` imports them.

| | React | Flutter |
|---|---|---|
| component | `ui/ListItem.tsx`, `export function ListItem` | `lib/ui/list_item.dart`, `class UiListItem` |
| screen | `src/screens/CartScreen.tsx` | `lib/screens/cart_screen.dart`, `class CartScreen` |
| props / events / children | props type, `onPress`, `children` | named constructor params, `VoidCallback? onPress` / `ValueChanged<T>? onChange`, `List<Widget> children` |
| tokens | `ui-spec/project.ts` imported directly | `lib/ui/tokens.g.dart` (`UiTokens.colorPrimary`, `UiTokens.space(4)`), generated |
| strings | the project's i18n function | `lib/l10n/strings.g.dart` (`UiStrings.cartEmptyTitle`, `UiStrings.cartLine(count: 3)`), generated |
| type check | `tsc` | `flutter analyze` |

**Every Flutter class has the `Ui` prefix.** 19 contract names collide with Flutter widgets (`Text`,
`Card`, `Switch`, `Table`…) and `List` collides with `dart:core`, so one rule for all names.

**`fw docs <Name>` prints the exact Dart signature** the agent fills in, and `fw verify` checks exactly it:

```dart
enum UiButtonVariant { primary, secondary, ghost, danger }
enum UiImageRatio { v1x1, v4x3, v3x4, v16x9, v5x7 }        // '5:7' → v5x7, 'oldest-first' → oldestFirst

class UiSelectOption { const UiSelectOption({required this.value, required this.label}); … }

class UiSelect extends StatelessWidget {
  const UiSelect({super.key, required this.label, required this.value, required this.options,
    this.placeholder, this.disabled = false, this.error, this.onChange});
  final String label; final String value; final List<UiSelectOption> options;
  final String? placeholder; final bool disabled; final String? error;
  final ValueChanged<String>? onChange;
  …
}
```

`fw verify` (Flutter) reports a missing class, constructor parameter, field or callback; `required` where the
contract says optional (and the reverse); a wrong kind (`bool` where the contract says string); an optional
without default that is not nullable; missing enum values or item-class fields; `children` on a component
that takes none. It reads Dart by these conventions (no Dart SDK needed); `flutter analyze` stays the real
type check.

**Screens** import `lib/ui/ui.dart` (generated barrel) and, for the base classes only,
`package:flutter/widgets.dart show StatelessWidget, StatefulWidget, State, Widget, BuildContext`.
`fw check lib/screens/…` reports: importing `material.dart` / `cupertino.dart` or other widgets from
`widgets.dart`; constructing any widget that is not in `lib/ui/` (`Column`, `Text`, a third-party widget);
a second widget class in the screen file; and, with several languages, string literals with letters on text
props (`label: 'Checkout'`, `'Cart ($n)'`; `'$a × $b'` passes). Nested item constructors and values that
reach a prop through a variable are not inspected.

Generated files (`lib/ui/ui.dart`, `lib/ui/tokens.g.dart`, `lib/l10n/strings.g.dart`) are rewritten by every
`fw` command; do not edit them. They need no pub dependencies.

[`examples/gallery-flutter`](./examples/gallery-flutter) and [`examples/gallery-react`](./examples/gallery-react) implement every shipped contract on both platforms from the same `ui-spec/`, with a test per component on each side. `npm run test:parity` fails if they drift apart; the gallery READMEs list where the two still differ.

## State and form libraries

`fw` owns the UI layer only. Components are controlled (values in through props, changes out through `onX`),
so any state or validation library works: the screen reads state with the library's hooks or calls and
passes validation results to the `error` prop of the input.

```tsx
const email = useCheckout((s) => s.email);                        // zustand, Redux, Jotai, TanStack Query…
const error = z.string().email().safeParse(email).success ? undefined : t('checkout.emailInvalid');   // zod, yup…
<Input label={t('checkout.email')} value={email} error={error} onChange={setEmail} />
```

Hooks and calls need nothing. **Wrappers** that libraries put around UI (`BlocBuilder`, `Obx`, `<FormProvider>`)
are allowed in screens when `stateLibrary` in `project.ts` names the library, or when listed in `screenWrappers`:

| `stateLibrary` contains | allowed in screens |
|---|---|
| `bloc` | `BlocBuilder`, `BlocListener`, `BlocConsumer`, `BlocSelector`, `BlocProvider`, `MultiBlocProvider`, `MultiBlocListener`, `RepositoryProvider` |
| `getx` | `Obx`, `GetBuilder`, `GetX` |
| `mobx` / `mobx-react(-lite)` | `Observer` |
| `riverpod` / `hooks_riverpod` | `Consumer` (`HookConsumer`), `ProviderScope` |
| `provider` | `Consumer`, `Selector`, `ChangeNotifierProvider`, `MultiProvider` |
| `signals` | `Watch` |
| `react-hook-form` | `FormProvider`, `Controller` |
| `react-redux` / `redux`, `jotai` | `Provider` |
| `@tanstack/react-query` | `QueryClientProvider` |

```ts
stateLibrary: 'bloc',                 // or 'zustand, react-hook-form'
screenWrappers: ['MyStoreScope'],     // your own non-visual wrappers
```

What a wrapper renders is still screen code: `BlocBuilder(builder: (_, s) => Text('…'))` still fails on `Text`.
Components that draw inputs themselves (Formik's `Field`) are not wrappers; put them behind a contract or use
the library's hooks (`useField`).

## Contracts

A contract describes one component for every platform. Everything machine-checkable is a type;
prose is for behaviour.

```ts
// ui-rules/Button.rule.ts (shipped)
import { defineComponent, t } from '@himz-genui/core';

export default defineComponent({
  name: 'Button', category: 'action',
  purpose: 'Triggers an action. Not for navigation to another screen — use Link.',
  props: {
    label:     t.string(),
    variant:   t.enum(['primary', 'secondary', 'ghost', 'danger']).def('primary'),
    size:      t.enum(['sm', 'md', 'lg']).def('md'),
    disabled:  t.boolean().def(false),
    loading:   t.boolean().def(false),
    icon:      t.string().opt().desc('icon name shown before the label'),
    fullWidth: t.boolean().def(false),
  },
  events: { press: t.void() },
  states: ['default', 'hover', 'pressed', 'focused', 'disabled', 'loading'],
  rules: [
    'loading=true implies disabled, replaces the label with a spinner, and keeps the same width and height.',
    'Never emits press while disabled or loading.',
    'Height by size: sm 32, md 40, lg 48 logical pixels.',
  ],
  a11y: ['Role button.', 'Label is the accessible name.', 'Visible focus ring.'],
  composition: { canContain: [], cannotBeInside: ['Button', 'Link'] },
  platform: {
    react:   ['use <button type="button">, never a div with onClick', 'aria-busy while loading'],
    flutter: ['FilledButton / OutlinedButton / TextButton by variant', 'onPressed null when disabled or loading'],
  },
  examples: [{ label: 'Add to cart' }, { label: 'Saving…', loading: true }],
});
```

| field | meaning |
|---|---|
| `props` | typed props; `.def()` / `.opt()` mark optional |
| `events` | emitted events; the React implementation exposes `onPress` for `press` |
| `children` | `true` if it accepts child elements |
| `states` | visual/interaction states the implementation must have |
| `rules` | platform-neutral behaviour every implementation must honour |
| `a11y` | accessibility meaning (not API) |
| `composition.canContain` | allowed direct children (`[]` = none) |
| `composition.cannotBeInside` | forbidden ancestors, any depth |
| `platform.<name>` | advisory hints for one platform — never a shared rule |
| `version` | bump to force re-verification of existing implementations |

**Shipped contracts** (`@himz-genui/rules`, 76):

| category | components |
|---|---|
| layout | Stack, Inline, Grid, Container, Spacer, Divider, SectionHeader, HorizontalScroll, PullToRefresh, InfiniteScroll |
| typography | Text, Heading, RichText |
| action | Button, IconButton, Link, FloatingActionButton |
| input | Input, Textarea, Select, SearchBox, Checkbox, RadioGroup, Switch, Slider, NumberInput, DatePicker, FileUpload, Rating, Combobox, ChipGroup, PinInput, DateRangePicker |
| form | FormField |
| data | Card, Badge, Tag, Stat, List, ListItem, Table, Avatar, Accordion, DescriptionList, Timeline, SwipeActions, AvailabilityCalendar |
| media | Image, Icon, Carousel, Video, ImageViewer |
| feedback | EmptyState, Skeleton, Alert, Toast, Spinner, ProgressBar, Tooltip |
| navigation | Pagination, Tabs, TopBar, BottomNav, SegmentedControl, Sidebar, Breadcrumbs, Stepper, SiteHeader, SiteFooter |
| overlay | Modal, Drawer, Menu, ConfirmDialog |
| chart | LineChart, BarChart, PieChart |

**Your own contracts** go in `ui-spec/components/<Name>.rule.ts`. A file with the same `name` as a shipped
contract overrides it. Never edit `ui-rules/` directly — upgrades would clobber it.

**Implementation conventions (React):** `ui/<Name>.tsx`, `export function <Name>(props: <Name>Props)`,
props interface named `<Name>Props`, event `x` → prop `onX`, children via `children?: ReactNode`.

---

## Screen specs

The agent writes one JSON file per screen before any code, and `fw check` verifies it. **People do not
write or read this file**: to see what the agent built, run `fw docs Home` (below). Flat map, parent–child by id:

```json
{
  "screen": "Home",
  "root": "page",
  "elements": {
    "page":  { "type": "Container", "props": { "maxWidth": "xl" }, "children": ["bar", "grid", "pager"] },
    "bar":   { "type": "TopBar", "props": { "title": { "i18n": "shop.name" } }, "on": { "actionPress": "goCart" } },
    "grid":  { "type": "Grid", "props": { "minItemWidth": 240 }, "children": ["tile"] },
    "tile":  { "type": "Card", "repeat": { "path": "/cards", "as": "card" }, "props": { "pressable": true }, "on": { "press": "goCardDetail" }, "children": ["img", "name", "add"] },
    "img":   { "type": "Image", "props": { "src": { "path": "card/imageUrl" }, "alt": "", "ratio": "5:7" } },
    "name":  { "type": "Heading", "props": { "value": { "path": "card/name" }, "level": "3", "size": "sm" } },
    "add":   { "type": "Button", "props": { "label": { "i18n": "common.addToCart" }, "size": "sm" }, "on": { "press": "addToCart" } },
    "pager": { "type": "Pagination", "props": { "page": { "path": "/page" }, "pageCount": { "path": "/pageCount" } }, "on": { "change": "changePage" } }
  }
}
```

- `data` and actions come from `ui-spec/screens/home.ts`; the spec does not repeat them (1.0 specs that
  declare `"data"` / `"actions"` still work).
- A prop value is one of:

  | value | meaning |
  |---|---|
  | a literal | `"xl"`, `240`, `true`, `[{ … }]` |
  | `{ "path": "/card/set/name" }` | screen data; every segment is typed through `domain.ts` |
  | `{ "path": "card/name" }` | the current item of a `repeat` (no leading slash) |
  | `{ "i18n": "cart.line", "params": { "price": { "path": "line/card/priceLabel" } } }` | translated text (text props only, see *Languages*) |

  These work at any depth: `TopBar.actions[0].label` can be `{ "i18n": … }`.
- `"repeat": { "path": "/cards", "as": "card" }` renders the element once per item. Inside it (and its
  children) `card/…` reads the item. A list is never indexed into: `/cart/items/0` is an error that
  points to `repeat`.
- An enum value may go into a string prop (`Badge.label` ← `card/rarity`).
- `on` maps a component event to one of the screen's **action names** (`goCardDetail`, `addToCart`,
  `goBack`…). Never code.
- An element has one parent; reuse means a second element with its own id.

**`fw docs <Screen>`** prints a screen for people: its description, the layout as a tree, and where it leads.

```
Container
├─ TopBar   title "Your cart" · back → goHome
└─ Stack
   ├─ List
   │  └─ ListItem   for each /cart/items as line: title line/card/name · trailing line/lineTotalLabel · press → goCardDetail
   ├─ EmptyState   title "Your cart is empty" · actionLabel "Continue shopping" · action → goHome
   └─ Inline
      ├─ Stat   label "Subtotal" · value /cart/subtotalLabel
      └─ Button   label "Checkout" · press → goCheckout
```

`fw check <spec>` reports, with a location for every finding:

| finding | example location |
|---|---|
| unknown component / prop / event | `elements.hero.type` |
| missing required prop, wrong literal type | `elements.add.props.label` |
| binding to undeclared or mistyped data, unknown field (with *Did you mean*) | `elements.txt.props.value` |
| repeat over a non-list, repeat variable out of scope or clashing | `elements.row.repeat.path` |
| unknown string key, missing / extra `{placeholder}` param, hard-coded text in a multi-language project | `elements.bar.props.title.i18n` |
| action not declared by the screen | `elements.inner.on.press` |
| composition violation (Button in Button, Text in List) | `elements.inner` |
| cycle, unreachable element, missing child id | `elements.page` |
| component not yet materialized for the platform | `elements.add.type` |

---

## Commands

Five commands. No flags except on `init` and `add`. **Every command refreshes `ui.catalog.json` and the
agent rules first**, so there is nothing to keep in sync by hand.

```
fw init --agent <claude|cursor|codex|copilot> --platform <react|flutter> [--name "App"] [--create vite|next|flutter]
fw add <file.tsx> [--name X]
fw check [<path>...]
fw docs <Name>
fw verify [<Name>...]
```

### `fw init`

Copies shipped contracts to `ui-rules/`, creates the `ui-spec/` skeleton (never overwrites existing
files), generates the rules file for your agent. `--create` scaffolds the app first.

### `fw add <file.tsx>`

Registers a component you already have. Reads its `Props` type with the TypeScript compiler, writes a
minimal contract to `ui-spec/added/<Name>.rule.ts` whose `impl` points at the original file, and verifies
it. The original file is not touched. Fill in `purpose` and `rules` afterwards.

### `fw check`

| invocation | checks |
|---|---|
| `fw check` | **everything**: the outline, every implementation in `ui/`, every spec in `screens/`, screen descriptions and navigation, screen code in `src/screens/` and `screens/`, then the progress lines |
| `fw check ui-spec/app.ts` | the outline |
| `fw check screens/home.ui.json` | that spec |
| `fw check src/screens/HomeScreen.tsx` | that screen file |
| `fw check screens/ src/screens/` | every spec / screen file under those folders |
| `fw check ui-spec/screens` | screen descriptions and navigation: targets, actions, back, params, guards, reachability |

Paths are classified by extension: `*.ui.json` → spec, `*.tsx`/`*.jsx` → screen code, anything under
`ui-spec/screens` (or 1.0 `ui-spec/flows`) → descriptions and navigation, `ui-spec/app.ts` → outline, folders recurse. Mix freely.

Output: one `PASS`/`FAIL` line per file, findings with locations, then a summary. Exit `0` clean, `1`
findings, `2` usage error.

### `fw docs <Name>`

With a screen name, prints the screen for people (description, layout tree, navigation). With a component name:

Prints a contract as markdown: props table, events, states, rules, a11y, composition, platform hints,
examples. The agent reads this before writing `ui/<Name>.tsx`.

### `fw verify [<Name>...]` *(agent-side)*

Checks implementations against contracts with the TypeScript compiler API:

| check | level |
|---|---|
| an export with the contract's name (function / const / `forwardRef` / `memo`) | error |
| a props type on the first parameter (interface, alias, intersection, extends) | error |
| every contract prop present with the right kind; enums with **every** member; required not made optional | error |
| every event `x` has an `onX` function prop | error |
| `children` present iff the contract accepts children | error |
| extra props not in the contract (e.g. `className`) | warning |
| a React hint like `use <button` whose tag is absent from the source | warning |

On pass, the catalog records the implementation path; on fail it is removed, so `fw check` will flag every
spec that uses the component. Without names, verifies every contract that has an implementation.

---

## Agent rules

`fw` generates one short rules file for the agent you chose:

| agent | file |
|---|---|
| Claude Code | `CLAUDE.md` (pointer) + `.claude/skills/ui/SKILL.md` |
| Cursor | `.cursor/rules/ui.mdc` |
| Codex and other `AGENTS.md` readers | `AGENTS.md` |
| GitHub Copilot | `.github/copilot-instructions.md` |

Content is wrapped in `<!-- fw:start -->` … `<!-- fw:end -->`; anything you write outside the markers is
preserved. The file is ~40 lines: eight rules, the catalog names grouped by category, and the commands.
Contract details are *not* inlined — the agent reads them on demand with `fw docs`.

The rules, in short:

1. `ui-spec/app.ts` is the outline. New screen or component? Add it there first. *Did you mean …?* on a typo means fix the name.
2. Screen in the outline with no description? Draft `ui-spec/screens/<name>.ts`, show it to the user, wait for approval.
3. Need a component not in `ui/`? `fw docs` → write `ui/<Name>.tsx` → `fw verify` until pass. Never elsewhere, never rewrite.
4. Building a screen? Write `screens/<name>.ui.json` first.
5. Specs use catalog names and the screen's actions only. `fw check <spec>` until pass.
6. Compose `src/screens/<Name>Screen.tsx` from `ui/` only. `fw check <file>`.
7. Tokens from `ui-spec/project.ts`, never hard-coded.
8. Navigation from `goTo` / `back` in `ui-spec/screens/`, never invented.

---

## Registering existing components

Most teams already have components. Don't rewrite them:

```sh
npx fw add src/components/PriceTag.tsx
```

```ts
// generated: ui-spec/added/PriceTag.rule.ts
export default defineComponent({
  name: 'PriceTag', category: 'composite',
  purpose: 'TODO: what it is for, and what not to use it for.',
  props: { amount: t.number(), currency: t.enum(['USD', 'EUR']), strike: t.boolean().opt() },
  events: { click: t.void() },
  rules: [],
  impl: { react: 'src/components/PriceTag.tsx' },
});
```

From here the agent uses `PriceTag` like any shipped component, and `fw check` accepts imports from the
registered path. Type mappings `fw add` cannot infer are left as `t.string() /* TODO */` and listed in the
output.

---

## CI

```yaml
- run: npm ci
- run: npx fw check
```

`fw check` exits non-zero on any finding. Pair it with `tsc --noEmit` and your build.

---

## Limitations

- **`fw add` is React-only.** Registering an existing Flutter widget as a contract is not supported yet;
  write the contract in `ui-spec/components/` and point `impl.flutter` at the file.
- **`fw verify` is static.** It checks exports, prop names/kinds, enum members, handlers and children with
  the TypeScript compiler — not runtime behaviour. Generated behavioural tests (Testing Library / widget
  tests) are the next milestone.
- **No shell contracts yet.** `defineShell` (tabs / sidebar layout) and `defineSources` (where data comes
  from, loading/error states) are designed but not implemented. The app shell is hand-written.
- **`fw init --create`** shells out to `npm create vite` / `create-next-app` / `flutter create`. The Flutter
  one is tested (the project name is made a valid package name); the npm ones are not.
- **Runtime TypeScript.** `fw` runs its own sources through `tsx`, so `ui-spec/` files are plain `.ts`. If
  your `tsconfig` includes `ui-spec/`, add `"allowImportingTsExtensions": true`.
- **Consistency is per project.** Two projects materializing the same contract will get different code.
  That is by design.

---

## FAQ

**Why not just ship the components?** Then we would maintain one implementation per platform and you
would inherit our styling decisions. Contracts are written once, and the implementation matches *your*
tokens and *your* platform idioms while still passing the same assertions.

**Why does the agent write a JSON spec before code?** The spec is the checkpoint. It is cheap to validate
exhaustively (names, types, composition), it is easy to review, and it stays next to the code as the
screen's documentation.

**What if I need a component that isn't in the 76?** Write a contract in `ui-spec/components/`, composing
from existing primitives where possible. The agent can do this too. The catalog grows with the project.

**Can I change a shipped contract?** Override it: same `name` in `ui-spec/components/`. Don't edit
`ui-rules/`.

**Where do routes, stores and API calls go?** In `src/` outside `src/screens/`, hand-written. `fw` deliberately
does not check them; `goTo` / `back` declare *what* navigates where, the shell decides *how*.

**Does it work with Next.js?** Yes for the framework's part (contracts, specs, `ui/`, screens). Wire screens
into the App Router yourself; the *Navigation* lines of `fw check` give you the graph.

---

## Example

[`examples/pokemon-shop`](./examples/pokemon-shop) is a trading-card shop built entirely through the loop:
an outline, 5 screen descriptions with their navigation, 5 specs, 22 materialized components, 5 composed screens, a hand-written Vite
shell with router and store, and a `.fixtures/` folder with deliberately broken inputs.

```sh
git clone https://github.com/Himz-Hung/Gen-UI && cd genui-fw && npm install
cd examples/pokemon-shop
npm run check                 # fw check: 42 passed
npx vite && open http://localhost:5173
node ../../packages/core/bin/fw.js check .fixtures   # 2 failed, on purpose
```

---

## Contributing

```sh
npm install
npm test          # typecheck + full check + tsc + vite build on the example
```

- Contracts live in `packages/rules/src/*.rule.ts`. Keep `rules` platform-neutral; put platform-specific
  wording under `platform.<name>`. Add the name to `packages/rules/src/index.ts`.
- CLI and library live in `packages/core/src`. `index.ts` is the browser-safe surface (it ends up in app
  bundles via `ui/tokens.ts`); Node-only code is exported from `node.ts`.
- Docs in Vietnamese: [`docs/vi/`](./docs/vi).

## License

MIT © Himz
