import { defineComponent, t } from '@himz-genui/core';
export default defineComponent({
  name: 'Inline', category: 'layout',
  purpose: 'Horizontal arrangement of children with a consistent gap. Wraps onto new lines when out of room unless wrap is false.',
  props: {
    gap: t.enum(['0', '1', '2', '3', '4', '5', '6', '7']).def('2').desc('index into tokens.spacing'),
    align: t.enum(['start', 'center', 'end', 'baseline']).def('center'),
    justify: t.enum(['start', 'center', 'end', 'between']).def('start'),
    wrap: t.boolean().def(true),
  },
  children: true,
  rules: [
    'Children are laid out left to right in source order (right to left in RTL locales).',
    'When wrap is false, children shrink or overflow is clipped — they never wrap.',
  ],
  platform: { react: ['use a <div> with flex row'], flutter: ['Wrap when wrap=true, Row otherwise'] },
});
