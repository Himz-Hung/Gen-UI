import { defineComponent, t } from '@himz-genui/core';
export default defineComponent({
  name: 'Spinner', category: 'feedback',
  purpose: 'Indeterminate activity indicator for waits under a few seconds. For content that is loading use Skeleton; for known progress use ProgressBar.',
  props: {
    label: t.text().desc('accessible name, e.g. "Loading cards"'),
    size: t.enum(['sm', 'md', 'lg']).def('md'),
    showLabel: t.boolean().def(false),
  },
  rules: ['Sizes sm 16, md 24, lg 40 logical pixels; color tokens.color.primary.', 'Respects reduced-motion settings with a slower or static indicator.'],
  a11y: ['Role status (or progressbar without value) named by label.'],
  composition: { canContain: [] },
  platform: { react: ['CSS animation on an element with role="status"'], flutter: ['m.CircularProgressIndicator inside Semantics(label: label)'] },
  examples: [{ label: 'Loading cards' }],
});
