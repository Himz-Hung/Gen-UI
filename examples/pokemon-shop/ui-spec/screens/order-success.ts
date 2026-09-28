import { defineScreen } from '@himz-genui/core';

export default defineScreen({
  shows: [
    'Success alert with the order id and total',
    'Text saying a receipt was sent to the email',
    'Continue shopping button',
  ],
  data: { order: 'Order' },
  params: { orderId: 'string' },
  goTo: {
    Home: { how: 'press Continue shopping', replace: true },
  },
  // The order is placed; going back to checkout would make no sense.
  back: false,
});
