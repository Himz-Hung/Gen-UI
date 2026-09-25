import { defineComponent, t } from '@genui/core';
export default defineComponent({
  name: 'Heading', category: 'typography',
  purpose: 'Section or page title. Level is semantic (document outline), size is visual.',
  props: {
    value: t.string(),
    level: t.enum(['1', '2', '3', '4']).def('2').desc('semantic level; exactly one level 1 per screen'),
    size: t.enum(['sm', 'md', 'lg', 'xl']).opt().desc('defaults follow level: 1→xl, 2→lg, 3→md, 4→sm'),
  },
  rules: ['Uses tokens.font.heading, weight bold.', 'level controls semantics only; size controls appearance only.'],
  a11y: ['Exposed as a heading of the given level.'],
  platform: { react: ['render h1..h4 by level'], flutter: ['Semantics(header: true)'] },
});
