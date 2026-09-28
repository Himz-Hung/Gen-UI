import { defineComponent, t } from '@himz-genui/core';
export default defineComponent({
  name: 'Tooltip', category: 'feedback',
  purpose: 'Brief extra hint for the one element inside it, typically an IconButton. Never the only place important information lives.',
  props: {
    text: t.text(),
    placement: t.enum(['top', 'bottom', 'start', 'end']).def('top'),
  },
  children: true,
  states: ['hidden', 'visible'],
  rules: [
    'Wraps exactly one child, which is the trigger.',
    'Shows on hover and keyboard focus (and long-press on touch) after a short delay; hides on leave, blur or Escape.',
    'Plain text only, one or two lines; flips placement when it would leave the screen.',
  ],
  a11y: ['text describes the trigger (aria-describedby / semantic hint); it never contains interactive content.'],
  platform: { react: ['role="tooltip" linked with aria-describedby'], flutter: ['m.Tooltip(message: text, child: …)'] },
  examples: [{ text: 'Share this card' }],
});
