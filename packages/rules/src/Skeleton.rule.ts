import { defineComponent, t } from '@himz-genui/core';
export default defineComponent({
  name: 'Skeleton', category: 'feedback',
  purpose: 'Loading placeholder shaped like the content it stands in for.',
  props: {
    shape: t.enum(['text', 'rect', 'circle', 'card']).def('rect'),
    lines: t.number().def(1).desc('for shape=text'),
    ratio: t.enum(['1:1', '4:3', '16:9', '5:7']).opt().desc('for shape=rect/card'),
  },
  rules: ['Subtle shimmer or pulse; respects reduced-motion preference by staying static.', 'Takes the same space as the real content so nothing shifts on load.'],
  a11y: ['Hidden from assistive tech; the parent announces loading.'],
  composition: { canContain: [] },
});
