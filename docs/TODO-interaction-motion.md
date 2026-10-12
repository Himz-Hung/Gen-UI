# IMPORTANT — interaction, motion and loading are missing (found on Beats Fitness, 2026-09-30)

A real project built from the 2.0 galleries (~/gym-booking) passed every `fw check` / `fw verify`, yet the user found the
UI "ugly and dead": buttons give no feedback, nothing animates, no loading effect, no transition when navigating — on
web and Flutter. Contracts list `states: ['hover', 'pressed', 'focused']` in prose, but nothing checks them and the
galleries don't implement them (inline styles, no :hover/:active/:focus-visible; several React icons were placeholders).

## To add to the package (priority order)
1. **Motion tokens** in `project.ts`: `motion.duration.{fast,normal,slow}`, `motion.easing.{standard,enter,exit}`,
   generated for CSS (`--ui-motion-*`) and Flutter (`context.ui.motion`), honoring reduced motion.
2. **Interaction states in every interactive contract** (Button, IconButton, Link, Card pressable, ListItem, Chip/ChipGroup,
   Tabs, SegmentedControl, Sidebar, Menu, Switch, Checkbox, Input focus): hover, pressed (scale ≈ 0.97 / ripple),
   focus-visible ring, disabled; overlay enter/exit (Modal, Drawer, ConfirmDialog, Toast, Menu, Tooltip); Skeleton shimmer.
   New check kinds where testable: `pressedFeedback`, `focusRing`, `motion { maxMs }`, `reducedMotion`.
3. **Galleries** implement them (web: one `ui/interactions.css` with classes + variables; Flutter: Material states,
   AnimatedSwitcher, implicit animations).
4. **App-level recipes** in docs + `fw init` templates: page transitions (Next View Transitions / template.tsx,
   go_router `CustomTransitionPage`), navigation progress bar, route-level loading skeletons, shared element via
   `transitionTag` on Image / Heading / ClassCard-like cards.
5. **Visual review** step in the agent rules: screenshot key screens (light + dark, phone + desktop) before "done".

Reference implementation: the fixes made in ~/gym-booking (apps/web/ui, apps/mobile/lib/ui, routes) — upstream them.
Related gaps list: ~/gym-booking/docs/GAPS.md.

## Web (React) — what was done in ~/gym-booking/apps/web/ui, to upstream (2026-09-30)

Files: `ui/motion.ts` (constants + hooks), `ui/interactions.css` (all states/keyframes, imported once next to tokens.css),
className hooks added inside ~45 components (screens still never pass className). `fw verify` / `fw check` stay green.

Reusable patterns:
1. **Inline base, class states.** Generated `tokenColor` checks read the inline `style` attribute, so base fills stay inline
   and `interactions.css` only adds what inline cannot: `:hover/:active/:focus-visible`, transitions, `@keyframes`.
   State changes use properties never set inline (`transform`, `box-shadow`, `filter`, `outline`, pseudo-elements);
   `!important` only for `border-color`/`color` in hover/focus states. Tailwind v4 layers lose to this unlayered file.
2. **State layer** `.ui-state::before` (currentColor, opacity 0 → .07 hover → .12 press, `isolation: isolate; z-index:-1`)
   works over any inline background — one class for IconButton, ghost/secondary Button, tabs, nav items, chips, pagination.
   `.ui-press` = transitions + `:active` scale(.97) + `:focus-visible` 2px primary ring. Filled buttons: lift 1px + shadow + brightness.
3. **Presence hook** `usePresence(open, exitMs)` → `{ mounted, state }`; overlay root gets `data-state="open|closed"`, CSS
   picks enter/exit keyframes (`forwards` on exit, `pointer-events:none`). Unmount on a timer, never on `animationend`
   (jsdom, reduced motion, hidden tabs). Starting closed renders nothing (keeps the "renders nothing when open=false" checks).
   Used by Modal, ConfirmDialog, Drawer, SiteHeader mobile sheet, Toast, Menu, Tooltip, Accordion regions.
4. **Sliding indicator** `useIndicator(containerRef, () => selectedEl, deps)` → `{left,width} | null` (layout effect +
   guarded ResizeObserver on container and children, for late web fonts). `null` (SSR / jsdom) → static per-item fallback,
   so first paint is never blank. Used by Tabs underline and SegmentedControl thumb (transform + width transition).
5. **Change replay** `useChangeKey(value)` as React key + `.ui-roll` only when key > 0 (no animation on first paint):
   Stat value, ClassCard spots badge, Checkbox/Radio check pop (`data-changed`, so pre-checked boxes do not pop on load). `playFadeIn(el)` (Web Animations API, guarded) for panels that stay mounted (tab panel).
6. **Loading**: `.ui-skeleton` shimmer = inline `backgroundColor` (not `background` shorthand, it would wipe the class's
   `background-image`) + gradient sweep 1.4 s (band from a token that is light in both modes, e.g. on-scrim, or it vanishes in dark mode); Image wrapper `data-state="loading|loaded|error"` shares the shimmer,
   `<img>` fades in 250 ms; Image `transitionTag` → inline `viewTransitionName` (only when set). Button loading keeps
   the label in the tree (`visibility:hidden`) and draws a currentColor SVG spinner (the Spinner primitive strokes
   primary, invisible on a primary fill). Accordion height via `grid-template-rows: 0fr → 1fr` keyframes.
7. **One reduced-motion block**: durations → 1ms for `[class*="ui-"]`, decorative transforms off by class (never a global
   `transform:none` — Tooltip centring and the Carousel track use inline transforms), shimmer off, overlays swap to an
   opacity-only fade of the same length (so presence timers need no special case), spinner keeps turning slowly.
8. Moved per-component `<style>` blocks (Spinner, Skeleton, ProgressBar, ClassCard, QrCode, WeekSchedule) into the one file;
   bug found on the way: ProgressBar track used `` `${color}26` `` on a `var(...)` color (invalid CSS) → `alpha(color, .15)`.
9. Not done because the contract forbids it: Carousel autoplay ("Never advances by itself"). If wanted, add an
   `autoplay` prop to the contract (pause on hover/focus, off under reduced motion). Added touch swipe (≥ 40 px) instead.

Package TODO from this: generate `--ui-motion-*` from project tokens (today hand-written in interactions.css and
mirrored in motion.ts); ship `interactions.css` + `motion.ts` in the React gallery and add them to `fw init`; add check
kinds `focusRing` (class/outline present), `pressedFeedback`, `presence` (still mounted right after open→false, gone
after exit ms) — the last one is testable in jsdom with fake timers.

## Flutter — what was done in ~/gym-booking/apps/mobile/lib/ui, to upstream (2026-09-30)
Reference: `lib/ui/motion.dart` (internal file, not a contract; `fw check` accepts it) + the components that import it.
- **One motion module per project** (`lib/ui/motion.dart`): `UiMotion` durations (pressIn 100 / pressOut 150, fast 150,
  normal 200, overlayIn 250 / overlayOut 200, slow 300, shimmer 1300 ms) and curves (enter easeOutCubic, exit easeInCubic,
  standard, emphasized easeOutBack), press scales (0.97 controls, 0.98 large surfaces). Should become generated
  `context.ui.motion` from `project.ts` motion tokens.
- **`uiReduceMotion(context)`** = `MediaQuery.disableAnimations || accessibleNavigation`; `uiDuration(ctx, d)` → zero.
  Every animation reads it: durations collapse to zero, Hero / scale / slide are skipped, shimmer stops (static tint);
  overlays keep opacity only. Spinners keep spinning (they are the status).
- **`UiPressable`** (press scale, paint-only `Transform.scale`, layout never changes): driven by a
  `WidgetStatesController` passed to the InkWell / Filled/Outlined/Text/IconButton (`statesController:`), so a
  button nested in a pressable card presses only itself (InkResponse suppresses the parent while a child ink is
  pressed). `pointer: true` falls back to a `Listener` for widgets without a controller (FilterChip). Quick taps still
  show the full press: release waits for the press-in via an AnimationController status listener — never a `Timer`
  (pending timers fail widget tests).
- **Token ripples**: `uiSplash` / `uiHighlight` (primary @ 12% / 6%) on InkWells, `uiOverlay(ctx, fg)` for
  `ButtonStyle.overlayColor`, `IconButton.styleFrom(overlayColor: primary)`. `theme.g.dart` could set these globally.
- **Haptics**: `selectionClick` on BottomNav / Tabs / SegmentedControl / ChipGroup / Switch / RadioGroup changes,
  `lightImpact` on the ClassCard booking action and SwipeActions actions.
- **State changes**: BottomNav = M3 NavigationBar pill (`indicatorColor` primary 14%, `animationDuration`) + selected
  icon pop (TweenAnimationBuilder 0.8→1 easeOutBack) + bold primary label; Tabs = `AnimatedAlign` +
  `FractionallySizedBox(1/n)` indicator + AnimatedDefaultTextStyle; SegmentedControl = sliding thumb (equal-width
  segments via `IntrinsicWidth` + `Expanded`, `AnimatedAlign` thumb) ; ProgressBar = TweenAnimationBuilder fill (grows
  from 0, glides to new values); Stat / Badge / Tag / ClassCard spots & status = AnimatedSwitcher with a shared
  `uiRollTransition` (new value up from below, old leaves upwards; needs AnimatedBuilder on status, the switcher does
  not rebuild the outgoing transition) + ClipRect; Badge tone = AnimatedContainer; Card selected border =
  `Material.animationDuration`; SwipeActions snap = TweenAnimationBuilder (1:1 while dragging).
- **Overlays**: Modal / ConfirmDialog keep their OverlayPortal; one AnimationController (250 in / 200 out) drives a
  backdrop FadeTransition and a panel Fade + Scale 0.95→1; closing reverses, then `hide()` on `dismissed`; initially
  closed renders nothing (contract `rendersNothing`); `alwaysIncludeSemantics: true` so the dialog role is present on
  frame 0; `IgnorePointer` while closing. Toast = slide-up 24 px + fade, exit reverses then renders nothing.
  Gotcha: create controllers in `initState`, not as `late final` fields — a lazy field first touched in `dispose()`
  throws "Looking up a deactivated widget's ancestor".
- **Loading**: `UiShimmer` / `uiShimmerDecoration` (token-tinted base, surface-blended highlight band, GradientTransform
  sweep, 1.3 s loop) used by Skeleton and Image; Image = `frameBuilder` Stack(shimmer, AnimatedOpacity(child)) with
  keyed children so the fade survives, shimmer removed once loaded; Avatar photo fades over initials; Button / ClassCard
  busy spinner fades + scales in, label cross-fades (size kept); Spinner fades in with a tinted track.
- **Shared element**: Image `transitionTag` → `Hero` only when set and motion allowed (ClassCard already had it).
- Not materialized on this project's mobile side (so not done): Accordion, Carousel, Menu, Tooltip, Checkbox.
- Contract/check ideas from this pass: `pressedFeedback` (pump a press, expect a Transform scale < 1 or an ink
  splash), `reducedMotion` (MediaQuery(disableAnimations: true) → no running tickers except spinners after 1 frame),
  `overlayExit` (open→false keeps the panel for ≤ 300 ms, then renders nothing).

## Flutter app level — routes, loading, feedback in ~/gym-booking/apps/mobile/lib/app (2026-09-30)
Reference: `lib/app/transitions.dart`, `lib/app/shell.dart` (AppPage, ScreenLoad / AppLoader, ToastHost / AppToaster, AppFx),
`lib/app/booking_flow.dart`, `lib/app/routes/*`. Screens stay pure (lib/ui only) and just get `loading` / `onToast` props.
- **One page factory for every GoRoute** (`appPage(context, state, child, kind:)` → `CustomTransitionPage`, `key: state.pageKey`):
  `push` = slide from 25% right + fade (300 ms easeOutCubic in, 220 ms easeIn out) with the page below drifting 8% left via
  `secondaryAnimation`; on iOS the same page delegates to `CupertinoRouteTransitionMixin.buildPageTransitions(route, …)`, so the
  edge back-swipe keeps working with a CustomTransitionPage. `tab` = fade-through; `fade` = auth steps that replace the stack.
  Reduced motion → 150 ms opacity only. Should be generated as `fw`'s router helper from `goTo` kinds (push / replace / tab).
- **Tab switches with `context.go`**: `DefaultTransitionDelegate` *completes* (removes without animation) the old tab and pushes the
  new one over nothing, so a whole-page fade shows the black root. Fix: the tab page paints `color.background` at once and only the
  body (not the BottomNav inside AppPage) fades + scales 0.98→1 from `ModalRoute.of(context).animation`. A ShellRoute with a
  persistent nav would be the cleaner upstream design.
- **First load per screen key** (`AppState.load(key)` / `isLoaded(key)`, one per app run so tab switches don't re-skeleton) +
  `ScreenLoad` mixin / `AppLoader` builder giving `loading`, `refreshing`, `busyLoading`, `refresh()`. Screens get `loading`
  (skeleton shapes: class-card = Card + 3 text lines, detail = hero stays + text skeletons, trainer = 4:3 rect + cards).
  `AppPage(contentKey: loading)` cross-fades skeleton → content (AnimatedSwitcher, opacity only — any offset ghosts the shared
  header; 250 in / 150 out). Never key it on `refreshing`: that remounts UiPullToRefresh and kills its indicator. Hero screens
  (ClassDetail) keep the tagged image outside the skeleton and skip the swap, so the flight has a target and no duplicate tags.
- **Toast slot**: `AppPage(toast:)` renders the toast in a Stack over the body (bottom-centred above footer / nav, never inline in a
  scroll view). Routes own toast state (`ToastHost` mixin / `AppToaster`), screens call `onToast(message, tone:, actionLabel:, onAction:)`.
  The toast is keyed by a serial so a new message restarts its entrance + timer. Upstream: a `toast` slot in the generated app shell.
- **Action feedback**: result haptics in route code (`hapticSuccess` = mediumImpact, `hapticError` = heavyImpact); `AppFx.success(confetti:)`
  — a ValueNotifier the current AppPage (`ModalRoute.isCurrent`) listens to: success disc + check (0.6→1 easeOutBack, 900 ms, opacity
  only under reduced motion) and `confetti` ^0.8 (`ConfettiWidget` in the AppPage Stack, token colors, skipped under reduced motion)
  only when the booking count hits 1 / 10 / 50 / 100. The mock latency (600 ms) gives the buttons their loading state.
- **fw check bug found**: a function *type* in a screen (`final void Function(String, {…})? onToast;`, or a local typedef) is
  reported as "Function(…) is not a lib/ui component". Workaround: typedef in lib/app (`ShowToast`) imported with `show`.
- **lib/ui bug found (not fixed here, lib/ui was out of scope)**: `UiPullToRefresh._handleRefresh` checks `widget.refreshing` right
  after calling `onRefresh`, before the parent's setState has rebuilt it, so it always returns `Future.value()` and the indicator
  drops after ~0.5 s while the refresh is still running. Fix: drop the synchronous check and resolve the completer in a post-frame
  callback if `refreshing` is still false (or in `didUpdateWidget`). Contract check idea: `refreshIndicatorStays`.

## Web (React) — app level: route transitions, loading, delight (gym-booking/apps/web, 2026-09-30)

Files: `src/features/shell/{PageTransition,ShellFeedback,RouteSkeleton}.tsx`, `shell/{navProgress,celebrate}.ts`,
`src/features/latency.ts`, `routes/prefetchSessions.ts`, `app/(group)/loading.tsx`, `app/globals.css` (view-transition
CSS); new web-only contracts `ui-spec/components/{Hero,Marquee,Reveal,Celebration,TopProgress}.rule.ts` + Stat override
(`countUp`). `fw verify` / `fw check` 0 failed.

Reusable patterns to upstream:
1. **Page transitions = React `<ViewTransition>` in every page.tsx, not in a layout** (layouts persist → enter/exit never
   fire). One wrapper `enter="page-enter" exit="page-exit" update="page-update" default="none"`; CSS classes in the global
   stylesheet (exit 150 ms ease-in, enter 280 ms ease-out + 12 px rise, update = crossfade). `fw` could generate the
   wrapper and the CSS for Next projects (`fw init --next`).
2. **Headers rendered inside screens must be anchored** or they fade with the page: `view-transition-name: site-header`
   + `::view-transition-group(site-header){animation:none}` / `-old{display:none}`. Selecting by an internal class works
   without touching the component; better: SiteHeader / Sidebar contracts get a fixed `viewTransitionName` rule.
3. **Shared element needs a same-commit destination.** Inline `viewTransitionName` only animates if React starts a view
   transition (a `<ViewTransition>` boundary in the tree) **and** the destination commits in that transition. All routes
   here are dynamic (cookies), so a default prefetch stops at `loading.tsx` and the fallback commits first → no morph.
   Fix: `router.prefetch(href, { kind: 'full' })` (what `<Link prefetch>` sends; untyped in Next 16) for the list's detail
   routes, and the detail's loading state keeps the hero (only the body skeletons). Different pictures (time block →
   photo) need `view-transition-class: morph` with a fast old fade, or the old snapshot is scaled up and blurry.
   Duplicate names on one page abort the whole transition silently: tag only list cards.
4. **Navigation progress without router events**: a tiny external store (`startNavProgress` in the app's `useNav()`
   before push/replace/back, `done` in a `usePathname`+`useSearchParams` effect, popstate starts it, 4 s safety). A
   `TopProgress` component (`active`, `label`) shows only after 120 ms, creeps to 85 %, completes + fades. Candidate for
   the catalog (feedback) with checks `rendersNothing(active:false)`.
5. **Simulated latency for mock stores** (`useFirstLoad(key)`: true on server and at hydration, flips in
   `startTransition` after 650 ms so the page `update` crossfades skeleton → content; module-level Set = only the first
   visit; `markLoaded(keys)` from lists; `useBusy()` for writes, 500 ms; 0 under NODE_ENV=test). `fw` mock scaffolds could
   ship this so generated screens show their `loading` / `busy` props from day one.
6. **Global feedback hosts** in the root layout (progress bar, success moment) driven by module stores, so member screens
   shared with mobile need no new props. `Celebration` (`open`, `label`, `confetti`, `close`): SVG check draw (pathLength=1
   + dashoffset), canvas-confetti via dynamic import, colors read from the computed `--ui-color-*` values (tokens, theme
   aware), skipped under reduced motion and in jsdom. Checks: `rendersNothing`, `role: status`.
7. **Landing motion components** (web-only contracts): `Hero` (scrim from tokens, rAF parallax ≤ 20 % on a 120 %-tall
   image layer, text rises in and never waits for the image; checks role heading + emits primary/secondary by target
   text), `Marquee` (children = Text via `repeat`, two runs with the copy aria-hidden, `translateX(-50%)` loop, pause on
   hover/focus-within, static wrapped row under reduced motion; the marquee owns its labels' font via CSS inherit),
   `Reveal` (display:contents wrapper; **visible in server HTML**, only a mounted below-the-fold section goes `pending`;
   observe the first item — a display:contents box has no rect), Stat `countUp` (animate only the digit run of the
   pre-formatted label, keep prefix/suffix/grouping char, a11y text = final value in an sr-only span, never feed ticks to
   the change-roll key).
8. **Spec gotchas found**: a prop typed `t.array(t.text())` cannot bind to a field of a list (`/classTypes/name` is
   rejected, `ClassType[]` ≠ `{name}[]`), so list-shaped components should take children + `repeat`.
9. **Hydration bugs found on the way** (fixed in ui/): SiteHeader / SiteFooter `useWide` and HorizontalScroll
   `pointerDevice` read `matchMedia` during render → React #418 on phones. Rule for the React gallery: media queries only
   in effects (initial state = the server value).
10. Package TODO: a check kind for "visible without JS" (SSR render has no `opacity:0`), and `presence`/`delayMs` checks
    for TopProgress-style delayed indicators (fake timers).
