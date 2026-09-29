import { defineComponent, t } from '@himz-genui/core';
export default defineComponent({
  name: 'ImageViewer', category: 'media',
  purpose: 'Full-screen view of one or more images with zoom and swipe (product photos, a card scan). Opened from an Image the user pressed.',
  props: {
    open: t.boolean(),
    label: t.text().desc('accessible name, e.g. "Card photos"'),
    images: t.array(t.object({ src: t.string(), alt: t.text() })),
    index: t.number().int().def(0).desc('image shown, 0-based'),
  },
  events: { close: t.void().desc('close control, Escape, or swipe down'), change: t.number().int().desc('new index') },
  states: ['closed', 'open', 'zoomed'],
  rules: [
    'Covers the whole screen on a dark backdrop (tokens.color.text at high opacity); the image fits the screen without cropping.',
    'Pinch, double-tap or wheel zooms up to 4×; while zoomed, dragging pans instead of switching images.',
    'Swipe, arrow keys or on-screen arrows move between images; a counter shows "n / m" when there is more than one.',
    'Always has a visible close control; focus moves in on open and returns to the opener on close, like Modal.',
  ],
  a11y: ['Role dialog named by label; each image announces its alt and position ("2 of 5").'],
  composition: { canContain: [] },
  checks: [
    { kind: 'role', role: 'dialog', name: { fromProp: 'label' } },
    { kind: 'key', key: 'Escape', emits: 'close' },
    { kind: 'rendersNothing', props: { open: false } },
  ],
  platform: { react: ['portal + focus trap; CSS transform for zoom and pan'], flutter: ['OverlayPortal with a PageView of m.InteractiveViewer'] },
  examples: [{ open: true, label: 'Card photos', images: [{ src: 'https://example.com/front.jpg', alt: 'Front' }, { src: 'https://example.com/back.jpg', alt: 'Back' }] }],
});
