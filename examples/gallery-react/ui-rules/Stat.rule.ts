import { defineComponent, t } from '@himz-genui/core';
export default defineComponent({
  name: 'Stat', category: 'data',
  purpose: 'One labelled figure, e.g. "Total · $124.00". Use in a Grid or Inline for KPI rows.',
  props: {
    label: t.text(),
    value: t.text().desc('pre-formatted; the component never formats numbers or currency'),
    trend: t.enum(['up', 'down', 'flat']).opt(),
    hint: t.text().opt(),
  },
  rules: ['label above value; value uses heading font, size lg.', 'trend shows an arrow and color (success/danger/muted) plus the arrow glyph — never color alone.'],
  platform: { react: ["<div> with the label and value; no number formatting"], flutter: ["a Column of two Texts"] },
});
