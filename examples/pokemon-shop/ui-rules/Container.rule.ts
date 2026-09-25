import { defineComponent, t } from '@himz-genui/core';
export default defineComponent({
  name: 'Container', category: 'layout',
  purpose: 'Constrains content width and centers it on wide screens; adds horizontal page padding on narrow screens. One per screen, at the top of the tree.',
  props: {
    maxWidth: t.enum(['sm', 'md', 'lg', 'xl', 'full']).def('lg').desc('sm 640, md 768, lg 1024, xl 1280'),
    padding: t.enum(['0', '1', '2', '3', '4', '5', '6', '7']).def('4'),
  },
  children: true,
  rules: ['Content never exceeds maxWidth; below that width it fills the screen minus padding on both sides.', 'Centered horizontally when narrower than the viewport.'],
});
