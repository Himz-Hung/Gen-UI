# @himz-genui/rules

Shipped component contracts for [`@himz-genui/core`](https://www.npmjs.com/package/@himz-genui/core). Install both,
then `npx fw init` copies these files into your project's `ui-rules/`.

```sh
npm i -D @himz-genui/core @himz-genui/rules
```

29 platform-neutral contracts:

| category | components |
|---|---|
| layout | Stack, Inline, Grid, Container, Spacer, Divider |
| typography | Text, Heading |
| action | Button, IconButton, Link |
| input | Input, Select, SearchBox, Checkbox |
| data | Card, Badge, Tag, Stat, List, ListItem |
| media | Image |
| feedback | EmptyState, Skeleton, Alert |
| navigation | Pagination, Tabs, TopBar |
| overlay | Modal |

Each contract declares props, events, states, behaviour rules, accessibility requirements, composition
constraints and optional per-platform hints. See the core README for the contract format and how the
`fw` CLI uses them.

Props a user reads (`label`, `title`, `description`, `placeholder`, `alt`, `Text.value`…) are marked
`t.text()`, so multi-language projects can require translated text for them. Since 1.1.0 these contracts
need `@himz-genui/core` 1.1.0 or later. Upgrading an existing project: copy the files from this package's
`src/` into your `ui-rules/` again (no props changed, implementations stay verified).

MIT © Himz
