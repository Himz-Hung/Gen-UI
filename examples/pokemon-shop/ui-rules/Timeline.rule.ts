import { defineComponent, t } from '@himz-genui/core';
export default defineComponent({
  name: 'Timeline', category: 'data',
  purpose: 'Events in time order: order tracking, activity history.',
  props: {
    items: t.array(t.object({ title: t.text(), time: t.string().opt().desc('pre-formatted'), description: t.text().opt(), tone: t.enum(['neutral', 'primary', 'success', 'warning', 'danger']).opt() })),
    order: t.enum(['oldest-first', 'newest-first']).def('oldest-first'),
  },
  rules: [
    'A vertical line joins a dot per item; the dot uses the item tone (neutral by default).',
    'time is shown next to the title in tokens.color.muted; the component never formats dates.',
  ],
  a11y: ['An ordered list; tone is also conveyed by the title text, never color alone.'],
  composition: { canContain: [] },
  platform: { react: ['<ol> with styled markers'], flutter: ['a Column of Rows with a painted dot and line'] },
  examples: [{ items: [{ title: 'Order placed', time: 'Sep 28, 10:02' }, { title: 'Shipped', time: 'Sep 29', tone: 'success' }] }],
});
