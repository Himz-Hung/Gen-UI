import { defineComponent, t } from '@himz-genui/core';
export default defineComponent({
  name: 'Combobox', category: 'input',
  purpose: 'Type to filter a long list, then pick one option (country, city, card name). For ≤ 15 fixed options use Select.',
  props: {
    label: t.text(),
    value: t.string().desc('value of the chosen option, "" for none'),
    query: t.string().desc('what the user has typed'),
    options: t.array(t.object({ value: t.string(), label: t.text(), description: t.text().opt() })).desc('already filtered for query by the screen'),
    placeholder: t.text().opt(),
    loading: t.boolean().def(false).desc('options are being fetched for query'),
    emptyText: t.text().opt().desc('shown when query is not empty and there are no options'),
    hint: t.text().opt(),
    error: t.text().opt(),
    disabled: t.boolean().def(false),
  },
  events: { search: t.string().desc('query changed; the screen filters or fetches options'), change: t.string().desc('value of the chosen option') },
  states: ['default', 'open', 'loading', 'empty', 'focused', 'disabled', 'error'],
  rules: [
    'The list opens below the field while typing; choosing an option fills the field with its label and closes the list.',
    'The component never filters by itself: options are what the screen passes for the current query.',
    'loading shows a Spinner in the list; emptyText shows when nothing matches.',
    'Same label, hint, error and height as Input.',
  ],
  a11y: ['Combobox pattern: role combobox with aria-expanded and aria-activedescendant; arrow keys move, Enter chooses, Escape closes; the result count is announced.'],
  composition: { canContain: [] },
  checks: [
    { kind: 'neverEmits', event: 'change', props: { disabled: true } },
  ],
  platform: { react: ['<input role="combobox"> + <ul role="listbox"> in a popover'], flutter: ['m.Autocomplete / m.SearchAnchor with options from props'] },
  examples: [{ label: 'Country', value: '', query: 'vi', options: [{ value: 'VN', label: 'Vietnam' }] }],
});
