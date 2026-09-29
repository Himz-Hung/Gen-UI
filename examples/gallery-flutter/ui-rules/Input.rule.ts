import { defineComponent, t } from '@himz-genui/core';
export default defineComponent({
  name: 'Input', category: 'input',
  purpose: 'Single-line text entry with label, optional hint and error.',
  props: {
    label: t.text(),
    value: t.string(),
    placeholder: t.text().opt(),
    type: t.enum(['text', 'email', 'password', 'number', 'tel']).def('text'),
    hint: t.text().opt(),
    error: t.text().opt().desc('when present the field is in error state and this text is shown'),
    disabled: t.boolean().def(false),
    required: t.boolean().def(false),
    revealLabel: t.text().opt().desc('type=password: accessible name of the show / hide control, e.g. "Show password"'),
  },
  events: { change: t.string().desc('new value on every keystroke'), submit: t.void().desc('Enter / keyboard done') },
  states: ['default', 'focused', 'disabled', 'error'],
  rules: [
    'Label is always visible above the field — never placeholder-only.',
    'error text replaces hint text; the border turns tokens.color.danger.',
    'required=true shows a marker in the label and sets the required semantic.',
    'Height 40 logical pixels; radius tokens.radius.md.',
    'type=password always has a show / hide control at the end of the field: a toggle named by revealLabel (or the field label when absent) whose pressed state says whether the text is visible; it never submits and keeps focus and cursor in the field.',
  ],
  a11y: ['Label is programmatically associated with the field.', 'error is announced (live region / semantics).'],
  checks: [
    { kind: 'role', role: 'textbox', name: { fromProp: 'label' } },
    { kind: 'neverEmits', event: 'change', props: { disabled: true } },
    { kind: 'types', text: 'ash', emits: 'change' },
  ],
  platform: { react: ['use <label for> + <input>', 'aria-invalid and aria-describedby for error'], flutter: ['TextField with InputDecoration'] },
});
