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

MIT © Himz
