import type { ReactNode, KeyboardEvent, MouseEvent } from 'react';
import { tokens, sp } from './tokens';
export interface CardProps { padding?: '0' | '2' | '3' | '4' | '5'; pressable?: boolean; selected?: boolean; onPress?: () => void; children?: ReactNode }
export function Card({ padding = '4', pressable = false, selected = false, onPress, children }: CardProps) {
  const fire = (e: MouseEvent | KeyboardEvent) => {
    // nested interactive elements (Buttons) must not trigger the card press
    if ((e.target as HTMLElement).closest('button, a, input, select') !== e.currentTarget && (e.target as HTMLElement).closest('button, a, input, select')) return;
    if (pressable) onPress?.();
  };
  return (
    <div role={pressable ? 'button' : undefined} tabIndex={pressable ? 0 : undefined}
      onClick={fire} onKeyDown={(e) => { if (pressable && (e.key === 'Enter' || e.key === ' ')) { e.preventDefault(); fire(e); } }}
      style={{ background: tokens.color.surface, border: `1px solid ${selected ? tokens.color.primary : '#E5E7EB'}`, borderRadius: tokens.radius.lg, padding: sp(padding), cursor: pressable ? 'pointer' : undefined, height: '100%', boxSizing: 'border-box' }}>
      {children}
    </div>
  );
}
