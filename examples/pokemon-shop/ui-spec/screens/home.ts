import { defineScreen } from '@himz-genui/core';

export default defineScreen({
  name: 'Home',
  purpose: 'Browse and search the card catalog, open a card, jump to the cart.',
  data: { cards: 'Card[]', sets: 'CardSet[]', cartCount: 'number', page: 'number', pageCount: 'number', query: 'string' },
  actions: ['openCard', 'openCart', 'search', 'filterSet', 'changePage', 'addToCart'],
  needs: [
    'Top bar with the shop name and a cart action showing how many items are in the cart',
    'Search box and a set filter side by side',
    'Responsive grid of cards: image, name, set, rarity badge, condition, price, add-to-cart button',
    'Out-of-stock cards show a badge and a disabled button',
    'Empty state when nothing matches the search',
    'Pagination below the grid',
  ],
});
