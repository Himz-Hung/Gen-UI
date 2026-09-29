// expect: pass
import { create } from 'zustand';
import { useQuery } from '@tanstack/react-query';
import { useSelector } from 'react-redux';
import { Button } from '../../ui/Button';
const useCart = create(() => ({ count: 0 }));
export function StateHooks() {
  const count = useCart((s) => s.count);
  const { data } = useQuery({ queryKey: ['x'], queryFn: () => 1 });
  const user = useSelector((s: { user: string }) => s.user);
  return <Button label={`${count} ${data} ${user}`} />;
}
