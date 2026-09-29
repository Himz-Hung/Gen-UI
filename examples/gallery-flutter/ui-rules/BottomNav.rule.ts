import { defineComponent, t } from '@himz-genui/core';
export default defineComponent({
  name: 'BottomNav', category: 'navigation',
  purpose: 'The app\'s 3–5 top-level destinations at the bottom of the screen on phones. For views inside one screen use Tabs; on wide screens use Sidebar.',
  props: {
    items: t.array(t.object({ value: t.string(), label: t.text(), icon: t.string(), badge: t.string().opt().desc('pre-formatted count, e.g. "3"') })),
    value: t.string(),
  },
  events: { change: t.string().desc('value of the pressed item') },
  rules: [
    '3 to 5 items, each with an icon and a label; the active one uses tokens.color.primary and a filled icon.',
    'Stays fixed at the bottom above the safe area; content scrolls behind it.',
    'Pressing the active item again emits change too (screens may scroll to top).',
  ],
  a11y: ['Navigation landmark; the active item is marked current; badges are part of the item name ("Cart, 3 items").'],
  composition: { canContain: [] },
  checks: [
    { kind: 'emits', event: 'change', target: 'Cart', note: 'pressing an item emits its value' },
    { kind: 'emits', event: 'change', target: 'Home', note: 'pressing the active item again emits change too' },
  ],
  platform: { react: ['<nav> with buttons or links; position fixed with env(safe-area-inset-bottom)'], flutter: ['m.NavigationBar with NavigationDestinations'] },
  examples: [{ value: 'home', items: [{ value: 'home', label: 'Home', icon: 'home' }, { value: 'cart', label: 'Cart', icon: 'cart', badge: '3' }, { value: 'me', label: 'Account', icon: 'user' }] }],
});
