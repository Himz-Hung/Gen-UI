import { Children, Fragment, type ReactNode } from 'react';
export interface ListProps { dense?: boolean; children?: ReactNode }
export function List({ dense = false, children }: ListProps) {
  const rows = Children.toArray(children);
  return (
    <ul role="list" data-dense={dense || undefined} style={{ listStyle: 'none', margin: 0, padding: 0 }}>
      {rows.map((row, i) => <Fragment key={i}>{row}{i < rows.length - 1 && <li aria-hidden style={{ height: 1, background: '#E5E7EB' }} />}</Fragment>)}
    </ul>
  );
}
