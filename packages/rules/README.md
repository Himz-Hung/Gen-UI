# @himz-genui/rules

Shipped component contracts for [`@himz-genui/core`](https://www.npmjs.com/package/@himz-genui/core). Install both,
then `npx fw init` copies these files into your project's `ui-rules/`.

```sh
npm i -D @himz-genui/core @himz-genui/rules
```

68 platform-neutral contracts:

| category | components |
|---|---|
| layout | Stack, Inline, Grid, Container, Spacer, Divider, SectionHeader, PullToRefresh, InfiniteScroll |
| typography | Text, Heading |
| action | Button, IconButton, Link |
| input | Input, Textarea, Select, SearchBox, Checkbox, RadioGroup, Switch, Slider, NumberInput, DatePicker, FileUpload, Rating, Combobox, ChipGroup, PinInput |
| form | FormField |
| data | Card, Badge, Tag, Stat, List, ListItem, Table, Avatar, Accordion, DescriptionList, Timeline, SwipeActions |
| media | Image, Icon, Carousel, Video |
| feedback | EmptyState, Skeleton, Alert, Toast, Spinner, ProgressBar, Tooltip |
| navigation | Pagination, Tabs, TopBar, BottomNav, SegmentedControl, Sidebar, Breadcrumbs, Stepper |
| overlay | Modal, Drawer, Menu, ConfirmDialog |
| chart | LineChart, BarChart, PieChart |

Each contract declares props, events, states, behaviour rules, accessibility requirements, composition
constraints and optional per-platform hints. See the core README for the contract format and how the
`fw` CLI uses them.

Props a user reads (`label`, `title`, `description`, `placeholder`, `alt`, `Text.value`…) are marked
`t.text()`, so multi-language projects can require translated text for them. Since 1.1.0 these contracts
need `@himz-genui/core` 1.1.0 or later. Upgrading an existing project: copy the files from this package's
`src/` into your `ui-rules/` again (no props changed, implementations stay verified).

MIT © Himz
