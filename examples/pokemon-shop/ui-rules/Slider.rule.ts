import { defineComponent, t } from '@himz-genui/core';
export default defineComponent({
  name: 'Slider', category: 'input',
  purpose: 'Choose a number in a range by dragging, where the exact value matters less than the position (price filter, volume). For exact numbers use NumberInput.',
  props: {
    label: t.text(),
    value: t.number(),
    min: t.number(),
    max: t.number(),
    step: t.number().def(1),
    valueLabel: t.text().opt().desc('pre-formatted value shown next to the label, e.g. "$40"'),
    disabled: t.boolean().def(false),
  },
  events: { change: t.number().desc('while dragging'), commit: t.number().desc('on release') },
  states: ['default', 'dragging', 'focused', 'disabled'],
  rules: [
    'value is clamped to [min, max] and snapped to step.',
    'valueLabel, when given, is shown at the end of the label row; the component never formats numbers.',
    'Filled part of the track uses tokens.color.primary.',
  ],
  a11y: ['Role slider with min, max and current value; the value text is valueLabel when given; arrow keys change by step, Page keys by 10 steps.'],
  platform: { react: ['<input type="range">'], flutter: ['m.Slider with divisions = (max - min) / step'] },
  examples: [{ label: 'Max price', value: 40, min: 0, max: 200, step: 5, valueLabel: '$40' }],
});
