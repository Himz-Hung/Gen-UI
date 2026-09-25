import { defineScreen } from '@genui/core';

export default defineScreen({
  name: 'Cart',
  purpose: 'Review items, change quantities, remove, and proceed to checkout.',
  data: { cart: 'Cart' },
  actions: ['openCard', 'changeQty', 'removeItem', 'checkout', 'continueShopping'],
  needs: [
    'Top bar with back',
    'List of items: thumbnail, name, condition, quantity, line total, remove',
    'Subtotal and a checkout button; checkout disabled when the cart is empty',
    'Empty state with a continue-shopping action',
  ],
});
