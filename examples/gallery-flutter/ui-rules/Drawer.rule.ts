import { defineComponent, t } from '@himz-genui/core';
export default defineComponent({
  name: 'Drawer', category: 'overlay',
  purpose: 'Panel that slides over the screen from a side, or from the bottom as a sheet: filters, a cart preview, extra options. For a blocking question use ConfirmDialog.',
  props: {
    open: t.boolean(),
    title: t.text(),
    side: t.enum(['start', 'end', 'bottom']).def('end').desc('bottom = sheet'),
    size: t.enum(['sm', 'md', 'lg']).def('md'),
  },
  events: { close: t.void().desc('close control, Escape, backdrop press or swipe away') },
  children: true,
  states: ['closed', 'opening', 'open', 'closing'],
  rules: [
    'Width sm 320, md 400, lg 560 logical pixels (height for bottom, capped at 90% of the screen); full width on narrow screens.',
    'Title bar with a close control; the content scrolls, the title bar does not.',
    'Same focus and inert-background rules as Modal.',
  ],
  a11y: ['Role dialog, aria-modal, labelled by title; focus moves in on open and back to the opener on close.'],
  checks: [
    { kind: 'role', role: 'dialog', props: { open: true } },
    { kind: 'key', key: 'Escape', emits: 'close', props: { open: true } },
    { kind: 'rendersNothing', props: { open: false } },
  ],
  platform: { react: ['portal + focus trap; start/end follow the text direction'], flutter: ['side bottom: m.showModalBottomSheet; start/end: m.Scaffold drawer / endDrawer or a sliding overlay'] },
  examples: [{ open: true, title: 'Filters', side: 'end' }],
});
