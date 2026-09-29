import { defineScreen } from '@himz-genui/core';

export default defineScreen({
  shows: [
    'A top bar with the gallery name',
    'One section per category (actions, inputs, data, feedback, navigation) with a few live components each',
  ],
  local: {
    press: 'press a demo button',
    changeName: 'type in the demo input',
    toggleNotify: 'flip the demo switch',
    changeTab: 'switch the demo tab',
  },
  when: {
    'name is empty': 'the demo input shows its hint instead of an error',
  },
  data: { name: 'string', notify: 'boolean', tab: 'string' },
});
