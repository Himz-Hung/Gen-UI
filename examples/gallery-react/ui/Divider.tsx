import { tokens } from './tokens';
export interface DividerProps { orientation?: 'horizontal' | 'vertical' }
export function Divider({ orientation = 'horizontal' }: DividerProps) {
  const h = orientation === 'horizontal';
  return <div aria-hidden style={{ background: tokens.color.muted, opacity: 0.3, width: h ? '100%' : 1, height: h ? 1 : '100%', alignSelf: 'stretch' }} />;
}
