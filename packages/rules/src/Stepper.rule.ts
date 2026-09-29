import { defineComponent, t } from '@himz-genui/core';
export default defineComponent({
  name: 'Stepper', category: 'navigation',
  purpose: 'Progress through a fixed sequence of steps (checkout, onboarding). Shows the steps; each step\'s content is the rest of the screen.',
  props: {
    steps: t.array(t.object({ label: t.text(), description: t.text().opt() })),
    current: t.number().int().desc('0-based index of the current step'),
    orientation: t.enum(['horizontal', 'vertical']).def('horizontal'),
    allowBack: t.boolean().def(true).desc('completed steps are pressable'),
  },
  events: { press: t.number().int().desc('index of a pressed completed step') },
  rules: [
    'Steps before current show a check mark, current is highlighted with tokens.color.primary, later ones are muted.',
    'Horizontal on wide screens; on narrow screens horizontal shows "Step n of m" with the current label only.',
    'Future steps are never pressable.',
  ],
  a11y: ['An ordered list; the current step is marked current; completed steps say "completed".'],
  composition: { canContain: [] },
  platform: { react: ['<ol> of steps; pressable ones are buttons'], flutter: ['a custom Row / Column of step markers (m.Stepper owns the content, so it is not a fit)'] },
  examples: [{ current: 1, steps: [{ label: 'Cart' }, { label: 'Shipping' }, { label: 'Payment' }] }],
});
