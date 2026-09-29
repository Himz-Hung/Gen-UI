import { defineComponent, t } from '@himz-genui/core';
export default defineComponent({
  name: 'SiteFooter', category: 'navigation',
  purpose: 'The footer shared by every page: columns of links, contact or social links, and the legal line. It stacks on narrow screens.',
  props: {
    brand: t.text().opt(),
    description: t.text().opt().desc('one or two sentences under the brand'),
    columns: t.array(t.object({ title: t.text(), links: t.array(t.object({ value: t.string(), label: t.text() })) })).def([]),
    social: t.array(t.object({ value: t.string(), label: t.text(), icon: t.string() })).def([]).desc('icon buttons named by label'),
    legal: t.text().opt().desc('e.g. "© 2026 Seaside Stays"'),
  },
  events: { navigate: t.string().desc('value of a pressed link or social button') },
  states: ['wide', 'narrow'],
  rules: [
    'Wide screens: brand and description first, then the columns side by side, social at the end; legal on its own row at the bottom.',
    'Narrow screens: everything stacks; with more than two columns each column collapses under its title (Accordion behaviour).',
    'Background slightly darker than the page (tokens.color.muted at low opacity); link text tokens.color.text, titles bold; every link at least 44 tall.',
  ],
  a11y: ['A contentinfo landmark; each column is a navigation list named by its title; social buttons are named by label.'],
  composition: { canContain: [] },
  platform: { react: ['<footer> with <nav aria-label> per column; <details> for collapsed columns'], flutter: ['a LayoutBuilder switching a Row of columns / a Column with ExpansionTiles'] },
  examples: [{ brand: 'Seaside Stays', columns: [{ title: 'Company', links: [{ value: 'about', label: 'About' }] }, { title: 'Help', links: [{ value: 'faq', label: 'FAQ' }] }], legal: '© 2026 Seaside Stays' }],
});
