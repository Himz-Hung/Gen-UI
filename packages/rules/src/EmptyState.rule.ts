import { defineComponent, t } from '@himz-genui/core';
export default defineComponent({
  name: 'EmptyState', category: 'feedback',
  purpose: 'Shown in place of a list or result that has nothing to show. Explains why and offers one next step.',
  props: {
    title: t.string(),
    description: t.string().opt(),
    icon: t.string().opt(),
    actionLabel: t.string().opt().desc('when present, a primary Button with this label is shown'),
  },
  events: { action: t.void() },
  rules: ['Centered in the space it replaces, min height 240.', 'action is emitted only via the Button rendered when actionLabel is present.'],
  composition: { canContain: [] },
});
