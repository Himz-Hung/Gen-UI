import 'package:flutter/material.dart';
import 'theme.g.dart';
import 'tokens.g.dart';

class UiTableColumn {
  const UiTableColumn({required this.key, required this.label, this.align, this.sortable});
  final String key;
  final String label;
  final UiTableAlign? align;
  final bool? sortable;
}

enum UiTableAlign { start, center, end }

class UiTableRow {
  const UiTableRow({required this.id, required this.cells});
  final String id;
  final List<String> cells;
}

enum UiTableSortDirection { asc, desc }

class UiTable extends StatelessWidget {
  const UiTable({super.key, required this.columns, required this.rows, this.sortKey, this.sortDirection = UiTableSortDirection.asc, this.emptyText, this.dense = false, this.pressableRows = false, this.loading = false, this.onSort, this.onRowPress});

  final List<UiTableColumn> columns;
  final List<UiTableRow> rows;
  final String? sortKey;
  final UiTableSortDirection sortDirection;
  final String? emptyText;
  final bool dense;
  final bool pressableRows;
  final bool loading;
  final ValueChanged<String>? onSort;
  final ValueChanged<String>? onRowPress;

  @override
  Widget build(BuildContext context) {
    if (rows.isEmpty && !loading) {
      return Semantics(
        label: emptyText,
        child: Padding(
          padding: EdgeInsets.all(UiTokens.space(5)),
          child: Center(
            child: Text(emptyText ?? '', style: TextStyle(color: context.ui.color.muted)),
          ),
        ),
      );
    }

    final sortIndex = sortKey == null ? -1 : columns.indexWhere((c) => c.key == sortKey);
    final rowHeight = dense ? 36.0 : 48.0;

    // The sorted column shows an icon for its direction, never color alone; header stays visible above a scrollable body.
    return SingleChildScrollView(
      scrollDirection: Axis.horizontal,
      child: DataTable(
        showCheckboxColumn: false,
        dividerThickness: 1,
        dataRowMinHeight: rowHeight,
        dataRowMaxHeight: rowHeight,
        headingRowHeight: rowHeight,
        sortColumnIndex: sortIndex == -1 ? null : sortIndex,
        sortAscending: sortDirection == UiTableSortDirection.asc,
        columns: [
          for (final c in columns)
            DataColumn(
              label: Text(c.label, style: const TextStyle(fontWeight: FontWeight.w600)),
              numeric: c.align == UiTableAlign.end,
              onSort: c.sortable == true && onSort != null ? (i, _) => onSort!.call(c.key) : null,
            ),
        ],
        rows: loading
            // loading: the header stays, three placeholder rows replace the body.
            ? [
                for (var n = 0; n < 3; n++)
                  DataRow(cells: [
                    for (var i = 0; i < columns.length; i++)
                      DataCell(ExcludeSemantics(child: Container(width: 64, height: 12, decoration: BoxDecoration(color: context.ui.color.muted.withValues(alpha: 0.15), borderRadius: BorderRadius.circular(UiTokens.radiusSm))))),
                  ]),
              ]
            : [
          for (final r in rows)
            DataRow(
              onSelectChanged: pressableRows && onRowPress != null ? (_) => onRowPress!.call(r.id) : null,
              cells: [
                for (var i = 0; i < columns.length; i++)
                  DataCell(Text(i < r.cells.length ? r.cells[i] : '')),
              ],
            ),
        ],
      ),
    );
  }
}
