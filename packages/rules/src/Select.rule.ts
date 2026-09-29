import { defineComponent, t } from '@himz-genui/core';
export default defineComponent({
  name: 'Select', category: 'input',
  purpose: 'Pick one option from a short list (≤ 15). For longer lists use SearchBox with results.',
  props: {
    label: t.text(),
    value: t.string(),
    options: t.array(t.object({ value: t.string(), label: t.text() })),
    placeholder: t.text().opt(),
    disabled: t.boolean().def(false),
    error: t.text().opt(),
  },
  events: { change: t.string().desc('selected option value') },
  states: ['default', 'open', 'focused', 'disabled', 'error'],
  rules: ['Label always visible above the control.', 'Shows the label of the selected option, or placeholder when value matches no option.', 'Same height and radius as Input.'],
  a11y: ['Keyboard operable: arrows move, Enter selects, Escape closes.'],
  checks: [
    { kind: 'neverEmits', event: 'change', props: { disabled: true } },
    { kind: 'selects', option: 'Jungle', emits: 'change', props: { label: 'Set', value: '', options: [{ value: 'base', label: 'Base Set' }, { value: 'jungle', label: 'Jungle' }] } },
  ],
  platform: { react: ['native <select> is acceptable and preferred for v0'], flutter: ["DropdownButtonFormField / DropdownMenu"] },
});
