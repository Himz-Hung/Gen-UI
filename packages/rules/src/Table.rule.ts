import { defineComponent, t } from '@himz-genui/core';
export default defineComponent({
  name: 'Table', category: 'data',
  purpose: 'Rows and columns of comparable records (orders, users). For a simple list of things use List.',
  props: {
    columns: t.array(t.object({ key: t.string(), label: t.text(), align: t.enum(['start', 'center', 'end']).opt(), sortable: t.boolean().opt() })),
    rows: t.array(t.object({ id: t.string(), cells: t.array(t.string()).desc('pre-formatted, one per column, in column order') })),
    sortKey: t.string().opt(),
    sortDirection: t.enum(['asc', 'desc']).def('asc'),
    emptyText: t.text().opt().desc('shown in place of the rows when there are none'),
    dense: t.boolean().def(false),
    pressableRows: t.boolean().def(false),
    loading: t.boolean().def(false).desc('rows are being fetched'),
  },
  events: { sort: t.string().desc('key of the column pressed; the screen decides the new order'), rowPress: t.string().desc('id of the row') },
  states: ['default', 'empty', 'loading'],
  rules: [
    'The header row stays visible while the body scrolls; on narrow screens the table scrolls sideways, never squeezes.',
    'Numbers and money align end; the component never sorts or formats by itself.',
    'The sorted column shows its direction with an icon, not color alone.',
    'Row height 48 (dense 36); rows separated by 1px lines.',
    'loading=true keeps the header and shows three placeholder rows (like Skeleton) in place of the body; rows and emptyText are not shown.',
  ],
  a11y: ['Real table semantics: header cells, aria-sort on the sorted column; pressable rows are focusable and activate with Enter.'],
  composition: { canContain: [] },
  platform: { react: ['<table> with <thead>/<tbody>; overflow-x auto wrapper'], flutter: ['m.DataTable inside a horizontal m.SingleChildScrollView'] },
  examples: [{ columns: [{ key: 'id', label: 'Order' }, { key: 'total', label: 'Total', align: 'end', sortable: true }], rows: [{ id: 'A-1001', cells: ['A-1001', '$42.00'] }] }],
});
