import { defineComponent, t } from '@himz-genui/core';
export default defineComponent({
  name: 'RadioGroup', category: 'input',
  purpose: 'Pick exactly one of 2–6 visible options, e.g. shipping speed. For more options use Select; for switching views use SegmentedControl.',
  props: {
    label: t.text(),
    value: t.string(),
    options: t.array(t.object({ value: t.string(), label: t.text(), description: t.text().opt(), disabled: t.boolean().opt() })),
    direction: t.enum(['vertical', 'horizontal']).def('vertical'),
    disabled: t.boolean().def(false),
    error: t.text().opt(),
  },
  events: { change: t.string().desc('value of the chosen option') },
  states: ['default', 'focused', 'disabled', 'error'],
  rules: [
    'Pressing an option label or description selects it.',
    'description is shown under the option label in tokens.color.muted.',
    'Radio mark is 20 logical pixels; selected fill tokens.color.primary.',
  ],
  a11y: ['Role radiogroup labelled by label; arrow keys move and select; only the selected option is in the tab order.'],
  platform: { react: ['native <input type="radio"> sharing one name'], flutter: ['m.RadioListTile per option, or m.RadioGroup where available'] },
  examples: [{ label: 'Shipping', value: 'standard', options: [{ value: 'standard', label: 'Standard', description: '3–5 days' }, { value: 'express', label: 'Express', description: 'Next day' }] }],
});
