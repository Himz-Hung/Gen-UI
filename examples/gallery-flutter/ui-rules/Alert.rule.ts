import { defineComponent, t } from '@himz-genui/core';
export default defineComponent({
  name: 'Alert', category: 'feedback',
  purpose: 'Inline message about the current screen: info, success, warning or error. Not a toast.',
  props: {
    tone: t.enum(['info', 'success', 'warning', 'danger']).def('info'),
    title: t.text(),
    description: t.text().opt(),
    dismissible: t.boolean().def(false),
  },
  events: { dismiss: t.void() },
  rules: ['Tone conveyed by icon, color and title — never color alone.', 'Radius tokens.radius.md; full width of parent.'],
  a11y: ['danger/warning use role alert; info/success use role status.'],
  composition: { canContain: [] },
  checks: [
    { kind: 'role', role: 'alert', props: { tone: 'danger' } },
    { kind: 'role', role: 'alert', props: { tone: 'warning' } },
    { kind: 'role', role: 'status', props: { tone: 'info' } },
    { kind: 'role', role: 'status', props: { tone: 'success' } },
  ],
  platform: { react: ["role=\"alert\" for danger/warning, role=\"status\" otherwise"], flutter: ["a Container with an Icon and texts; Semantics(liveRegion: true)"] },
});
