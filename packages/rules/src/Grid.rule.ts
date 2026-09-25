import { defineComponent, t } from '@genui/core';
export default defineComponent({
  name: 'Grid', category: 'layout',
  purpose: 'Responsive grid of equal-width cells. Use for product/card listings. Not for tabular data — use Table.',
  props: {
    minItemWidth: t.number().def(220).desc('cells are at least this wide (px); column count follows from available width'),
    gap: t.enum(['0', '1', '2', '3', '4', '5', '6', '7']).def('4'),
  },
  children: true,
  rules: [
    'Column count = floor(availableWidth / minItemWidth), minimum 1. Never a fixed column count.',
    'All cells in a row share the same height.',
    'Order is source order, filling rows left to right.',
  ],
  platform: { react: ['use CSS grid with repeat(auto-fill, minmax(minItemWidth, 1fr))'], flutter: ['GridView with SliverGridDelegateWithMaxCrossAxisExtent'] },
});
