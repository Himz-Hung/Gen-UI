import { defineScreen } from '@himz-genui/core';

export default defineScreen({
  name: 'OrderSuccess',
  purpose: 'Confirm the order and send the user back to shopping.',
  data: { order: 'Order' },
  actions: ['continueShopping'],
  needs: ['Success alert with the order id and total', 'Text saying a receipt was sent to the email', 'Continue shopping button'],
});
