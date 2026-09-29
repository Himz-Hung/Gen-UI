import { defineComponent, t } from '@himz-genui/core';
export default defineComponent({
  name: 'HorizontalScroll', category: 'layout',
  purpose: 'A row of items that scrolls sideways ("New arrivals", "Recently viewed"). Several items are visible at once; for one slide at a time use Carousel.',
  props: {
    label: t.text().desc('accessible name of the row, usually the section title'),
    gap: t.enum(['0', '1', '2', '3', '4', '5', '6', '7']).def('3').desc('index into tokens.spacing'),
    itemWidth: t.number().opt().desc('fixed width of every item in logical pixels; omitted = each item keeps its own width'),
    snap: t.boolean().def(true).desc('scrolling settles on an item edge'),
    showArrows: t.boolean().def(true).desc('previous / next controls on pointer devices'),
  },
  children: true,
  states: ['start', 'middle', 'end'],
  rules: [
    'Children are laid out in one row in source order and never wrap; the row is as tall as its tallest item.',
    'The next item peeks at the edge so it is clear the row scrolls; no visible scrollbar on touch devices.',
    'Arrows scroll by about one viewport width and are disabled at the start / end.',
    'Horizontal padding matches the page padding so the first item lines up with the content above.',
  ],
  a11y: ['Region named by label; every item stays reachable by keyboard (focus scrolls it into view).'],
  platform: { react: ['overflow-x: auto with scroll-snap-type: x mandatory; buttons call scrollBy'], flutter: ['a horizontal m.ListView (or SingleChildScrollView + Row) with a ScrollController for the arrows'] },
  examples: [{ label: 'New arrivals', itemWidth: 180 }],
});
