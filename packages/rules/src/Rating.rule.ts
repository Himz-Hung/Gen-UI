import { defineComponent, t } from '@himz-genui/core';
export default defineComponent({
  name: 'Rating', category: 'input',
  purpose: 'Show or choose a score of 1–max stars. readOnly for showing an average.',
  props: {
    label: t.text().desc('accessible name, and visible label when not readOnly'),
    value: t.number().desc('0 = none; readOnly may show halves'),
    max: t.number().int().def(5),
    readOnly: t.boolean().def(false),
    size: t.enum(['sm', 'md', 'lg']).def('md'),
  },
  events: { change: t.number().int() },
  states: ['default', 'hover', 'focused', 'readOnly'],
  rules: [
    'Filled stars use tokens.color.warning when defined, else tokens.color.primary; empty stars are outlined.',
    'readOnly never emits change and rounds to the nearest half.',
    'Each star is at least a 32×32 target when interactive.',
  ],
  a11y: ['Interactive: role radiogroup of max options named "<n> of <max>". readOnly: an image named "<value> of <max>".'],
  platform: { react: ['radio inputs styled as stars'], flutter: ['a Row of m.IconButton / m.Icon (star, star_half, star_border)'] },
  examples: [{ label: 'Your rating', value: 4 }, { label: 'Average rating', value: 4.5, readOnly: true, size: 'sm' }],
});
