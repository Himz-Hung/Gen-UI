import { defineComponent, t } from '@himz-genui/core';
export default defineComponent({
  name: 'Sidebar', category: 'navigation',
  purpose: 'Vertical list of top-level destinations on wide screens (dashboards, admin). On phones use BottomNav or a Drawer.',
  props: {
    items: t.array(t.object({ value: t.string(), label: t.text(), icon: t.string().opt(), badge: t.string().opt(), section: t.text().opt().desc('heading this item is grouped under') })),
    value: t.string(),
    title: t.text().opt(),
    collapsed: t.boolean().def(false).desc('icons only'),
  },
  events: { change: t.string(), toggle: t.void().desc('collapse control pressed') },
  states: ['expanded', 'collapsed'],
  rules: [
    'Width 240 expanded, 64 collapsed; full height; items 40 tall.',
    'The active item has a tokens.color.primary indicator and bold label.',
    'Collapsed: labels hide and show as tooltips; badges become dots.',
    'Items with the same section are grouped under that heading, in order of first appearance.',
  ],
  a11y: ['Navigation landmark named by title; the active item is marked current; the collapse control states its expanded state.'],
  composition: { canContain: [] },
  platform: { react: ['<nav> with a list of links or buttons'], flutter: ['m.NavigationRail (collapsed) / m.NavigationDrawer (expanded)'] },
  examples: [{ value: 'orders', title: 'Admin', items: [{ value: 'orders', label: 'Orders', icon: 'box', badge: '12' }, { value: 'cards', label: 'Cards', icon: 'grid', section: 'Catalog' }] }],
});
