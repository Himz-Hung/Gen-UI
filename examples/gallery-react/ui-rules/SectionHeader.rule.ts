import { defineComponent, t } from '@himz-genui/core';
export default defineComponent({
  name: 'SectionHeader', category: 'layout',
  purpose: 'Title of a section on a screen, with an optional trailing action ("New arrivals" · "See all").',
  props: {
    title: t.text(),
    description: t.text().opt(),
    actionLabel: t.text().opt(),
    level: t.enum(['2', '3']).def('2').desc('heading level inside the screen'),
  },
  events: { action: t.void() },
  rules: [
    'Title on the leading side, action on the trailing side on the same baseline; description under the title in tokens.color.muted.',
    'The action looks like a Link and has a large enough target (at least 44 tall).',
    'Space above tokens.spacing[5], below tokens.spacing[3].',
  ],
  a11y: ['Title is a real heading of the given level; the action name includes the section ("See all new arrivals").'],
  composition: { canContain: [] },
  checks: [
    { kind: 'role', role: 'heading', name: { fromProp: 'title' } },
    { kind: 'emits', event: 'action', props: { actionLabel: 'See all' }, target: 'See all' },
  ],
  platform: { react: ['<h2>/<h3> + a <button> styled as a link'], flutter: ['a Row with the heading Text (Semantics header: true) and m.TextButton'] },
  examples: [{ title: 'New arrivals', actionLabel: 'See all' }],
});
