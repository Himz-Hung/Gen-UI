import { defineComponent, t } from '@himz-genui/core';
export default defineComponent({
  name: 'Checkbox', category: 'input',
  purpose: 'Boolean choice with a label. For a single on/off setting that applies immediately, use Switch.',
  props: { label: t.string(), checked: t.boolean(), disabled: t.boolean().def(false) },
  events: { change: t.boolean() },
  states: ['unchecked', 'checked', 'focused', 'disabled'],
  rules: ['Pressing the label toggles the box.', 'Box is 20 logical pixels; checked fill tokens.color.primary.'],
  a11y: ['Role checkbox with label as accessible name.'],
});
