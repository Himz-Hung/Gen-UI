import type { ReactNode } from 'react';
import { sp } from './tokens';
export interface GridProps { minItemWidth?: number; gap?: '0' | '1' | '2' | '3' | '4' | '5' | '6' | '7'; children?: ReactNode }
export function Grid({ minItemWidth = 220, gap = '4', children }: GridProps) {
  return <div style={{ display: 'grid', gridTemplateColumns: `repeat(auto-fill, minmax(min(${minItemWidth}px, 100%), 1fr))`, gap: sp(gap), alignItems: 'stretch' }}>{children}</div>;
}
