import { defineComponent, t } from '@himz-genui/core';
export default defineComponent({
  name: 'DatePicker', category: 'input',
  purpose: 'Pick one calendar date. Values are ISO dates (YYYY-MM-DD); the component shows them in the user\'s locale.',
  props: {
    label: t.text(),
    value: t.string().desc('ISO date, "" for none'),
    min: t.string().opt().desc('earliest ISO date'),
    max: t.string().opt().desc('latest ISO date'),
    placeholder: t.text().opt(),
    hint: t.text().opt(),
    error: t.text().opt(),
    disabled: t.boolean().def(false),
  },
  events: { change: t.string().desc('ISO date') },
  states: ['default', 'open', 'focused', 'disabled', 'error'],
  rules: [
    'The field shows the date formatted for the current locale; value and change stay ISO.',
    'Dates outside min / max cannot be chosen and look disabled.',
    'Same label, hint and error behaviour as Input; typing a date is allowed where the platform supports it.',
  ],
  a11y: ['The calendar is keyboard operable: arrows move by day, Page by month, Enter picks, Escape closes.'],
  checks: [
    { kind: 'neverEmits', event: 'change', props: { disabled: true } },
  ],
  platform: { react: ['<input type="date"> is acceptable'], flutter: ['a read-only m.TextField that opens m.showDatePicker'] },
  examples: [{ label: 'Delivery date', value: '', min: '2026-10-01' }],
});
