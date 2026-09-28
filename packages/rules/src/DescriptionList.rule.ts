import { defineComponent, t } from '@himz-genui/core';
export default defineComponent({
  name: 'DescriptionList', category: 'data',
  purpose: 'Label–value pairs about one thing: order details, card specs, profile facts.',
  props: {
    items: t.array(t.object({ label: t.text(), value: t.string().desc('pre-formatted') })),
    layout: t.enum(['inline', 'stacked']).def('inline').desc('inline: label and value on one row; stacked: label above value'),
    columns: t.enum(['1', '2']).def('1'),
  },
  rules: [
    'Labels in tokens.color.muted, values in tokens.color.text; inline layout aligns all values to one column.',
    'On narrow screens columns=2 falls back to 1 and inline may fall back to stacked.',
  ],
  a11y: ['Description list semantics (dl / dt / dd) or equivalent label–value grouping.'],
  composition: { canContain: [] },
  platform: { react: ['<dl> with <dt>/<dd>'], flutter: ['m.Table or rows of two Texts wrapped in MergeSemantics'] },
  examples: [{ items: [{ label: 'Set', value: 'Base Set' }, { label: 'Condition', value: 'Near mint' }] }],
});
