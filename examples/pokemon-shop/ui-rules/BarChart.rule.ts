import { defineComponent, t } from '@himz-genui/core';
export default defineComponent({
  name: 'BarChart', category: 'chart',
  purpose: 'Compare a value across categories (orders per set).',
  props: {
    summary: t.text().desc('one sentence stating what the chart shows'),
    bars: t.array(t.object({ label: t.string().desc('category name, pre-formatted'), value: t.number(), valueLabel: t.string().opt().desc('pre-formatted, shown on the bar') })),
    orientation: t.enum(['vertical', 'horizontal']).def('vertical'),
    height: t.number().def(240),
    showValues: t.boolean().def(false),
  },
  events: { barPress: t.number().desc('index of the pressed bar') },
  states: ['default', 'empty'],
  rules: [
    'Bars start at 0; one color (tokens.color.primary) unless a bar is highlighted by the screen.',
    'Horizontal is preferred when labels are long; labels never overlap — they wrap or truncate with the full text on hover.',
    'empty shows the summary text in place of the plot.',
  ],
  a11y: ['Image named by summary, plus a data table alternative.'],
  composition: { canContain: [] },
  platform: { react: ['SVG, or the project chart library'], flutter: ['CustomPaint, or the project chart package'] },
  examples: [{ summary: 'Base Set sells the most', bars: [{ label: 'Base Set', value: 42 }, { label: 'Jungle', value: 18 }] }],
});
