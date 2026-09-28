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

  // Navigation: goTo / back in ui-spec/screens/*.ts. Guards are hand-written here.
  const requireCartNotEmpty = () => cart.items.length > 0;

  switch (route.screen) {
    case 'Home':
      return <HomeScreen cartCount={cart.count} onGoCardDetail={(id) => go({ screen: 'CardDetail', cardId: id })} onGoCart={() => go({ screen: 'Cart' })} />;
    case 'CardDetail': {
      const card = CARDS.find((c) => c.id === route.cardId);
      if (!card) { go({ screen: 'Home' }, 'replace'); return null; }
      return <CardDetailScreen card={card} cartCount={cart.count} onGoBack={back} onGoCart={() => go({ screen: 'Cart' })} />;
    }
    case 'Cart':
      return <CartScreen cart={cart} onGoCardDetail={(id) => go({ screen: 'CardDetail', cardId: id })} onGoCheckout={() => { if (requireCartNotEmpty()) go({ screen: 'Checkout' }); }} onGoHome={() => go({ screen: 'Home' }, 'replace')} />;
    case 'Checkout':
      if (!requireCartNotEmpty()) { go({ screen: 'Cart' }, 'replace'); return null; }
      return <CheckoutScreen cart={cart} onGoBack={back} onPlaced={(orderId) => go({ screen: 'OrderSuccess', orderId }, 'replace')} />;
    case 'OrderSuccess':
      return <OrderSuccessScreen onGoHome={() => go({ screen: 'Home' }, 'replace')} />;
  }
}
