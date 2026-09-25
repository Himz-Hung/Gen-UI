<!-- fw:start -->
---
name: ui
description: Build UI for this project from contracts. Use whenever creating or changing screens or UI components.
---

# UI rules for PokéCards Shop

This project builds UI from contracts (`ui-rules/`, `ui-spec/components/`). Target platform(s): react.
Design tokens live in `ui-spec/project.ts`. Never hard-code colors, spacing, radius or fonts.

## The six rules

1. **Need a component that is not yet in `ui/`?** Run `fw docs <Name>`, read the contract, write the implementation into `ui/<Name>.<ext>`, then run `fw verify <Name>` until it passes. Never write a component anywhere else. Never rewrite one that already exists in `ui/`.
2. **Building a screen?** Write `screens/<name>.ui.json` first (see `ui-spec/screens/<name>.ts` for what it needs). No code yet.
3. **Specs only use names from `ui.catalog.json`.** Run `fw check screens/<name>.ui.json` until it passes. Props are literals or `{ "path": "/dataName" }`; events map to action names declared in the screen — never code.
4. **Compose the screen in `src/screens/<Name>Screen.tsx` from `ui/` only.** No raw markup/widgets outside `ui/`. Run `fw check src/screens/<Name>Screen.tsx`. App shell (router, store, main) lives in `src/` outside `screens/` and is hand-written.
5. **Tokens** come from `ui-spec/project.ts`.
6. **Navigation** follows `ui-spec/flows/`. Do not invent routes. `fw check ui-spec/flows` checks them.

Before finishing, run `fw check` with no arguments: it checks everything.
If a needed component has no contract, write one in `ui-spec/components/<Name>.rule.ts` (compose from existing primitives), then follow rule 1. Every `fw` command refreshes the catalog.

## Catalog (names only — read details with `fw docs <Name>`)

- **action**: Button, IconButton, Link
- **composite**: PriceTag
- **data**: Badge, Card, List, ListItem, Stat, Tag
- **feedback**: Alert, EmptyState, Skeleton
- **input**: Checkbox, Input, SearchBox, Select
- **layout**: Container, Divider, Grid, Inline, Spacer, Stack
- **media**: Image
- **navigation**: Pagination, Tabs, TopBar
- **overlay**: Modal
- **typography**: Heading, Text

## Commands

`fw docs <Name>` · `fw verify <Name>` · `fw check <spec.ui.json>` · `fw check <Screen.tsx>` · `fw check` (everything)
<!-- fw:end -->
