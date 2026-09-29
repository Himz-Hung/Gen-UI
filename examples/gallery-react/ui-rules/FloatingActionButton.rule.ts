import { defineComponent, t } from '@himz-genui/core';
export default defineComponent({
  name: 'FloatingActionButton', category: 'action',
  purpose: 'The one main action of a screen, floating over the content at the bottom corner ("New order", "+"). At most one per screen; for other actions use Button.',
  props: {
    label: t.text().desc('accessible name; shown next to the icon when extended'),
    icon: t.string().desc('icon name from the project set, e.g. "plus"'),
    extended: t.boolean().def(false).desc('show the label next to the icon'),
    position: t.enum(['end', 'center', 'start']).def('end'),
    size: t.enum(['sm', 'md']).def('md'),
    disabled: t.boolean().def(false),
  },
  events: { press: t.void() },
  states: ['default', 'hover', 'pressed', 'focused', 'disabled'],
  rules: [
    'Stays fixed at the bottom of the viewport (end corner by default) while the content scrolls, above a BottomNav when there is one, inside the safe area.',
    'The screen places it as the last child of its root; the implementation lifts it out of the layout, it never takes space in the flow.',
    'Size md 56, sm 40 logical pixels (extended: height 56, width to fit); background tokens.color.primary, icon and label tokens.color.surface; radius tokens.radius.lg.',
    'Never emits press while disabled.',
  ],
  a11y: ['Role button named by label, also when the label is not shown.', 'Reachable by keyboard after the page content.'],
  composition: { canContain: [], cannotBeInside: ['Button', 'Link', 'Card', 'List'] },
  checks: [
    { kind: 'size', byProp: 'size', height: { sm: 40, md: 56 }, width: { sm: 40, md: 56 } },
    { kind: 'role', role: 'button', name: { fromProp: 'label' } },
    { kind: 'role', role: 'button', name: { fromProp: 'label' }, props: { extended: true } },
    { kind: 'emits', event: 'press', on: ['press', 'enter', 'space'] },
    { kind: 'neverEmits', event: 'press', props: { disabled: true }, on: ['press', 'enter'] },
  ],
  platform: { react: ['<button> with position: fixed and env(safe-area-inset-*)'], flutter: ['m.FloatingActionButton / .extended lifted into an OverlayPortal so it stays fixed without a Scaffold'] },
  examples: [{ label: 'New order', icon: 'plus' }, { label: 'Add card', icon: 'plus', extended: true }],
});
