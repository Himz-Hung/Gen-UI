import { defineComponent, t } from '@himz-genui/core';
export default defineComponent({
  name: 'Modal', category: 'overlay',
  purpose: 'Blocking dialog over the current screen. For confirming one action use ConfirmDialog; for a side panel or sheet use Drawer; for non-blocking messages use Alert or Toast.',
  props: {
    open: t.boolean(),
    title: t.text(),
    size: t.enum(['sm', 'md', 'lg']).def('md'),
  },
  events: { close: t.void().desc('emitted by the close control, Escape, and backdrop press') },
  children: true,
  states: ['closed', 'open'],
  rules: ['Focus moves into the dialog on open and returns to the opener on close.', 'Background content is inert while open.', 'Always has a visible close control.'],
  a11y: ['Role dialog, aria-modal, labelled by title.'],
  checks: [
    { kind: 'role', role: 'dialog', props: { open: true } },
    { kind: 'key', key: 'Escape', emits: 'close', props: { open: true } },
    { kind: 'rendersNothing', props: { open: false } },
  ],
  platform: { react: ["portal + focus trap; <div role=\"dialog\" aria-modal>"], flutter: ["rendered by the widget itself while open (barrier + panel), not showDialog in build"] },
});
