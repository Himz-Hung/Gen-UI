import type { KeyboardEvent } from 'react';
import { tokens, sp } from './tokens';
import { Icon } from './Icon';

export interface TableProps {
  columns: { key: string; label: string; align?: 'start' | 'center' | 'end'; sortable?: boolean }[];
  rows: { id: string; cells: string[] }[];
  sortKey?: string;
  sortDirection?: 'asc' | 'desc';
  emptyText?: string;
  dense?: boolean;
  pressableRows?: boolean;
  loading?: boolean;
  onSort?: (value: string) => void;
  onRowPress?: (value: string) => void;
}

export function Table({
  columns, rows, sortKey, sortDirection = 'asc', emptyText, dense = false,
  pressableRows = false, loading = false, onSort, onRowPress,
}: TableProps) {
  const rowHeight = dense ? 36 : 48;
  const isEmpty = rows.length === 0 && !loading;

  const pressRow = (id: string) => { if (pressableRows) onRowPress?.(id); };
  const onRowKeyDown = (e: KeyboardEvent<HTMLTableRowElement>, id: string) => {
    if (pressableRows && e.key === 'Enter') { e.preventDefault(); pressRow(id); }
  };

  return (
    <div style={{ overflowX: 'auto', width: '100%' }}>
      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead>
          <tr>
            {columns.map((c) => {
              const sorted = c.key === sortKey;
              return (
                <th
                  key={c.key}
                  scope="col"
                  aria-sort={sorted ? (sortDirection === 'asc' ? 'ascending' : 'descending') : undefined}
                  style={{
                    textAlign: c.align ?? 'start', height: rowHeight, boxSizing: 'border-box',
                    borderBottom: `1px solid ${tokens.color.muted}`, padding: `0 ${sp(3)}`,
                  }}
                >
                  {c.sortable ? (
                    <button
                      type="button"
                      onClick={() => onSort?.(c.key)}
                      style={{
                        display: 'inline-flex', alignItems: 'center', gap: sp(1), background: 'none',
                        border: 0, font: 'inherit', fontWeight: 600, color: tokens.color.text, cursor: 'pointer', padding: 0,
                      }}
                    >
                      {c.label}
                      {sorted && <Icon name={sortDirection === 'asc' ? 'sort-asc' : 'sort-desc'} size="xs" color="muted" />}
                    </button>
                  ) : (
                    <span style={{ fontWeight: 600, color: tokens.color.text }}>{c.label}</span>
                  )}
                </th>
              );
            })}
          </tr>
        </thead>
        <tbody>
          {loading ? (
            [0, 1, 2].map((i) => (
              <tr key={i} style={{ height: rowHeight }}>
                {columns.map((c) => (
                  <td key={c.key} aria-hidden style={{ padding: `0 ${sp(3)}` }}>
                    <div style={{ width: 64, height: 12, borderRadius: tokens.radius.sm, background: tokens.color.muted, opacity: 0.15 }} />
                  </td>
                ))}
              </tr>
            ))
          ) : isEmpty ? (
            <tr>
              <td colSpan={columns.length} style={{ padding: sp(5), textAlign: 'center', color: tokens.color.muted }}>
                {emptyText}
              </td>
            </tr>
          ) : (
            rows.map((r) => (
              <tr
                key={r.id}
                tabIndex={pressableRows ? 0 : undefined}
                onClick={() => pressRow(r.id)}
                onKeyDown={(e) => onRowKeyDown(e, r.id)}
                style={{ height: rowHeight, cursor: pressableRows ? 'pointer' : undefined }}
              >
                {r.cells.map((cell, i) => (
                  <td
                    key={i}
                    style={{
                      textAlign: columns[i]?.align ?? 'start', borderBottom: `1px solid ${tokens.color.border}`,
                      padding: `0 ${sp(3)}`, boxSizing: 'border-box',
                    }}
                  >
                    {cell}
                  </td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
