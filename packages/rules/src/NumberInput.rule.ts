import { defineComponent, t } from '@himz-genui/core';
export default defineComponent({
  name: 'NumberInput', category: 'input',
  purpose: 'Exact whole or decimal number with minus and plus controls: quantity, guests, age.',
  props: {
    label: t.text(),
    value: t.number(),
    min: t.number().opt(),
    max: t.number().opt(),
    step: t.number().def(1),
    hint: t.text().opt(),
    error: t.text().opt(),
    disabled: t.boolean().def(false),
  },
  events: { change: t.number() },
  states: ['default', 'focused', 'disabled', 'error'],
  rules: [
    'Minus is disabled at min, plus at max; typed values outside the range are clamped on blur.',
    'Same height, label, hint and error behaviour as Input.',
    'Minus and plus are 40×40 targets with accessible names "Decrease <label>" / "Increase <label>".',
  ],
  a11y: ['Role spinbutton with min, max and value; arrow up / down change by step.'],
  checks: [
    { kind: 'neverEmits', event: 'change', props: { disabled: true } },
  ],
  platform: { react: ['<input inputMode="decimal"> between two <button>s'], flutter: ['m.TextField(keyboardType: number) between two m.IconButtons'] },
  examples: [{ label: 'Quantity', value: 1, min: 1, max: 10 }],
});
