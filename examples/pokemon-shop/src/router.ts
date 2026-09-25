// Minimal router implementing ui-spec/flows/shop.ts. Screen names and params come from the flow;
// URL shape is an implementation detail.
import { useEffect, useState } from 'react';

export type Route =
  | { screen: 'Home' }
  | { screen: 'CardDetail'; cardId: string }
  | { screen: 'Cart' }
  | { screen: 'Checkout' }
  | { screen: 'OrderSuccess'; orderId: string };

const toPath = (r: Route): string => {
  switch (r.screen) {
    case 'Home': return '/';
    case 'CardDetail': return `/card/${r.cardId}`;
    case 'Cart': return '/cart';
    case 'Checkout': return '/checkout';
    case 'OrderSuccess': return `/order/${r.orderId}`;
  }
};
const fromPath = (p: string): Route => {
  let m: RegExpMatchArray | null;
  if ((m = p.match(/^\/card\/([^/]+)$/))) return { screen: 'CardDetail', cardId: m[1] };
  if (p === '/cart') return { screen: 'Cart' };
  if (p === '/checkout') return { screen: 'Checkout' };
  if ((m = p.match(/^\/order\/([^/]+)$/))) return { screen: 'OrderSuccess', orderId: m[1] };
  return { screen: 'Home' };
};

export function useRouter() {
  const [route, setRoute] = useState<Route>(() => fromPath(location.pathname));
  useEffect(() => {
    const onPop = () => setRoute(fromPath(location.pathname));
    window.addEventListener('popstate', onPop);
    return () => window.removeEventListener('popstate', onPop);
  }, []);
  const go = (r: Route, mode: 'push' | 'replace' = 'push') => {
    history[mode === 'replace' ? 'replaceState' : 'pushState'](null, '', toPath(r));
    setRoute(r);
    window.scrollTo(0, 0);
  };
  const back = () => history.back();
  return { route, go, back };
}
