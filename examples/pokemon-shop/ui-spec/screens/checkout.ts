import { defineScreen } from '@genui/core';

export default defineScreen({
  name: 'Checkout',
  purpose: 'Collect email and shipping address, show the order summary, place the order.',
  data: { cart: 'Cart', email: 'string', address: 'string', emailError: 'string', submitting: 'boolean' },
  actions: ['goBack', 'changeEmail', 'changeAddress', 'placeOrder'],
  needs: ['Top bar with back', 'Form: email (validated), address', 'Order summary with subtotal', 'Place order button with loading state'],
});
