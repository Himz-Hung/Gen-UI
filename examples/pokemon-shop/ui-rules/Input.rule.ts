import { defineComponent, t } from '@genui/core';
export default defineComponent({
  name: 'Input', category: 'input',
  purpose: 'Single-line text entry with label, optional hint and error.',
  props: {
    label: t.string(),
    value: t.string(),
    placeholder: t.string().opt(),
    type: t.enum(['text', 'email', 'password', 'number', 'tel']).def('text'),
    hint: t.string().opt(),
    error: t.string().opt().desc('when present the field is in error state and this text is shown'),
    disabled: t.boolean().def(false),
    required: t.boolean().def(false),
  },
  events: { change: t.string().desc('new value on every keystroke'), submit: t.void().desc('Enter / keyboard done') },
  states: ['default', 'focused', 'disabled', 'error'],
  rules: [
    'Label is always visible above the field — never placeholder-only.',
    'error text replaces hint text; the border turns tokens.color.danger.',
    'required=true shows a marker in the label and sets the required semantic.',
    'Height 40 logical pixels; radius tokens.radius.md.',
  ],
  a11y: ['Label is programmatically associated with the field.', 'error is announced (live region / semantics).'],
  platform: { react: ['use <label for> + <input>', 'aria-invalid and aria-describedby for error'], flutter: ['TextField with InputDecoration'] },
});
