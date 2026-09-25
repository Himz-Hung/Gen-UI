import { defineFlow } from '@himz-genui/core';

export default defineFlow({
  name: 'Shop',
  entry: 'Home',
  screens: {
    Home: {
      on: {
        openCard: { go: 'CardDetail', params: { cardId: 'string' } },
        openCart: { go: 'Cart' },
      },
    },
    CardDetail: {
      params: { cardId: 'string' },
      back: 'Home',
      on: {
        openCart: { go: 'Cart' },
        goBack: { back: true },
      },
    },
    Cart: {
      back: 'Home',
      on: {
        checkout: { go: 'Checkout' },
        continueShopping: { go: 'Home', mode: 'replace' },
        openCard: { go: 'CardDetail', params: { cardId: 'string' } },
      },
    },
    Checkout: {
      guard: 'requireCartNotEmpty',
      back: 'Cart',
      on: {
        placeOrder: { go: 'OrderSuccess', mode: 'replace', params: { orderId: 'string' } },
        goBack: { back: true },
      },
    },
    OrderSuccess: {
      params: { orderId: 'string' },
      on: { continueShopping: { go: 'Home', mode: 'replace' } },
    },
  },
});
