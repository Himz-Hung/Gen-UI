import { defineComponent, t } from '@genui/core';
export default defineComponent({
  name: 'Stack', category: 'layout',
  purpose: 'Vertical arrangement of children with a consistent gap. Use for page sections and form fields. Not for horizontal rows — use Inline.',
  props: {
    gap: t.enum(['0', '1', '2', '3', '4', '5', '6', '7']).def('3').desc('index into tokens.spacing'),
    align: t.enum(['start', 'center', 'end', 'stretch']).def('stretch'),
  },
  children: true,
  rules: [
    'Children are laid out top to bottom in source order.',
    'gap is the only space between children; children add no outer margin of their own.',
    'Width fills the parent unless align is not stretch.',
  ],
  platform: { react: ['use a <div> with flex column', 'no margins on children'], flutter: ['Column with SizedBox gaps or a spacing helper'] },
  examples: [{ gap: '4' }],
});
