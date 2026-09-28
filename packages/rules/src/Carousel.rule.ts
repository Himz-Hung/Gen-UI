import { defineComponent, t } from '@himz-genui/core';
export default defineComponent({
  name: 'Carousel', category: 'media',
  purpose: 'One slide at a time from a small set (photos of one card, onboarding). Children are the slides.',
  props: {
    label: t.text().desc('accessible name of the carousel, e.g. "Card photos"'),
    index: t.number().def(0).desc('visible slide, 0-based'),
    loop: t.boolean().def(false),
    showDots: t.boolean().def(true),
    showArrows: t.boolean().def(true).desc('on pointer devices'),
  },
  events: { change: t.number().desc('new index') },
  children: true,
  states: ['default', 'dragging'],
  rules: [
    'Swipe on touch, arrows on pointer devices; each slide fills the width.',
    'Never advances by itself.',
    'Arrows and dots are real controls; dots are hidden when there is one slide.',
  ],
  a11y: ['Region named by label with "slide n of m" for the visible slide; arrow controls are named "Previous slide" / "Next slide".'],
  platform: { react: ['CSS scroll-snap with buttons scrolling programmatically'], flutter: ['m.PageView with a PageController synced to index'] },
  examples: [{ label: 'Card photos', index: 0 }],
});
