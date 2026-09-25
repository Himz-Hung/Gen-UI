import { defineComponent, t } from '@genui/core';
export default defineComponent({
  name: 'Spacer', category: 'layout',
  purpose: 'Empty space. Inside Inline with justify=start it pushes following siblings to the far end when grow is true.',
  props: { size: t.enum(['1', '2', '3', '4', '5', '6', '7']).def('3'), grow: t.boolean().def(false) },
  rules: ['Renders nothing visible.', 'grow=true takes all remaining space along the parent axis.'],
});
