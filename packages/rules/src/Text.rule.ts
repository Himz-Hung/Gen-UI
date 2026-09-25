import { defineComponent, t } from '@himz-genui/core';
export default defineComponent({
  name: 'Text', category: 'typography',
  purpose: 'Body text. Not for headings — use Heading.',
  props: {
    value: t.string(),
    size: t.enum(['xs', 'sm', 'md', 'lg']).def('md'),
    weight: t.enum(['regular', 'medium', 'bold']).def('regular'),
    color: t.enum(['text', 'muted', 'primary', 'danger']).def('text').desc('token name'),
    truncate: t.boolean().def(false).desc('single line with ellipsis'),
    align: t.enum(['start', 'center', 'end']).def('start'),
  },
  rules: ['Uses tokens.font.body.', 'truncate=true never wraps and shows an ellipsis; the full value remains available to assistive tech.'],
  a11y: ['Rendered as text, not as an image.'],
  examples: [{ value: 'Charizard · Holo Rare' }, { value: 'Out of stock', color: 'danger', size: 'sm' }],
});
