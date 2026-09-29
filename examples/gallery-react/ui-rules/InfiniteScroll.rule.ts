import { defineComponent, t } from '@himz-genui/core';
export default defineComponent({
  name: 'InfiniteScroll', category: 'layout',
  purpose: 'Loads the next page when the user scrolls near the end of a long list or grid. Children are the list content. For numbered pages use Pagination.',
  props: {
    loading: t.boolean(),
    hasMore: t.boolean(),
    loadMoreLabel: t.text().desc('text of the fallback button, e.g. "Load more cards"'),
    endText: t.text().opt().desc('shown when hasMore is false, e.g. "You have seen everything"'),
  },
  events: { loadMore: t.void() },
  children: true,
  states: ['idle', 'loading', 'end'],
  rules: [
    'Emits loadMore once when the end comes within about one screen height, and never while loading or when hasMore is false.',
    'While loading, a Spinner sits after the last item; items already shown never move.',
    'A load-more button with loadMoreLabel is always present at the end as a fallback (keyboard, assistive tech, failed loads).',
  ],
  a11y: ['New items are announced politely ("20 more cards loaded"); focus stays where it was.'],
  checks: [
    { kind: 'emits', event: 'loadMore', props: { hasMore: true, loading: false }, target: 'Load more cards' },
    { kind: 'neverEmits', event: 'loadMore', props: { loading: true, hasMore: true }, on: ['press'] },
  ],
  platform: { react: ['IntersectionObserver on a sentinel after the last child'], flutter: ['a ScrollController listener near maxScrollExtent, or a trailing item in the ListView builder'] },
  examples: [{ loading: false, hasMore: true, loadMoreLabel: 'Load more cards' }],
});
