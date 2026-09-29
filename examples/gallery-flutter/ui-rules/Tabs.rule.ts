import { defineComponent, t } from '@himz-genui/core';
export default defineComponent({
  name: 'Tabs', category: 'navigation',
  purpose: 'Switch between views within the same screen. For moving between screens use the flow and TopBar/BottomNav.',
  props: {
    tabs: t.array(t.object({ value: t.string(), label: t.text() })),
    value: t.string(),
  },
  events: { change: t.string() },
  children: true,
  rules: ['Children are the content of the active tab; the screen swaps children when value changes.', 'Active tab is marked by a tokens.color.primary indicator and text — not color alone.'],
  a11y: ['Roles tablist / tab / tabpanel; arrow keys move between tabs.'],
  checks: [
    { kind: 'emits', event: 'change', target: 'Two', props: { tabs: [{value:'one',label:'One'},{value:'two',label:'Two'},{value:'three',label:'Three'}], value: 'one' } },
    { kind: 'role', role: 'tab', name: 'Two', props: { tabs: [{value:'one',label:'One'},{value:'two',label:'Two'},{value:'three',label:'Three'}], value: 'one' } },
    { kind: 'key', key: 'ArrowRight', emits: 'change', level: 'warn', props: { tabs: [{value:'one',label:'One'},{value:'two',label:'Two'},{value:'three',label:'Three'}], value: 'one' }, note: 'arrow keys move between tabs' },
  ],
  platform: { react: ["role=\"tablist\" with buttons role=\"tab\""], flutter: ["a TabBar-like Row driven by value (not a TabController-owned state)"] },
});
