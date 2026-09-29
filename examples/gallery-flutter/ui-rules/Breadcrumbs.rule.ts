import { defineComponent, t } from '@himz-genui/core';
export default defineComponent({
  name: 'Breadcrumbs', category: 'navigation',
  purpose: 'Where the current screen sits in a hierarchy (Home › Sets › Base Set). The last item is the current screen.',
  props: {
    items: t.array(t.object({ value: t.string(), label: t.text() })),
  },
  events: { press: t.string().desc('value of a pressed ancestor') },
  rules: [
    'Items separated by a chevron; every item but the last is pressable, the last is plain text in tokens.color.text.',
    'When too long for the width, middle items collapse into "…" which expands on press.',
  ],
  a11y: ['Navigation landmark named "Breadcrumb"; the last item is marked current page.'],
  composition: { canContain: [] },
  checks: [
    { kind: 'emits', event: 'press', target: 'Home', note: 'every item but the last is pressable' },
    { kind: 'neverEmits', event: 'press', target: 'Base Set', props: {}, note: 'the last item is plain text' },
  ],
  platform: { react: ['<nav aria-label="Breadcrumb"><ol>'], flutter: ['a Wrap of m.TextButton and separator Icons'] },
  examples: [{ items: [{ value: 'home', label: 'Home' }, { value: 'sets', label: 'Sets' }, { value: 'base', label: 'Base Set' }] }],
});
