import { defineComponent, t } from '@himz-genui/core';
export default defineComponent({
  name: 'Accordion', category: 'data',
  purpose: 'Sections that expand and collapse under their titles: FAQs, long settings. Children are the section contents, one per item, in order.',
  props: {
    items: t.array(t.object({ value: t.string(), title: t.text() })),
    open: t.array(t.string()).desc('values of the open sections'),
    multiple: t.boolean().def(false).desc('false: opening one closes the others'),
  },
  events: { change: t.array(t.string()).desc('new list of open values') },
  children: true,
  states: ['collapsed', 'expanded'],
  rules: [
    'children[i] is the content of items[i]; a closed section keeps its content out of the layout.',
    'Each title row is a full-width target with a chevron that turns when open.',
    'Sections are separated by 1px lines.',
  ],
  a11y: ['Each title is a button with aria-expanded controlling its region.'],
  platform: { react: ['<button aria-expanded> + region; <details> is acceptable when multiple=true'], flutter: ['m.ExpansionPanelList, or m.ExpansionTile per item'] },
  examples: [{ items: [{ value: 'ship', title: 'How long does shipping take?' }, { value: 'return', title: 'Can I return a card?' }], open: ['ship'] }],
});
