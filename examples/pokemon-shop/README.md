# pokemon-shop — example

A trading-card shop built entirely through the genui-fw loop, plus a hand-written Vite shell so it runs.

```sh
npm run check      # fw check: outline, 23 components, 5 specs, 5 screen descriptions, domain, 5 screens → 40 passed
npm run dev        # http://localhost:5173
node ../../packages/core/bin/fw.js check .fixtures   # deliberately broken spec + screen → 2 failed
```

| | |
|---|---|
| `ui-spec/app.ts` | the outline: 5 screens, 22 components |
| `ui-spec/project.ts` | tokens, platform, agent, guard `requireCartNotEmpty` |
| `ui-spec/domain.ts` | Rarity, CardSet, Card, CartItem, Cart, Order |
| `ui-spec/screens/*.ts` | each screen: what it shows, local actions, special cases, data, `goTo` / `back` (Home → CardDetail → Cart → Checkout → OrderSuccess) |
| `ui-spec/added/PriceTag.rule.ts` | a pre-existing component registered with `fw add` |
| `screens/*.ui.json` | the 5 specs the agent wrote |
| `ui/` | 22 components materialized from contracts, plus `tokens.ts` |
| `src/screens/*Screen.tsx` | the 5 screens, composed from `ui/` only |
| `src/App.tsx`, `router.ts`, `store.ts`, `data.ts` | hand-written shell: router implementing `goTo` / `back` / `params`, zustand store, 18 mock cards |
| `.fixtures/` | broken inputs to see the checkers fail |
