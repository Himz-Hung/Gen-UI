import { defineComponent, t } from '@himz-genui/core';
export default defineComponent({
  name: 'ProgressBar', category: 'feedback',
  purpose: 'How far a task has got (upload, profile completion). Omit value when the amount is unknown.',
  props: {
    label: t.text(),
    value: t.number().opt().desc('0–100; omitted = indeterminate'),
    valueLabel: t.text().opt().desc('pre-formatted, e.g. "3 of 5 files"'),
    tone: t.enum(['primary', 'success', 'warning', 'danger']).def('primary'),
    showLabel: t.boolean().def(true),
  },
  states: ['determinate', 'indeterminate'],
  rules: ['Track height 8, radius tokens.radius.full; fill uses the tone color.', 'value is clamped to 0–100.', 'valueLabel, when given, replaces the percentage text.'],
  a11y: ['Role progressbar with min 0, max 100 and the value (none when indeterminate); named by label.'],
  composition: { canContain: [] },
  checks: [
    { kind: 'role', role: 'progressbar', name: { fromProp: 'label' } },
  ],
  platform: { react: ['<progress> or role="progressbar" with aria-valuenow'], flutter: ['m.LinearProgressIndicator(value: value == null ? null : value / 100)'] },
  examples: [{ label: 'Uploading photos', value: 60, valueLabel: '3 of 5 files' }],
});
