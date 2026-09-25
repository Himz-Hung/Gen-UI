import { defineComponent, t } from '@himz-genui/core';
export default defineComponent({
  name: 'Tabs', category: 'navigation',
  purpose: 'Switch between views within the same screen. For moving between screens use the flow and TopBar/BottomNav.',
  props: {
    tabs: t.array(t.object({ value: t.string(), label: t.string() })),
    value: t.string(),
  },
  events: { change: t.string() },
  children: true,
  rules: ['Children are the content of the active tab; the screen swaps children when value changes.', 'Active tab is marked by a tokens.color.primary indicator and text — not color alone.'],
  a11y: ['Roles tablist / tab / tabpanel; arrow keys move between tabs.'],
});
