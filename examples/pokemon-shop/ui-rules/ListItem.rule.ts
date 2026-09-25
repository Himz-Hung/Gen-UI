import { defineComponent, t } from '@himz-genui/core';
export default defineComponent({
  name: 'ListItem', category: 'data',
  purpose: 'One row in a List: title, optional subtitle and trailing text, optionally pressable.',
  props: {
    title: t.string(),
    subtitle: t.string().opt(),
    trailing: t.string().opt().desc('pre-formatted, e.g. a price'),
    pressable: t.boolean().def(false),
  },
  events: { press: t.void() },
  states: ['default', 'hover', 'pressed', 'focused'],
  rules: ['Min height 48 (56 with subtitle) unless the parent List is dense.', 'pressable=false never emits press and has no hover feedback.'],
  composition: { canContain: [] },
});
