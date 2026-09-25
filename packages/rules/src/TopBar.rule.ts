import { defineComponent, t } from '@himz-genui/core';
export default defineComponent({
  name: 'TopBar', category: 'navigation',
  purpose: 'Screen header: title, optional back control, optional actions. One per screen, first child of the Container or root.',
  props: {
    title: t.string(),
    showBack: t.boolean().def(false),
    actions: t.array(t.object({ icon: t.string(), label: t.string(), action: t.string() })).def([]).desc('each renders as an IconButton; action is the action name emitted through the actionPress event'),
  },
  events: { back: t.void(), actionPress: t.string().desc('action name from the actions prop') },
  rules: ['Height 56 logical pixels; sticks to the top while scrolling.', 'Title truncates on one line.', 'showBack=true shows a back control at the start that emits back.'],
  a11y: ['Landmark banner/header; back control labelled "Back".'],
  composition: { canContain: [] },
});
