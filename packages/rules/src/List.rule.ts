import { defineComponent, t } from '@himz-genui/core';
export default defineComponent({
  name: 'List', category: 'data',
  purpose: 'Vertical list of ListItem rows separated by dividers. For free-form children use Stack.',
  props: { dense: t.boolean().def(false) },
  children: true,
  composition: { canContain: ['ListItem'] },
  rules: ['Rows are separated by a Divider; no divider after the last row.'],
  a11y: ['Role list; each ListItem is a listitem.'],
});
