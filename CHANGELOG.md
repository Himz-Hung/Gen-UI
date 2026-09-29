# Changelog

## 1.3.0 — 2026-09-29

Behavioural checks, and a prebuilt CLI. Both packages move to 1.3.0; `@himz-genui/rules` 1.3.0 requires
`@himz-genui/core` ^1.3.0 (contracts carry `checks`).

- **`checks` in contracts: commitments a machine tests.** Eight platform-neutral kinds: `size` (height / width per enum value, a number or a `{ token }` from `project.ts`), `keepsSize`, `emits` (press, or Tab + Enter / Space; optional visible `target` text), `neverEmits`, `role` (with accessible name, literal or from a prop), `key`, `rendersNothing`, `minTarget`. `level: 'warn'` reports without failing; `null` in a check's `props` leaves an optional prop out.
- **`fw verify` runs them.** For every component whose surface passes, it generates `test/fw/<Name>.contract.test.tsx` (vitest + Testing Library, jsdom) or `test/fw/<snake>_contract_test.dart` (`flutter_test`), runs the platform's runner, and reports each failure at `checks[i]` with expected and actual values. jsdom has no layout, so `size` / `keepsSize` / `minTarget` are reported as skipped on React and measured on Flutter. Warning-level tests run only under `fw verify`, so a plain `vitest` / `flutter test` stays green on them. A React project without a vite / vitest config gets a minimal one in `test/fw/` (automatic JSX runtime, jsdom).
- **`fw check` stays static**: it validates `checks` (unknown kinds, props, events, enum values, wrong value types) but never runs tests. CI: `npx fw check` then `npx fw verify`.
- **53 of the 76 shipped contracts carry checks (124 in total).** The other 23 (pure layout, Menu, Tooltip, FormField, Video…) have nothing the current kinds can measure; their rules stay prose.
- `fw docs <Name>` prints the checks.
- `fw init` adds `test/fw/` to `.gitignore` (generated, rebuilt on every run) and, on React, sets `"test": "fw verify"` when the project has no test script (otherwise it prints how to chain it).
- **`fw add` understands real component libraries.** React: props come from the TypeScript type checker, so `forwardRef`, `memo`, `extends` / intersections (MUI's `ButtonProps`, `React.ButtonHTMLAttributes`, cva's `VariantProps`) resolve; props declared in your code go into the contract, props inherited from a library are listed (one summary line for HTML attributes) for you to opt in, and `fw verify` resolves opted-in library props through the library type. Before, a MUI wrapper produced a contract without its inherited props and a shadcn `forwardRef` component failed.
- **`fw add` for Flutter** (`fw add lib/widgets/price_tag.dart`): the first public widget (or `--name`) from its named constructor, with enums declared in the file, `onX` callbacks, `List<Widget> children` and literal defaults. The widget keeps its own class and enum names; `fw verify`, the generated tests and `fw check` on screens accept them.
- **`screenDirs` / `freeformDirs` in `project.ts`.** Choose where the screen rules apply (default `src/screens`, `screens`, `lib/screens`) and which folders are deliberately free (a landing page). `fw check` now reports a common UI folder (`src/pages`, `app`, `src/app`, `src/views`, `src/routes`, `lib/pages`, `lib/views`) that has code but is in neither list, instead of skipping it silently.
- **Screens pass contract props only.** `fw check` rejects props that are not in a component's contract (or `onX` handlers of its events) in React screens: `className`, `style`, `sx`… Styling lives inside `ui/`.
- **Design tokens for styling libraries:** `tailwindPreset(project)`, `muiTheme(project)` (for `createTheme`) and `cssVariables(project)` from `@himz-genui/core`, so Tailwind / MUI / CSS read the tokens of `ui-spec/project.ts` instead of a second copy.
- **More library presets** (`stateLibrary` / `i18nLibrary`): `@apollo/client`, `urql`, `swr`, `react-relay`, `recoil`, `@reduxjs/toolkit`, `@tanstack/react-form` (`form.Field`, `form.Subscribe`), `formik` (`Formik`, `FieldArray`), `react-final-form` (`Form`, `FormSpy`), `react-router` (`Navigate`), and i18n providers for `i18next`, `react-intl`, `next-intl`, `lingui`. Member tags like `form.Field` are no longer mistaken for raw markup.
- README "Integrations": recipes for react-hook-form, TanStack Form, Formik, React Router, Next.js App Router, UI kits and Tailwind. `tests/compat/` fixtures (a screen per library pattern with the expected `fw check` answer) run in `npm test`.
- **Flutter screens: only constructing a widget counts, as on the web.** `fw check` reads the libraries a screen imports (Flutter SDK and pub packages, through `.dart_tool/package_config.json`) to know which classes are widgets and which calls construct them. `MediaQuery.of`, `Theme.of`, `Navigator.of(context).push…`, `GoRouter.of`, `ScaffoldMessenger.of`, `AppLocalizations.of`, `Get.toNamed`, route classes and other non-widget classes no longer fail; `Text(…)`, `Navigator(…)`, a package's `ReactiveTextField(…)` still do. Flutter imports need `show` (any names); screens may extend `ConsumerWidget` / `HookWidget` / `HookConsumerWidget`.
- **Flutter presets:** flutter_hooks (`HookBuilder`), hooks_riverpod (`HookConsumer`), reactive_forms (`ReactiveForm`, `ReactiveValueListenableBuilder`, `ReactiveFormField`, …), flutter_form_builder (`FormBuilder`, `FormBuilderField`), more provider / signals wrappers.
- **Flutter i18n with ARB:** `i18nLibrary: 'flutter_localizations'` (or `intl`) makes fw write `lib/l10n/app_<lang>.arb` (and `l10n.yaml` when missing) from `ui-spec/strings` instead of `UiStrings`; screens read `AppLocalizations.of(context)!`, unused-key detection and hard-coded-text messages follow.
- **`lib/ui/theme.g.dart`:** `uiTheme()` builds a Material `ThemeData` from the tokens (color scheme, font, radius, `MaterialTapTargetSize.shrinkWrap`) for the shell; size tokens also land in `UiTokens`.
- `tests/compat/flutter` (13 screens against go_router, auto_route, flutter_bloc, GetX, riverpod + hooks, provider, reactive_forms, flutter_form_builder, easy_localization, get_it) and `tests/compat/flutter-l10n` (ARB) run in `npm run test:flutter`.
- **The CLI is prebuilt JavaScript.** `@himz-genui/core` ships `dist/` (JS + `.d.ts`) instead of `src/`; `exports` point there. `fw` no longer spawns a `tsx` process; it registers `tsx` in-process only to load your `ui-spec/` and `ui-rules/` TypeScript (ESM or CommonJS projects). Your `tsconfig` no longer needs `allowImportingTsExtensions`, and strict flags (`exactOptionalPropertyTypes`, `noUncheckedIndexedAccess`, `skipLibCheck: false`) no longer report errors inside the package. Startup is faster (`fw --help` 0.63s → 0.48s).
- Agent rules: a failing `checks[i]` means the component is wrong; fix the component, never the check or the generated test.
- Galleries: the checks found and 1.3 fixed eleven contract breaches. Flutter: Button kept neither its width while loading nor its 32 / 40 height, IconButton and FloatingActionButton were padded to 48, Input / Textarea / Slider labels were not the fields' accessible names, Spinner was not a live region, SegmentedControl options were not radios. React: Toast used role status for danger, Image hid its alt while loading and after an error. Material controls in the Flutter gallery now use `MaterialTapTargetSize.shrinkWrap`, so the laid-out size is the contract size.
- **Upgrading:**
  - copy the 1.3 contracts from `node_modules/@himz-genui/rules/src/` into `ui-rules/` to get their `checks`;
  - React: `npm i -D vitest jsdom @testing-library/react @testing-library/user-event`, or `fw verify` fails with that hint;
  - Flutter: `fw verify` needs the Flutter SDK on `PATH`;
  - add `test/fw/` to `.gitignore`; you may drop `allowImportingTsExtensions` from your `tsconfig`.

## 1.2.1 — 2026-09-29

- **State and form libraries in screens.** `stateLibrary` in `project.ts` now allows the non-visual wrappers of known libraries in screen code: Bloc (`BlocBuilder`, `BlocListener`…), GetX (`Obx`, `GetBuilder`), MobX (`Observer`), Riverpod (`Consumer`), Provider (`Consumer`, `Selector`), signals (`Watch`), react-hook-form (`FormProvider`, `Controller`), react-redux / jotai (`Provider`), TanStack Query (`QueryClientProvider`). `screenWrappers: [...]` adds your own. What a wrapper renders is still checked, so the UI inside must come from `ui/`. Hook-only libraries (zustand, Redux hooks, Jotai, TanStack Query, XState, MobX `observer()`) already worked.
- Error messages for unknown screen components mention wrappers and suggest the closest one (`BlocBulder` → `BlocBuilder`); a raw Flutter widget with a `Ui` counterpart suggests it (`Text` → `UiText`).
- Agent rules list the allowed wrappers when there are any.
- Only `@himz-genui/core` changes; `@himz-genui/rules` stays 1.2.0.

## 1.2.0 — 2026-09-29

Flutter support, 76 contracts, and React and Flutter galleries kept in sync. `@himz-genui/rules` 1.2.0 requires `@himz-genui/core` ^1.2.0 (contracts use `.int()`); upgrading projects re-copy `ui-rules/` from the package.

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
- `examples/gallery-react`: all 76 contracts in React from **the same ui-spec and Home spec as gallery-flutter**, 92 tests (vitest + Testing Library) mirroring the Flutter ones. `scripts/parity.mjs` (`npm run test:parity`, also part of `npm test`) fails when the two galleries drift: different ui-spec or specs, a contract missing on one platform, or a component without a test on one side. Pagination now uses the same seven slots on both platforms; Flutter Toast pauses on hover and focus.
- `fw docs` prints a **React signature** (props interface and export) next to the Dart one, both generated from the contract.
- Dev: `jsdom` pinned to 25 (30 needs a newer Node than 20).
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
