import { defineComponent, t } from '@himz-genui/core';
export default defineComponent({
  name: 'Toast', category: 'feedback',
  purpose: 'Short, non-blocking confirmation that something happened ("Added to cart"), optionally with one undo-style action. For messages that must stay on screen use Alert.',
  props: {
    open: t.boolean(),
    message: t.text(),
    tone: t.enum(['info', 'success', 'warning', 'danger']).def('info'),
    actionLabel: t.text().opt(),
    duration: t.number().int().def(4000).desc('milliseconds before it closes by itself; 0 = stays until closed'),
  },
  events: { close: t.void().desc('timeout, swipe or close control'), action: t.void() },
  states: ['hidden', 'visible'],
  rules: [
    'Appears at the bottom centre (top on wide screens is also fine) above all content, never covering the primary action.',
    'Closes by itself after duration; the timer pauses while hovered or focused.',
    'At most one visible; a new one replaces the previous.',
    'Never the only place an error is reported: errors that need a fix belong in the form or an Alert.',
  ],
  a11y: ['Announced through a polite live region (assertive for danger); the action is keyboard reachable.'],
  composition: { canContain: [] },
  platform: { react: ['render in a portal; role="status"'], flutter: ['m.ScaffoldMessenger.of(context).showSnackBar driven by open, or an Overlay entry'] },
  examples: [{ open: true, message: 'Added to cart', tone: 'success', actionLabel: 'Undo' }],
});
