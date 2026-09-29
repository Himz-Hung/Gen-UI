import { defineComponent, t } from '@himz-genui/core';
export default defineComponent({
  name: 'SiteHeader', category: 'navigation',
  purpose: 'The header shared by every page of a site or app: brand, main links and account actions. It adapts to narrow screens with a menu. For the title bar of one screen use TopBar.',
  props: {
    brand: t.text().desc('site or app name, also the accessible name of the home link'),
    logo: t.string().opt().desc('logo image src; the brand text is still the accessible name'),
    links: t.array(t.object({ value: t.string(), label: t.text(), active: t.boolean().opt() })).def([]),
    actions: t.array(t.object({ value: t.string(), label: t.text(), icon: t.string().opt(), variant: t.enum(['primary', 'secondary', 'ghost']).opt() })).def([]).desc('e.g. "Sign in", a primary "Book now"'),
    menuLabel: t.text().desc('accessible name of the narrow-screen menu button, e.g. "Menu"'),
    sticky: t.boolean().def(true).desc('stays at the top while the page scrolls'),
  },
  events: { brandPress: t.void(), navigate: t.string().desc('value of a pressed link'), action: t.string().desc('value of a pressed action') },
  states: ['wide', 'narrow', 'menu-open'],
  rules: [
    'Wide screens (≥ 768 logical pixels): brand at the start, links next to it, actions at the end, all on one row 64 tall.',
    'Narrow screens: brand at the start and a menu button at the end, 56 tall; the button opens a Drawer (side end) listing the links, then the actions as full-width buttons; choosing one closes it.',
    'The active link is marked by an underline or bar and bold text, not color alone.',
    'Background tokens.color.surface with a 1px bottom border; when sticky, content scrolls beneath it.',
  ],
  a11y: ['A banner landmark with a navigation landmark for the links; the active link is marked current; the menu button states whether the menu is open.'],
  composition: { canContain: [] },
  platform: { react: ['<header> with <nav>; position: sticky; the menu opens a Drawer'], flutter: ['a LayoutBuilder switching wide / narrow; narrow uses UiDrawer for the menu; sticky is achieved by the shell placing it above the scroll view'] },
  examples: [{ brand: 'Seaside Stays', menuLabel: 'Menu', links: [{ value: 'rooms', label: 'Rooms', active: true }, { value: 'offers', label: 'Offers' }], actions: [{ value: 'signin', label: 'Sign in', variant: 'ghost' }, { value: 'book', label: 'Book now', variant: 'primary' }] }],
});
