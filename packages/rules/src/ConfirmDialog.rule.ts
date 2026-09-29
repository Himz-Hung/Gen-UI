import { defineComponent, t } from '@himz-genui/core';
export default defineComponent({
  name: 'ConfirmDialog', category: 'overlay',
  purpose: 'Asks the user to confirm or cancel one consequential action ("Delete this order?"). For other content in a dialog use Modal.',
  props: {
    open: t.boolean(),
    title: t.text(),
    message: t.text(),
    confirmLabel: t.text().desc('names the action, e.g. "Delete order" — not "OK"'),
    cancelLabel: t.text(),
    tone: t.enum(['default', 'danger']).def('default'),
    loading: t.boolean().def(false),
  },
  events: { confirm: t.void(), cancel: t.void().desc('cancel button, Escape or backdrop press') },
  states: ['closed', 'open', 'loading'],
  rules: [
    'Two buttons: cancel (secondary) and confirm (primary, or danger when tone=danger), confirm last.',
    'loading=true keeps the dialog open, puts confirm in its loading state and disables cancel.',
    'Initial focus is on cancel when tone=danger, otherwise on confirm.',
    'Same focus and inert-background rules as Modal.',
  ],
  a11y: ['Role alertdialog labelled by title and described by message.'],
  composition: { canContain: [] },
  checks: [
    { kind: 'rendersNothing', props: { open: false } },
    { kind: 'key', key: 'Escape', emits: 'cancel', props: { open: true } },
    { kind: 'emits', event: 'confirm', target: 'Delete order', props: { open: true, confirmLabel: 'Delete order' } },
    { kind: 'emits', event: 'cancel', target: 'Keep it', props: { open: true, cancelLabel: 'Keep it' } },
    { kind: 'neverEmits', event: 'cancel', target: 'Keep it', props: { open: true, loading: true, cancelLabel: 'Keep it' } },
  ],
  platform: { react: ['portal + focus trap'], flutter: ['m.showDialog with an m.AlertDialog driven by open'] },
  examples: [{ open: true, title: 'Delete this order?', message: 'This cannot be undone.', confirmLabel: 'Delete order', cancelLabel: 'Keep it', tone: 'danger' }],
});
