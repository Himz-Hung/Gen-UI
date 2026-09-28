import { defineScreen } from '@himz-genui/core';

export default defineScreen({
  shows: [
    'Top bar with back',
    'Each item: thumbnail, name, condition, quantity, line total, remove',
    'Subtotal and a checkout button',
  ],
  local: {
    changeQty: 'change the quantity of an item',
    removeItem: 'remove an item',
  },
  when: {
    'cart is empty': 'show an empty state with "Continue shopping"; checkout is disabled',
  },
  data: { cart: 'Cart' },
  goTo: {
    CardDetail: 'tap an item',
    Checkout: 'press Checkout',
    Home: { how: 'press Continue shopping', replace: true },
  },
});
