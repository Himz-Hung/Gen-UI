import { defineScreen } from '@himz-genui/core';

export default defineScreen({
  shows: [
    'Top bar with back',
    'Form: email, shipping address',
    'Order summary with the subtotal',
    'Place order button',
  ],
  local: {
    changeEmail: 'type the email',
    changeAddress: 'type the shipping address',
  },
  when: {
    'email is invalid': 'show the error under the email field',
    submitting: 'the place order button shows loading',
  },
  data: { cart: 'Cart', email: 'string', address: 'string', emailError: 'string', submitting: 'boolean' },
  goTo: {
    OrderSuccess: { how: 'press Place order', action: 'placeOrder', replace: true },
  },
  back: 'Cart',
  guard: 'requireCartNotEmpty',
});
