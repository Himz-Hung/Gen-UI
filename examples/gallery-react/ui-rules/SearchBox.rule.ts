import { defineComponent, t } from '@himz-genui/core';
export default defineComponent({
  name: 'SearchBox', category: 'input',
  purpose: 'Text search with a search icon and a clear control. Emits search on submit, not on every keystroke.',
  props: {
    value: t.string(),
    placeholder: t.text().def('Search'),
    loading: t.boolean().def(false),
  },
  events: { change: t.string(), search: t.string().desc('committed query'), clear: t.void() },
  states: ['default', 'focused', 'loading'],
  rules: ['Clear control is visible only when value is non-empty; pressing it empties the field and emits clear.', 'Enter emits search with the current value.', 'loading shows a spinner in place of the search icon.'],
  a11y: ['Role searchbox; clear control has an accessible name.'],
  checks: [
    { kind: 'types', text: 'pika', emits: 'change' },
  ],
  platform: { react: ["<input type=\"search\"> with a clear button"], flutter: ["TextField with a search prefix icon and a clear suffix"] },
});
