import type { ReactNode } from 'react';
import { sp } from './tokens';
export interface InlineProps { gap?: '0' | '1' | '2' | '3' | '4' | '5' | '6' | '7'; align?: 'start' | 'center' | 'end' | 'baseline'; justify?: 'start' | 'center' | 'end' | 'between'; wrap?: boolean; children?: ReactNode }
const J = { start: 'flex-start', center: 'center', end: 'flex-end', between: 'space-between' } as const;
const A = { start: 'flex-start', center: 'center', end: 'flex-end', baseline: 'baseline' } as const;
export function Inline({ gap = '2', align = 'center', justify = 'start', wrap = true, children }: InlineProps) {
  return <div style={{ display: 'flex', flexDirection: 'row', gap: sp(gap), alignItems: A[align], justifyContent: J[justify], flexWrap: wrap ? 'wrap' : 'nowrap' }}>{children}</div>;
}
