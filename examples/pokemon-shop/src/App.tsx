import { useRouter } from './router';
import { useStore, selectCart } from './store';
import { CARDS } from './data';
import { HomeScreen } from './screens/HomeScreen';
import { CardDetailScreen } from './screens/CardDetailScreen';
import { CartScreen } from './screens/CartScreen';
import { CheckoutScreen } from './screens/CheckoutScreen';
import { OrderSuccessScreen } from './screens/OrderSuccessScreen';

export function App() {
  const { route, go, back } = useRouter();
  const lines = useStore((s) => s.lines);
  const cart = selectCart(lines);

  // Flow: ui-spec/flows/shop.ts. Guards are hand-written here.
  const requireCartNotEmpty = () => cart.items.length > 0;

  switch (route.screen) {
    case 'Home':
      return <HomeScreen cartCount={cart.count} onOpenCard={(id) => go({ screen: 'CardDetail', cardId: id })} onOpenCart={() => go({ screen: 'Cart' })} />;
    case 'CardDetail': {
      const card = CARDS.find((c) => c.id === route.cardId);
      if (!card) { go({ screen: 'Home' }, 'replace'); return null; }
      return <CardDetailScreen card={card} cartCount={cart.count} onGoBack={back} onOpenCart={() => go({ screen: 'Cart' })} />;
    }
    case 'Cart':
      return <CartScreen cart={cart} onOpenCard={(id) => go({ screen: 'CardDetail', cardId: id })} onCheckout={() => { if (requireCartNotEmpty()) go({ screen: 'Checkout' }); }} onContinueShopping={() => go({ screen: 'Home' }, 'replace')} />;
    case 'Checkout':
      if (!requireCartNotEmpty()) { go({ screen: 'Cart' }, 'replace'); return null; }
      return <CheckoutScreen cart={cart} onGoBack={back} onPlaced={(orderId) => go({ screen: 'OrderSuccess', orderId }, 'replace')} />;
    case 'OrderSuccess':
      return <OrderSuccessScreen onContinueShopping={() => go({ screen: 'Home' }, 'replace')} />;
  }
}
