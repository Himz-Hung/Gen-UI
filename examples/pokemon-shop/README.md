# pokemon-shop — example

A trading-card shop built entirely through the genui-fw loop, plus a hand-written Vite shell so it runs.

```sh
npm run check      # fw check: 25 components, 5 specs, flows, 5 screens → 36 passed
npm run dev        # http://localhost:5173
node ../../packages/core/bin/fw.js check .fixtures   # deliberately broken spec + screen → 2 failed
```

| | |
|---|---|
| `ui-spec/project.ts` | tokens, platform, agent, guard `requireCartNotEmpty` |
| `ui-spec/domain.ts` | Rarity, CardSet, Card, CartItem, Cart, Order |
| `ui-spec/flows/shop.ts` | Home → CardDetail → Cart → Checkout → OrderSuccess |
| `ui-spec/screens/*.ts` | what each of the 5 screens needs |
| `ui-spec/added/PriceTag.rule.ts` | a pre-existing component registered with `fw add` |
| `screens/*.ui.json` | the 5 specs the agent wrote |
| `ui/` | 25 components materialized from contracts |
| `src/screens/*Screen.tsx` | the 5 screens, composed from `ui/` only |
| `src/App.tsx`, `router.ts`, `store.ts`, `data.ts` | hand-written shell: router implementing the flow, zustand store, 18 mock cards |
| `.fixtures/` | broken inputs to see the checkers fail |
