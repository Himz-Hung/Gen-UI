import { defineComponent, t } from '@himz-genui/core';
export default defineComponent({
  name: 'IconButton', category: 'action',
  purpose: 'Compact button showing only an icon. Requires an accessible label.',
  props: {
    icon: t.string(),
    label: t.text().desc('accessible name, not shown visually'),
    variant: t.enum(['ghost', 'secondary']).def('ghost'),
    size: t.enum(['sm', 'md', 'lg']).def('md'),
    disabled: t.boolean().def(false),
    badge: t.string().opt().desc('pre-formatted count shown on the icon, e.g. "3"; "" shows a dot; omitted = no badge'),
  },
  events: { press: t.void() },
  states: ['default', 'hover', 'pressed', 'focused', 'disabled'],
  rules: [
    'badge sits on the top-end corner of the icon in tokens.color.danger with tokens.color.surface text; counts over 99 show "99+"; the badge never changes the button size.','Square: sm 32, md 40, lg 48.', 'Never emits press while disabled.', 'Shows label as a tooltip on hover/long-press.'],
  a11y: ['With a badge the accessible name includes it, e.g. "Cart, 3 items".', 'Role button with label as accessible name.', 'Visible focus ring.'],
  composition: { cannotBeInside: ['Button', 'Link'] },
  checks: [
    { kind: 'size', byProp: 'size', height: { sm: 32, md: 40, lg: 48 }, width: { sm: 32, md: 40, lg: 48 } },
    { kind: 'role', role: 'button', name: { fromProp: 'label' } },
    { kind: 'emits', event: 'press', on: ['press', 'enter', 'space'] },
    { kind: 'neverEmits', event: 'press', props: { disabled: true }, on: ['press', 'enter'] },
  ],
  platform: { react: ['use <button type="button" aria-label>'], flutter: ["IconButton with tooltip = label"] },
});
