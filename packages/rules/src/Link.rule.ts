import { defineComponent, t } from '@himz-genui/core';
export default defineComponent({
  name: 'Link', category: 'action',
  purpose: 'Navigates to another screen. Not for actions that change data — use Button.',
  props: {
    label: t.string(),
    variant: t.enum(['inline', 'standalone']).def('inline').desc('inline sits in running text; standalone is a block-level nav item'),
  },
  events: { press: t.void().desc('the flow decides where it goes; the component never knows a route') },
  states: ['default', 'hover', 'focused', 'visited'],
  rules: ['inline variant is underlined or clearly distinct from surrounding text by more than color alone.', 'Color tokens.color.primary.'],
  a11y: ['Role link.', 'Visible focus ring.'],
  composition: { cannotBeInside: ['Button', 'Link'] },
  platform: { react: ['use <a> (router Link) so middle-click and open-in-new-tab work'] },
});
