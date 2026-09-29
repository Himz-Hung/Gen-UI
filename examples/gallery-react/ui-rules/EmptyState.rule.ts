import { defineComponent, t } from '@himz-genui/core';
export default defineComponent({
  name: 'EmptyState', category: 'feedback',
  purpose: 'Shown in place of a list or result that has nothing to show. Explains why and offers one next step.',
  props: {
    title: t.text(),
    description: t.text().opt(),
    icon: t.string().opt(),
    actionLabel: t.text().opt().desc('when present, a primary Button with this label is shown'),
  },
  events: { action: t.void() },
  rules: ['Centered in the space it replaces, min height 240.', 'action is emitted only via the Button rendered when actionLabel is present.'],
  composition: { canContain: [] },
  checks: [
    { kind: 'emits', event: 'action', props: { actionLabel: 'Start over' }, target: 'Start over' },
    { kind: 'neverEmits', event: 'action', props: {} },
  ],
  platform: { react: ["<section> with a heading and a <button> for the action"], flutter: ["a centered Column; the action is a UiButton"] },
});
