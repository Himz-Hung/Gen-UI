import { defineComponent, t } from '@himz-genui/core';
export default defineComponent({
  name: 'ChipGroup', category: 'input',
  purpose: 'Toggle chips for quick filters or picking a few options ("Holo", "Rare", "Under $10"). For removable active filters use Tag; for switching views use SegmentedControl.',
  props: {
    label: t.text().desc('accessible name of the group'),
    options: t.array(t.object({ value: t.string(), label: t.text(), icon: t.string().opt(), disabled: t.boolean().opt() })),
    value: t.array(t.string()).desc('values of the selected chips'),
    multiple: t.boolean().def(true).desc('false: at most one selected, pressing it again clears it'),
    size: t.enum(['sm', 'md']).def('md'),
    wrap: t.boolean().def(true).desc('false: one row that scrolls sideways'),
  },
  events: { change: t.array(t.string()).desc('new list of selected values') },
  rules: [
    'Selected chips use a tokens.color.primary tint with a check icon; the state is never color alone.',
    'Height sm 28, md 32; radius tokens.radius.full; gap tokens.spacing[2].',
  ],
  a11y: ['Group named by label; each chip is a toggle button with aria-pressed (checkbox semantics when multiple, radio when not).'],
  composition: { canContain: [] },
  checks: [
    { kind: 'size', byProp: 'size', height: { sm: 28, md: 32 } },
    { kind: 'emits', event: 'change', target: 'Rare' },
  ],
  platform: { react: ['<button aria-pressed> per chip'], flutter: ['m.FilterChip (multiple) / m.ChoiceChip (single) in a Wrap or horizontal ListView'] },
  examples: [{ label: 'Rarity', value: ['holo'], options: [{ value: 'holo', label: 'Holo' }, { value: 'rare', label: 'Rare' }] }],
});
