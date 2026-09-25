import { defineComponent, t } from '@genui/core';
export default defineComponent({
  name: 'Select', category: 'input',
  purpose: 'Pick one option from a short list (≤ 15). For longer lists use SearchBox with results.',
  props: {
    label: t.string(),
    value: t.string(),
    options: t.array(t.object({ value: t.string(), label: t.string() })),
    placeholder: t.string().opt(),
    disabled: t.boolean().def(false),
    error: t.string().opt(),
  },
  events: { change: t.string().desc('selected option value') },
  states: ['default', 'open', 'focused', 'disabled', 'error'],
  rules: ['Label always visible above the control.', 'Shows the label of the selected option, or placeholder when value matches no option.', 'Same height and radius as Input.'],
  a11y: ['Keyboard operable: arrows move, Enter selects, Escape closes.'],
  platform: { react: ['native <select> is acceptable and preferred for v0'] },
});
