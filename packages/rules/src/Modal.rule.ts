import { defineComponent, t } from '@genui/core';
export default defineComponent({
  name: 'Modal', category: 'overlay',
  purpose: 'Blocking dialog over the current screen. For confirmations use ConfirmDialog (planned); for non-blocking messages use Alert.',
  props: {
    open: t.boolean(),
    title: t.string(),
    size: t.enum(['sm', 'md', 'lg']).def('md'),
  },
  events: { close: t.void().desc('emitted by the close control, Escape, and backdrop press') },
  children: true,
  states: ['closed', 'open'],
  rules: ['Focus moves into the dialog on open and returns to the opener on close.', 'Background content is inert while open.', 'Always has a visible close control.'],
  a11y: ['Role dialog, aria-modal, labelled by title.'],
});
