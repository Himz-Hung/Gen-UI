# Changelog

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
