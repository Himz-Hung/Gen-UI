import { defineComponent, t } from '@himz-genui/core';
export default defineComponent({
  name: 'Tag', category: 'data',
  purpose: 'Removable chip, e.g. an active filter. For non-interactive labels use Badge.',
  props: { label: t.string(), removable: t.boolean().def(true) },
  events: { remove: t.void() },
  rules: ['removable=true shows a remove control with an accessible name "Remove <label>".', 'Height 28, radius tokens.radius.full.'],
});
