import { defineStrings } from '@himz-genui/core';

export default defineStrings({
  shop: { name: 'PokéCards Shop' },
  nav: { cart: 'Giỏ hàng ({count})' },
  common: {
    addToCart: 'Thêm vào giỏ',
    outOfStock: 'Hết hàng',
    continueShopping: 'Tiếp tục mua sắm',
    subtotal: 'Tạm tính',
    itemsOne: '1 món',
    itemsMany: '{count} món',
  },
  home: {
    search: 'Tìm thẻ',
    set: 'Bộ thẻ',
    allSets: 'Tất cả bộ',
    empty: { title: 'Không có thẻ nào khớp', description: 'Thử tên khác hoặc bỏ lọc bộ thẻ.', action: 'Xoá tìm kiếm' },
  },
  detail: {
    price: 'Giá',
    quantity: 'Số lượng',
    inStock: 'Còn {count} thẻ',
    imageAlt: 'Thẻ {name}',
  },
  cart: {
    title: 'Giỏ hàng của bạn',
    empty: { title: 'Giỏ hàng trống', description: 'Thẻ bạn thêm vào sẽ hiện ở đây.' },
    line: '{set} · {condition} · {price} mỗi thẻ',
    oneLess: 'Bớt một {name}',
    oneMore: 'Thêm một {name}',
    remove: 'Xoá {name}',
    checkout: 'Thanh toán',
  },
  checkout: {
    title: 'Thanh toán',
    email: 'Email',
    emailInvalid: 'Nhập địa chỉ email hợp lệ',
    address: 'Địa chỉ giao hàng',
    placeOrder: 'Đặt hàng',
  },
  order: {
    placed: 'Đã đặt hàng',
    summary: 'Đơn {id} · {total}',
    thanks: 'Cảm ơn bạn!',
    receipt: 'Hoá đơn đã được gửi tới {email}.',
  },
});
