import type { ReactNode } from 'react';
import { sp } from './tokens';
export interface ContainerProps { maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | 'full'; padding?: '0' | '1' | '2' | '3' | '4' | '5' | '6' | '7'; children?: ReactNode }
const W = { sm: 640, md: 768, lg: 1024, xl: 1280, full: undefined } as const;
export function Container({ maxWidth = 'lg', padding = '4', children }: ContainerProps) {
  return <div style={{ maxWidth: W[maxWidth], margin: '0 auto', padding: `0 ${sp(padding)}`, width: '100%', boxSizing: 'border-box' }}>{children}</div>;
}
