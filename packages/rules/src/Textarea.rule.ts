import { defineComponent, t } from '@himz-genui/core';
export default defineComponent({
  name: 'Textarea', category: 'input',
  purpose: 'Multi-line text entry: notes, messages, addresses. For one line use Input.',
  props: {
    label: t.text(),
    value: t.string(),
    placeholder: t.text().opt(),
    rows: t.number().int().def(3).desc('visible lines before it scrolls or grows'),
    autoGrow: t.boolean().def(false).desc('grow with the content up to 10 lines'),
    maxLength: t.number().int().opt(),
    hint: t.text().opt(),
    error: t.text().opt(),
    disabled: t.boolean().def(false),
    required: t.boolean().def(false),
  },
  events: { change: t.string().desc('new value on every keystroke') },
  states: ['default', 'focused', 'disabled', 'error'],
  rules: [
    'Same label, hint, error and required behaviour as Input.',
    'maxLength shows a counter "used / max" below the field and stops input at the limit.',
    'Enter inserts a new line; it never submits.',
  ],
  a11y: ['Label programmatically associated; the counter is announced politely when near the limit.'],
  platform: { react: ['<textarea>; autoGrow by resizing to scrollHeight'], flutter: ['m.TextField with minLines: rows, maxLines: autoGrow ? 10 : rows, maxLength'] },
  examples: [{ label: 'Note to seller', rows: 4, maxLength: 300 }],
});
