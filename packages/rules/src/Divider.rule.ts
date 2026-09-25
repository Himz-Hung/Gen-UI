import { defineComponent, t } from '@genui/core';
export default defineComponent({
  name: 'Divider', category: 'layout',
  purpose: 'Thin separating line between groups of content.',
  props: { orientation: t.enum(['horizontal', 'vertical']).def('horizontal') },
  rules: ['1 logical pixel thick, tokens.color.muted at reduced opacity.', 'Not announced by screen readers (decorative).'],
});
