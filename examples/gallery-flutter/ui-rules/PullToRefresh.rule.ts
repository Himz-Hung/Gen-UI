import { defineComponent, t } from '@himz-genui/core';
export default defineComponent({
  name: 'PullToRefresh', category: 'layout',
  purpose: 'Lets the user reload a scrolling list by pulling it down on touch screens. Children are the scrolling content.',
  props: {
    label: t.text().desc('accessible name of the refresh action, e.g. "Refresh cards"'),
    refreshing: t.boolean(),
  },
  events: { refresh: t.void() },
  children: true,
  states: ['idle', 'pulling', 'refreshing'],
  rules: [
    'Pulling past the threshold at the top emits refresh; the indicator stays while refreshing=true.',
    'Never emits refresh again while refreshing.',
    'On pointer-only devices there is no gesture; the screen provides a refresh control elsewhere.',
  ],
  a11y: ['The refresh action is also available to assistive tech (a custom action named by label).'],
  platform: { react: ['touch events on the scroll container; no-op on desktop'], flutter: ['m.RefreshIndicator whose onRefresh completes when refreshing turns false'] },
  examples: [{ label: 'Refresh cards', refreshing: false }],
});
