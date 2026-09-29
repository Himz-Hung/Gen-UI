import { defineComponent, t } from '@himz-genui/core';
export default defineComponent({
  name: 'List', category: 'data',
  purpose: 'Vertical list of ListItem rows (optionally wrapped in SwipeActions) separated by dividers. For free-form children use Stack.',
  props: { dense: t.boolean().def(false) },
  children: true,
  composition: { canContain: ['ListItem', 'SwipeActions'] },
  rules: ['Rows are separated by a Divider; no divider after the last row.'],
  a11y: ['Role list; each ListItem is a listitem.'],
  platform: { react: ["<ul> of <li>"], flutter: ["a Column of rows separated by Divider; not a scrolling ListView (the screen scrolls)"] },
});
