import { defineComponent, t } from '@himz-genui/core';
export default defineComponent({
  name: 'ListItem', category: 'data',
  purpose: 'One row in a List: title, optional subtitle and trailing text, optionally pressable.',
  props: {
    title: t.text(),
    subtitle: t.text().opt(),
    trailing: t.text().opt().desc('pre-formatted, e.g. a price'),
    pressable: t.boolean().def(false),
  },
  events: { press: t.void() },
  states: ['default', 'hover', 'pressed', 'focused'],
  rules: ['Min height 48 (56 with subtitle) unless the parent List is dense.', 'pressable=false never emits press and has no hover feedback.'],
  composition: { canContain: [] },
  checks: [
    { kind: 'emits', event: 'press', props: { title: 'Base Set', pressable: true }, target: 'Base Set' },
    { kind: 'neverEmits', event: 'press', props: { title: 'Base Set', pressable: false }, target: 'Base Set' },
  ],
  platform: { react: ["<li> containing a <button> when pressable"], flutter: ["ListTile (onTap only when pressable)"] },
});
