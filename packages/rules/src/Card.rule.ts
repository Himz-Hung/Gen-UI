import { defineComponent, t } from '@himz-genui/core';
export default defineComponent({
  name: 'Card', category: 'data',
  purpose: 'Bordered surface grouping related content. Optionally pressable as a whole.',
  props: {
    padding: t.enum(['0', '2', '3', '4', '5']).def('4'),
    pressable: t.boolean().def(false).desc('whole card acts as one target and emits press'),
    selected: t.boolean().def(false),
  },
  events: { press: t.void() },
  children: true,
  states: ['default', 'hover', 'pressed', 'focused', 'selected'],
  rules: [
    'Background tokens.color.surface, 1px border, radius tokens.radius.lg.',
    'pressable=true: the whole card is one focusable target with hover and pressed feedback; nested Buttons still work independently and do not trigger the card press.',
    'pressable=false: no hover feedback, never emits press.',
    'selected=true shows a tokens.color.primary border.',
  ],
  a11y: ['When pressable, role button (or link when it navigates) and visible focus ring.'],
  composition: { cannotBeInside: ['Button', 'Link'] },
});
