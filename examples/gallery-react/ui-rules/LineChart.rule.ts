import { defineComponent, t } from '@himz-genui/core';
export default defineComponent({
  name: 'LineChart', category: 'chart',
  purpose: 'Trend of one or more series over an ordered axis (sales per day).',
  props: {
    summary: t.text().desc('one sentence stating what the chart shows, for screen readers and as a fallback'),
    series: t.array(t.object({ name: t.text(), points: t.array(t.object({ x: t.string().desc('pre-formatted axis label'), y: t.number() })) })),
    yLabel: t.text().opt(),
    xLabel: t.text().opt(),
    height: t.number().def(240),
    showLegend: t.boolean().def(true).desc('only shown with more than one series'),
  },
  events: { pointPress: t.object({ series: t.number().int(), index: t.number().int() }) },
  states: ['default', 'empty'],
  rules: [
    'Series colors come from the project tokens in a fixed order (primary, secondary, then success, warning, danger).',
    'Y axis starts at 0 unless every value is far from it; gridlines are light; no 3D, no animation longer than 300 ms.',
    'Hover / press on a point shows its x, y and series name.',
    'empty (no points) shows the summary text in place of the plot.',
  ],
  a11y: ['Image named by summary, plus a data table alternative reachable by assistive tech.'],
  composition: { canContain: [] },
  platform: { react: ['SVG, or a chart library the project adds (one for the whole project)'], flutter: ['CustomPaint, or a chart package the project adds (one for the whole project)'] },
  examples: [{ summary: 'Sales rose from 12 to 30 orders over the week', series: [{ name: 'Orders', points: [{ x: 'Mon', y: 12 }, { x: 'Sun', y: 30 }] }] }],
});
