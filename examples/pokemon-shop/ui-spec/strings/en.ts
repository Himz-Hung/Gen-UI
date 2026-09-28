import { defineStrings } from '@himz-genui/core';

export default defineStrings({
  shop: { name: 'PokéCards Shop' },
  nav: { cart: 'Cart ({count})' },
  common: {
    addToCart: 'Add to cart',
    outOfStock: 'Out of stock',
    continueShopping: 'Continue shopping',
    subtotal: 'Subtotal',
    itemsOne: '1 item',
    itemsMany: '{count} items',
  },
  home: {
    search: 'Search cards',
    set: 'Set',
    allSets: 'All sets',
    empty: { title: 'No cards match', description: 'Try another name or clear the set filter.', action: 'Clear search' },
  },
  detail: {
    price: 'Price',
    quantity: 'Quantity',
    inStock: '{count} in stock',
    imageAlt: '{name} card',
  },
  cart: {
    title: 'Your cart',
    empty: { title: 'Your cart is empty', description: 'Cards you add will show up here.' },
    line: '{set} · {condition} · {price} each',
    oneLess: 'One less {name}',
    oneMore: 'One more {name}',
    remove: 'Remove {name}',
    checkout: 'Checkout',
  },
  checkout: {
    title: 'Checkout',
    email: 'Email',
    emailInvalid: 'Enter a valid email address',
    address: 'Shipping address',
    placeOrder: 'Place order',
  },
  order: {
    placed: 'Order placed',
    summary: 'Order {id} · {total}',
    thanks: 'Thank you!',
    receipt: 'A receipt was sent to {email}.',
  },
});
