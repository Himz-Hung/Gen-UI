import { defineComponent, t } from '@himz-genui/core';
export default defineComponent({
  name: 'SwipeActions', category: 'data',
  purpose: 'Reveals one or two actions when a row is swiped sideways (delete, archive). Wraps one ListItem or Card.',
  props: {
    actions: t.array(t.object({ value: t.string(), label: t.text(), icon: t.string().opt(), tone: t.enum(['neutral', 'primary', 'danger']).opt() })).desc('1–2 actions, shown on the trailing side'),
    fullSwipe: t.boolean().def(false).desc('swiping all the way runs the first action'),
  },
  events: { action: t.string().desc('value of the chosen action') },
  children: true,
  states: ['closed', 'open', 'swiping'],
  rules: [
    'Swipe towards the start reveals the actions; pressing elsewhere or scrolling closes them.',
    'Danger actions use tokens.color.danger; destructive actions are confirmed by the screen (ConfirmDialog or an undo Toast).',
    'The same actions must be reachable without swiping: a Menu on the row, a long-press, or assistive-tech custom actions.',
  ],
  a11y: ['Each action is exposed as a custom action on the row named by its label.'],
  composition: { canContain: ['ListItem', 'Card'] },
  platform: { react: ['pointer / touch drag with translateX; actions also in a Menu for desktop'], flutter: ['m.Dismissible for fullSwipe, or a Slidable-style Stack with CustomSemanticsAction'] },
  examples: [{ actions: [{ value: 'delete', label: 'Delete', icon: 'trash', tone: 'danger' }] }],
});
