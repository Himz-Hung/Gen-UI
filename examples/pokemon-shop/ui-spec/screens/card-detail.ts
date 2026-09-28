import { defineScreen } from '@himz-genui/core';

export default defineScreen({
  shows: [
    'Top bar with back and a cart action',
    'Large card image, details beside it',
    'Name, set and year, rarity, condition, price, stock',
    'Quantity select and an add-to-cart button',
  ],
  local: {
    changeQty: 'pick how many copies, limited by stock',
    addToCart: 'add the chosen quantity to the cart',
  },
  when: {
    'narrow screen': 'stack the image above the details',
  },
  data: { card: 'Card', cartCount: 'number', qty: 'string' },
  params: { cardId: 'string' },
  goTo: {
    Cart: 'press the cart action in the top bar',
  },
  // Opened from a shared link there is no previous screen: back goes Home.
  back: 'Home',
});
