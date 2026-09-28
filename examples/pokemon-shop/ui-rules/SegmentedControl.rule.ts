import { defineComponent, t } from '@himz-genui/core';
export default defineComponent({
  name: 'SegmentedControl', category: 'navigation',
  purpose: 'Switch between 2–5 closely related views or modes in place (Grid / List, Day / Week). For content sections use Tabs; for a form choice use RadioGroup.',
  props: {
    label: t.text().desc('accessible name of the group'),
    options: t.array(t.object({ value: t.string(), label: t.text(), icon: t.string().opt() })),
    value: t.string(),
    size: t.enum(['sm', 'md']).def('md'),
    fullWidth: t.boolean().def(false),
  },
  events: { change: t.string() },
  rules: [
    'Segments share one rounded track (tokens.radius.md); the selected one has a raised surface and bold text.',
    'Height sm 32, md 40; segments have equal width when fullWidth.',
  ],
  a11y: ['Radio group semantics (one selected) named by label; arrow keys move the selection.'],
  composition: { canContain: [] },
  platform: { react: ['role="radiogroup" with buttons role="radio"'], flutter: ['m.SegmentedButton with a single selection'] },
  examples: [{ label: 'View', value: 'grid', options: [{ value: 'grid', label: 'Grid', icon: 'grid' }, { value: 'list', label: 'List', icon: 'list' }] }],
});
