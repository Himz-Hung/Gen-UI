import type { ReactNode } from 'react';
import { sp } from './tokens';
export interface StackProps { gap?: '0' | '1' | '2' | '3' | '4' | '5' | '6' | '7'; align?: 'start' | 'center' | 'end' | 'stretch'; children?: ReactNode }
export function Stack({ gap = '3', align = 'stretch', children }: StackProps) {
  return <div style={{ display: 'flex', flexDirection: 'column', gap: sp(gap), alignItems: align === 'stretch' ? 'stretch' : `flex-${align}`.replace('flex-center', 'center') }}>{children}</div>;
}
