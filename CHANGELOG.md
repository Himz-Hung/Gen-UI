# Changelog

## Unreleased (1.2.0)

- **47 new contracts, 76 in total.** booking: DateRangePicker (ranges never cross booked nights, min / max nights), AvailabilityCalendar (available / limited / booked / closed days with prices) · site chrome for web and mobile: SiteHeader (links collapse into a drawer menu on narrow screens), SiteFooter (columns stack and collapse on narrow screens) · action: FloatingActionButton · typography: RichText (a safe Markdown subset) · layout: HorizontalScroll · media: ImageViewer · and input: Textarea, RadioGroup, Switch, Slider, NumberInput, DatePicker, FileUpload, Rating, Combobox, ChipGroup, PinInput · form: FormField · data: Table, Avatar, Accordion, DescriptionList, Timeline, SwipeActions · media: Icon, Carousel, Video · feedback: Toast, Spinner, ProgressBar, Tooltip · navigation: BottomNav, SegmentedControl, Sidebar, Breadcrumbs, Stepper · overlay: Drawer, Menu, ConfirmDialog · chart: LineChart, BarChart, PieChart · layout: SectionHeader, PullToRefresh, InfiniteScroll. `List` may now contain `SwipeActions`; `IconButton` gets a `badge` (count or dot). `Input` with `type: 'password'` always has a show / hide toggle, named by the new `revealLabel` (translatable). Each has props, events, states, rules, a11y, composition, `t.text()` on readable props, and React and Flutter hints. No new `t` kinds, so they work with core 1.1.
- `fw docs` lists fields inside array / object props that are text or have a description (`columns[].label (text)`).
- **Flutter.** `platforms: ['flutter']` (or both) is supported end to end:
  - conventions: `lib/ui/<snake>.dart` with `class Ui<Name>` (every class has the `Ui` prefix: 19 names collide with Flutter widgets and `List` with `dart:core`), named constructor params, `VoidCallback? onPress` / `ValueChanged<T>? onChange`, `List<Widget> children`; enum values mapped to Dart names (`'5:7'` → `v5x7`); screens in `lib/screens/<snake>_screen.dart`;
  - `fw docs` prints the exact Dart signature; `fw verify` checks it with a convention-driven Dart reader (no Dart SDK needed; `flutter analyze` is the type check);
  - `fw check` on Dart screens: no `material.dart` / `cupertino.dart`, `widgets.dart` only for base classes, no widget outside `lib/ui/`, no second widget class in a screen, no hard-coded text on text props with several languages;
  - every `fw` command generates `lib/ui/tokens.g.dart`, `lib/ui/ui.dart` and `lib/l10n/strings.g.dart` (a dependency-free `UiStrings`); unused-key detection understands `UiStrings.x`;
  - per-platform progress and verify; `fw init --platform flutter` and `--create flutter` (valid package name from `--name`); agent rules per platform;
  - React and Flutter hints on all 76 contracts.
- **Whole numbers:** `t.number().int()` marks pages, indexes and counts. Dart gets `int` (TypeScript keeps `number`), `fw docs` shows `integer`, and `fw check` rejects decimals there. 17 props and events are marked (Pagination, Stepper, Carousel, Skeleton, Textarea, PinInput, Rating, Toast, chart press indexes). **`@himz-genui/rules` 1.2 needs `@himz-genui/core` ^1.2.0.**
- `fw verify` (Flutter) also checks callback payload types (`ValueChanged<int>` is not `ValueChanged<double>`) and the field types of item classes.
- `Table` gets a `loading` prop (its `loading` state had no way to be set).
- `examples/gallery-flutter`: all 76 contracts materialized in Flutter, a Home screen composed from `lib/ui`, 86 widget tests; `npm run test:flutter` runs fw check, flutter analyze and flutter test. Its README lists the contract rules the implementations do not fully meet.
- Existing projects: copy the new contracts from `@himz-genui/rules/src/` into `ui-rules/` to use them.

## 1.1.0 — 2026-09-28

Requires `@himz-genui/core` 1.1.0 for `@himz-genui/rules` 1.1.0 (contracts use `t.text()`).

- **Outline file `ui-spec/app.ts`** (`defineApp`): every screen and component of the app, by name, written first. `fw check` enforces it: screen descriptions, flows, specs and screen code may only use names listed there; outline components must have a contract; `ui/X` not in the outline is a warning. Optional: projects without it get one hint line and no outline checks.
- **Progress lines** after `fw check`: per outline entry, whether it is described, has a spec, has screen code, and (components) is in `ui/`. Missing work is listed as *todo*, never as an error.
- **Did you mean …?** on every unknown name: component, screen, prop, event, action, domain type, guard, flow target. Handles wrong case (`stat` → `Stat`) and swapped words (`itemlisst` → `ListItem`). A typo in the outline is reported as such instead of being suggested back.
- `fw check <spec>` still checks a node's actions when its component name is wrong, so one run shows more errors.
- **New screen description format** (`defineScreen` with `shows` / `local` / `when` / `data` / `goTo` / `back` / `params` / `guard`). One file per screen, named after the screen (`card-detail.ts` → `CardDetail`); the purpose lives in the outline. Each field answers one plain question.
- **Navigation lives in each screen; no flow file.** `goTo: { Checkout: 'press Checkout' }` makes the action `goCheckout` (or a custom `action`), `replace` / `modal` set the mode. Every screen has `goBack` except the first outline screen and `back: false`; `back: 'Home'` is the fallback with no history. Params are declared once, on the receiving screen. The first outline screen is where the app starts.
- Specs take `data` and actions from the screen description and no longer need to repeat them. `goBack` on a screen without back, and a misspelled `goTo` target, get their own messages.
- `fw check` prints a **Navigation** map derived from `goTo` / `back`, and `fw check ui-spec/screens` checks descriptions and navigation. Unknown description fields get *Did you mean …?*.
- Agent rules: when an outlined screen has no description, the agent drafts one, plus any domain types it needs, and waits for the user's approval before writing its spec.
- Progress gains a `domain` line (types used by screens, specs or other types but not declared). A domain type referring to an undeclared type is an error; `fw check ui-spec/domain.ts` checks just that.
- 1.0 descriptions (`name` / `purpose` / `actions` / `needs`) with `ui-spec/flows/*.ts` still work unchanged; one screen may not be described both ways. The Pokemon shop example is migrated to the new format.
- **Bindings typed at every depth:** `{ "path": "/cart/subtotalLabel" }` follows the domain types field by field, with *Did you mean* on unknown fields; indexing into a list points to `repeat`. An enum value may be bound to a string prop.
- **`repeat`** on a spec element: `"repeat": { "path": "/cart/items", "as": "line" }` renders it per item; inside, `{ "path": "line/card/name" }` reads the item. Replaces the `""` placeholders templates needed before. An element may have only one parent.
- Prop values (literal, binding, translated text) are checked at any depth, e.g. `TopBar.actions[0].label`.
- **Languages:** `languages` and `i18nLibrary` in `project.ts`, one `ui-spec/strings/<lang>.ts` per language (`defineStrings`, nested keys, `{placeholder}`s). Contracts mark readable props with `t.text()` (all 29 shipped contracts updated; no version bump). Specs use `{ "i18n": "key", "params": { … } }`. `fw check` reports missing languages and translations, extra keys, placeholder mismatches, unknown keys and params, `i18n` on non-text props, hard-coded text on text props in specs and in screen code (string and template literals with letters, JSX text), and unused keys (warning). Progress shows one `strings <lang>` line per extra language. `fw check ui-spec/strings` checks just the strings.
- **`fw docs <Screen>`** prints a screen for people: description, the spec as a tree (text, bindings, repeats, events) and navigation. A name that is both a component and a screen shows the component, with a note.
- Pokemon shop: specs use `repeat` and real bindings, all UI text is in `ui-spec/strings/en.ts` and `vi.ts`, a small hand-written `src/i18n.ts` (`?lang=vi`).
- Upgrading from 1.0: `ui-rules/` is a copy, so re-copy the contracts from `@himz-genui/rules` to get `t.text()`.
- `fw check ui-spec/app.ts` checks just the outline.
- Library API (`@himz-genui/core/node`): `Project.descriptions` is replaced by `Project.screens` (normalized `ScreenInfo[]`, both formats), and `checkFlows` returns `Report[]` (one per screen file, plus one for 1.0 flows). `fw init` writes an `app.ts` template. Agent rules gain rule 0 (outline first).

## 1.0.0 — 2026-09-24

First release.

- `@himz-genui/core`: `t` type system, `defineComponent` / `defineProject` / `defineDomain` / `defineScreen` / `defineFlow`, and the `fw` CLI with five commands: `init`, `add`, `check`, `docs`, `verify`.
- `@himz-genui/rules`: 29 platform-neutral component contracts.
- Checks: spec vs catalog (types, props, bindings, events, actions, composition, reachability), flows vs screens (targets, params, guards), screen code vs `ui/` (imports, raw markup), component code vs contract (static, TypeScript AST).
- Agent rules generated for Claude Code, Cursor, Codex and GitHub Copilot.
- React only. Flutter, behavioural test generation, `defineShell`, `defineSources` and an MCP server are planned.
