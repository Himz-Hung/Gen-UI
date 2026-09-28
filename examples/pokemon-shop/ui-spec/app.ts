import { defineApp } from '@himz-genui/core';

// The whole app at a glance. Written first; every other file may only use these names.
export default defineApp({
  name: 'PokéCards Shop',

  screens: {
    Home: 'Browse and search the card catalog, open a card, jump to the cart',
    CardDetail: 'One card large with all details, add it to the cart',
    Cart: 'Review items, change quantities, proceed to checkout',
    Checkout: 'Email and shipping address, order summary, place the order',
    OrderSuccess: 'Confirm the order and go back to shopping',
  },

  components: [
    // layout
    'Container', 'Stack', 'Inline', 'Grid', 'Divider',
    // navigation
    'TopBar', 'Pagination',
    // typography
    'Heading', 'Text',
    // data
    'Card', 'List', 'ListItem', 'Badge', 'Stat',
    // media
    'Image',
    // action
    'Button', 'IconButton',
    // input
    'Input', 'SearchBox', 'Select',
    // feedback
    'Alert', 'EmptyState',
  ],
});
