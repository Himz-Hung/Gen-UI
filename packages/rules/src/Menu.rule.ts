import { defineComponent, t } from '@himz-genui/core';
export default defineComponent({
  name: 'Menu', category: 'overlay',
  purpose: 'A short list of actions opened from a button ("⋯" more actions). For choosing a value use Select.',
  props: {
    label: t.text().desc('accessible name of the menu, e.g. "Card actions"'),
    items: t.array(t.object({ value: t.string(), label: t.text(), icon: t.string().opt(), danger: t.boolean().opt(), disabled: t.boolean().opt() })),
    align: t.enum(['start', 'end']).def('start').desc('which edge of the trigger the menu lines up with'),
  },
  events: { select: t.string().desc('value of the chosen item') },
  children: true,
  states: ['closed', 'open'],
  rules: [
    'The single child is the trigger; pressing it opens the menu below (above when there is no room).',
    'Choosing an item emits select and closes the menu; Escape or pressing outside closes it without selecting.',
    'danger items use tokens.color.danger text and come last.',
  ],
  a11y: ['Roles menu / menuitem; arrow keys move, Enter chooses, Escape closes and returns focus to the trigger.'],
  composition: { canContain: ['Button', 'IconButton'] },
  platform: { react: ['trigger gets aria-haspopup="menu" and aria-expanded'], flutter: ['m.MenuAnchor or m.PopupMenuButton around the trigger'] },
  examples: [{ label: 'Card actions', items: [{ value: 'share', label: 'Share', icon: 'share' }, { value: 'delete', label: 'Delete', icon: 'trash', danger: true }] }],
});
