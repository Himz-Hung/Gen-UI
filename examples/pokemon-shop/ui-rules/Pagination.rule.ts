import { defineComponent, t } from '@himz-genui/core';
export default defineComponent({
  name: 'Pagination', category: 'navigation',
  purpose: 'Move between pages of a long list.',
  props: { page: t.number().desc('1-based current page'), pageCount: t.number() },
  events: { change: t.number().desc('requested page, 1-based') },
  rules: ['Previous is disabled on page 1, Next on the last page.', 'Shows at most 7 page targets, collapsing the middle with an ellipsis.', 'Never emits change for the current page.'],
  a11y: ['Wrapped in a navigation landmark labelled "Pagination"; the current page is marked aria-current.'],
});
