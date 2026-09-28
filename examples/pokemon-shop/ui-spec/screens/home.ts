import { defineScreen } from '@himz-genui/core';

export default defineScreen({
  // What does the user see here?
  shows: [
    'Top bar with the shop name and a cart action showing how many items are in the cart',
    'Search box and a set filter side by side',
    'Responsive grid of cards: image, name, set, rarity badge, condition, price, add-to-cart button',
    'Pagination below the grid',
  ],

  // What can the user do here that does NOT change screen?
  local: {
    search: 'search cards by name',
    filterSet: 'show only one card set',
    changePage: 'go to another page of results',
    addToCart: 'add one copy of a card to the cart',
  },

  // Special cases
  when: {
    'card out of stock': 'show an out-of-stock badge and disable its add-to-cart button',
    'nothing matches': 'show an empty state that clears the search',
  },

  // Which data does the screen receive? Types come from domain.ts
  data: { cards: 'Card[]', sets: 'CardSet[]', cartCount: 'number', page: 'number', pageCount: 'number', query: 'string' },

  // Where can the user go from here, and how?
  goTo: {
    CardDetail: 'tap a card',
    Cart: 'press the cart action in the top bar',
  },
});
