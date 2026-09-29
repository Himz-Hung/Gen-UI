<!-- fw:start -->
---
name: ui
description: Build UI for this project from contracts. Use whenever creating or changing screens or UI components.
---

# UI rules for Gallery

This project builds UI from contracts (`ui-rules/`, `ui-spec/components/`). Target platform(s): flutter.
Design tokens live in `ui-spec/project.ts`. Never hard-code colors, spacing, radius or fonts.

## The rules

1. **`ui-spec/app.ts` is the outline.** Only the screens and components listed there exist for this app. Need a new screen or component? Add its name to the outline first (a new component also needs a contract), then `fw check ui-spec/app.ts`. When `fw check` says *Did you mean …?* and it is a typo, fix the name; do not add the misspelled one.
2. **Screen in the outline with no `ui-spec/screens/<name>.ts` yet?** Draft it from its purpose in `ui-spec/app.ts`, `ui-spec/domain.ts` and the screens around it: `shows` (what the user sees), `local` (actions that stay on the screen), `when` (empty / loading / error / disabled cases), `data`, `goTo` (target screen → how the user gets there), `back`, `params`. If `data` or `params` need a type that `ui-spec/domain.ts` does not declare yet, draft that type too (`t.object`, `t.array`, `t.ref`; values shown as text are pre-formatted strings such as `priceLabel: t.string()`). Run `fw check ui-spec/screens`, then **show the drafts (screen and any new types) to the user and wait for approval** before writing its spec.
3. **Need a component that is not yet in `lib/ui/`?** Run `fw docs <Name>`, read the contract, write the implementation into `lib/ui/<snake_name>.dart`, then run `fw verify <Name>` until it passes. `fw verify` also runs the contract's `checks` as generated tests (`test/fw/`): a failing `checks[i]` means the component breaks that commitment, so fix the component, never the check or the generated test. Never write a component anywhere else. Never rewrite one that already exists.
4. **Flutter components** live in `lib/ui/<snake_name>.dart` as `class Ui<Name>` (`ListItem` → `lib/ui/list_item.dart`, `UiListItem`). `fw docs <Name>` prints the exact Dart signature — enums, item classes, constructor, fields, `onX` callbacks, `List<Widget> children` — and `fw verify <Name>` checks exactly that; fill in `build()` only. Colors, spacing, radius, fonts come from `UiTokens` (`lib/ui/tokens.g.dart`). Run `flutter analyze` too. Never edit `*.g.dart` or `lib/ui/ui.dart`: fw generates them.
5. **Building a screen?** Write `screens/<name>.ui.json` first, from `ui-spec/screens/<name>.ts`. No code yet.
6. **Specs only use names from `ui.catalog.json`.** Run `fw check screens/<name>.ui.json` until it passes. Props are literals or bindings: `{ "path": "/cart/subtotalLabel" }` reads screen data (every segment is typed through `domain.ts`); to show each item of a list put `"repeat": { "path": "/cart/items", "as": "line" }` on the element and read `{ "path": "line/card/name" }` inside it — never leave `""` placeholders. Events map to the screen's actions — never code. Actions are: `go<Target>` for each `goTo` (or its `action`), each `local` key, and `goBack` unless `back: false` or first screen. Do not repeat `data` / `actions` in the spec when the description has them.
7. **Compose the Flutter screen in `lib/screens/<snake_name>_screen.dart` (`class <Name>Screen`) from `lib/ui/` only.** Import `lib/ui/ui.dart`; Flutter libraries only with `show` (`package:flutter/widgets.dart show StatelessWidget, Widget, BuildContext, MediaQuery, Navigator`). Construct no widget from outside `lib/ui/` (no `Text`, `Padding`, package widgets); static calls like `MediaQuery.sizeOf(context)`, `Navigator.of(context)`, `context.go` are fine. Never another widget class in the screen file. Run `fw check lib/screens/<snake_name>_screen.dart`. The app shell (`main.dart`, routing, state) lives in `lib/` outside `screens/` and `ui/`.
8. **Tokens** come from `ui-spec/project.ts`.
9. **Navigation** follows `goTo` / `back` / `params` in `ui-spec/screens/*.ts` (or `ui-spec/flows/` in older projects). Do not invent routes. `fw check ui-spec/screens` checks them.

Before finishing, run `fw check` with no arguments: it checks everything and prints what is still to do for each outline entry.
If a needed component has no contract, write one in `ui-spec/components/<Name>.rule.ts` (compose from existing primitives), then follow the rule for a component not yet in `ui/`. Every `fw` command refreshes the catalog.

## Catalog (names only — read details with `fw docs <Name>`)

- **action**: Button, FloatingActionButton, IconButton, Link
- **chart**: BarChart, LineChart, PieChart
- **data**: Accordion, AvailabilityCalendar, Avatar, Badge, Card, DescriptionList, List, ListItem, Stat, SwipeActions, Table, Tag, Timeline
- **feedback**: Alert, EmptyState, ProgressBar, Skeleton, Spinner, Toast, Tooltip
- **form**: FormField
- **input**: Checkbox, ChipGroup, Combobox, DatePicker, DateRangePicker, FileUpload, Input, NumberInput, PinInput, RadioGroup, Rating, SearchBox, Select, Slider, Switch, Textarea
- **layout**: Container, Divider, Grid, HorizontalScroll, InfiniteScroll, Inline, PullToRefresh, SectionHeader, Spacer, Stack
- **media**: Carousel, Icon, Image, ImageViewer, Video
- **navigation**: BottomNav, Breadcrumbs, Pagination, SegmentedControl, Sidebar, SiteFooter, SiteHeader, Stepper, Tabs, TopBar
- **overlay**: ConfirmDialog, Drawer, Menu, Modal
- **typography**: Heading, RichText, Text

## Commands

`fw docs <Name>` · `fw verify <Name>` · `fw check ui-spec/app.ts` · `fw check <spec.ui.json>` · `fw check <Screen.tsx>` · `fw check` (everything)
<!-- fw:end -->
