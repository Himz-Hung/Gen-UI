// expect: pass
import { Navigate, useNavigate } from 'react-router';
import { Button } from '../../ui/Button';
export function Router({ signedIn }: { signedIn: boolean }) {
  const go = useNavigate();
  if (!signedIn) return <Navigate to="/login" />;
  return <Button label="Cart" onPress={() => go('/cart')} />;
}
