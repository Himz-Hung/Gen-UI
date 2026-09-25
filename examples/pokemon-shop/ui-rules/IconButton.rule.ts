import { defineComponent, t } from '@himz-genui/core';
export default defineComponent({
  name: 'IconButton', category: 'action',
  purpose: 'Compact button showing only an icon. Requires an accessible label.',
  props: {
    icon: t.string(),
    label: t.string().desc('accessible name, not shown visually'),
    variant: t.enum(['ghost', 'secondary']).def('ghost'),
    size: t.enum(['sm', 'md', 'lg']).def('md'),
    disabled: t.boolean().def(false),
  },
  events: { press: t.void() },
  states: ['default', 'hover', 'pressed', 'focused', 'disabled'],
  rules: ['Square: sm 32, md 40, lg 48.', 'Never emits press while disabled.', 'Shows label as a tooltip on hover/long-press.'],
  a11y: ['Role button with label as accessible name.', 'Visible focus ring.'],
  composition: { cannotBeInside: ['Button', 'Link'] },
  platform: { react: ['use <button type="button" aria-label>'] },
});
