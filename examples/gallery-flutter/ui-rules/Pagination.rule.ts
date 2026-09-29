import { defineComponent, t } from '@himz-genui/core';
export default defineComponent({
  name: 'Pagination', category: 'navigation',
  purpose: 'Move between pages of a long list.',
  props: { page: t.number().int().desc('1-based current page'), pageCount: t.number().int() },
  events: { change: t.number().int().desc('requested page, 1-based') },
  rules: ['Previous is disabled on page 1, Next on the last page.', 'Shows at most 7 page targets, collapsing the middle with an ellipsis.', 'Never emits change for the current page.'],
  a11y: ['Wrapped in a navigation landmark labelled "Pagination"; the current page is marked aria-current.'],
  checks: [
    { kind: 'emits', event: 'change', target: '2', props: { page: 1, pageCount: 5 } },
    { kind: 'neverEmits', event: 'change', target: '1', props: { page: 1, pageCount: 5 }, note: 'never emits change for the current page' },
    { kind: 'neverEmits', event: 'change', target: '5', props: { page: 5, pageCount: 5 }, note: 'never emits change for the current page' },
  ],
  platform: { react: ["<nav> with buttons; aria-current on the current page"], flutter: ["a Row of TextButtons / IconButtons"] },
});
