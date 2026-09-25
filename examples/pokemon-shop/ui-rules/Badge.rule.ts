import { defineComponent, t } from '@himz-genui/core';
export default defineComponent({
  name: 'Badge', category: 'data',
  purpose: 'Small status label (e.g. "Holo", "Out of stock"). Not interactive.',
  props: {
    label: t.string(),
    tone: t.enum(['neutral', 'primary', 'success', 'warning', 'danger']).def('neutral'),
  },
  rules: ['Height 20–24 logical pixels, radius tokens.radius.full, text size xs, weight medium.', 'Tone is conveyed by both color and text — never color alone.'],
  composition: { canContain: [] },
});
