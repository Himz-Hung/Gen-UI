import { defineComponent, t } from '@himz-genui/core';
export default defineComponent({
  name: 'PieChart', category: 'chart',
  purpose: 'Share of a whole across a few (2–6) parts. For more parts or comparisons use BarChart.',
  props: {
    summary: t.text().desc('one sentence stating what the chart shows'),
    slices: t.array(t.object({ label: t.string().desc('pre-formatted'), value: t.number() })),
    donut: t.boolean().def(true),
    centerLabel: t.text().opt().desc('text in the donut hole, e.g. a total'),
    height: t.number().def(200),
  },
  events: { slicePress: t.number().desc('index of the pressed slice') },
  states: ['default', 'empty'],
  rules: [
    'Slices in the given order, clockwise from the top, colored from the tokens in a fixed order.',
    'A legend lists every slice with its label and percentage; the chart never relies on color alone.',
    'empty (all values 0) shows the summary text.',
  ],
  a11y: ['Image named by summary, plus a data table alternative.'],
  composition: { canContain: [] },
  platform: { react: ['SVG arcs, or the project chart library'], flutter: ['CustomPaint, or the project chart package'] },
  examples: [{ summary: 'Most orders are near-mint cards', slices: [{ label: 'Near mint', value: 60 }, { label: 'Played', value: 40 }] }],
});
