import { defineScreen } from '@himz-genui/core';

export default defineScreen({
  name: 'CardDetail',
  purpose: 'Show one card large with all details and let the user add it to the cart.',
  data: { card: 'Card', cartCount: 'number', qty: 'number' },
  actions: ['goBack', 'openCart', 'addToCart', 'changeQty'],
  needs: [
    'Top bar with back and cart action',
    'Large card image on the left, details on the right; stacked on narrow screens',
    'Name, set and year, rarity, condition, price, stock',
    'Quantity select limited by stock and an add-to-cart button',
  ],
});
