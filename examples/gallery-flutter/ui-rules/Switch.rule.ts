import { defineComponent, t } from '@himz-genui/core';
export default defineComponent({
  name: 'Switch', category: 'input',
  purpose: 'On/off setting that takes effect immediately (notifications, dark mode). For a choice confirmed later with a submit, use Checkbox.',
  props: {
    label: t.text(),
    checked: t.boolean(),
    description: t.text().opt(),
    disabled: t.boolean().def(false),
  },
  events: { change: t.boolean() },
  states: ['off', 'on', 'focused', 'disabled'],
  rules: [
    'Label on the leading side, switch on the trailing side; pressing the label toggles it.',
    'On uses tokens.color.primary; the state is also shown by thumb position, never color alone.',
    'Track 44×24, thumb 20 logical pixels.',
  ],
  a11y: ['Role switch with checked state; label is the accessible name.'],
  checks: [
    { kind: 'role', role: 'switch', name: { fromProp: 'label' } },
    { kind: 'emits', event: 'change', on: ['press', 'space'] },
    { kind: 'emits', event: 'change', target: 'Notify me', props: { label: 'Notify me' } },
    { kind: 'neverEmits', event: 'change', props: { disabled: true } },
    { kind: 'tokenColor', token: 'primary', props: { checked: true } },
  ],
  platform: { react: ['<button role="switch" aria-checked>'], flutter: ['m.SwitchListTile, or m.Switch with a tappable label'] },
  examples: [{ label: 'Email me when an order ships', checked: true }],
});
