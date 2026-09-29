import 'package:flutter/material.dart';
import 'tokens.g.dart';

class UiDescriptionListItem {
  const UiDescriptionListItem({required this.label, required this.value});
  final String label;
  final String value;
}

enum UiDescriptionListLayout { inline, stacked }

enum UiDescriptionListColumns { v1, v2 }

class UiDescriptionList extends StatelessWidget {
  const UiDescriptionList({super.key, required this.items, this.layout = UiDescriptionListLayout.inline, this.columns = UiDescriptionListColumns.v1});

  final List<UiDescriptionListItem> items;
  final UiDescriptionListLayout layout;
  final UiDescriptionListColumns columns;

  Widget _stacked(UiDescriptionListItem item) {
    return Padding(
      padding: EdgeInsets.symmetric(vertical: UiTokens.space(1)),
      child: MergeSemantics(
        child: Column(crossAxisAlignment: CrossAxisAlignment.start, mainAxisSize: MainAxisSize.min, children: [
          Text(item.label, style: const TextStyle(color: UiTokens.colorMuted, fontSize: 13)),
          SizedBox(height: UiTokens.space(1) / 2),
          Text(item.value, style: const TextStyle(color: UiTokens.colorText)),
        ]),
      ),
    );
  }

  // One Table per column group so every row's label column shares the same width and every
  // value lands in one aligned column, per "inline layout aligns all values to one column".
  Widget _inlineGroup(List<UiDescriptionListItem> group) {
    return Table(
      columnWidths: const {0: IntrinsicColumnWidth(), 1: FlexColumnWidth()},
      defaultVerticalAlignment: TableCellVerticalAlignment.top,
      children: [
        for (final item in group)
          TableRow(children: [
            Padding(
              padding: EdgeInsets.only(right: UiTokens.space(3), top: UiTokens.space(1), bottom: UiTokens.space(1)),
              child: Semantics(
                label: '${item.label}, ${item.value}',
                excludeSemantics: true,
                child: Text(item.label, style: const TextStyle(color: UiTokens.colorMuted, fontSize: 13)),
              ),
            ),
            Padding(
              padding: EdgeInsets.symmetric(vertical: UiTokens.space(1)),
              child: ExcludeSemantics(
                child: Text(item.value, style: const TextStyle(color: UiTokens.colorText)),
              ),
            ),
          ]),
      ],
    );
  }

  @override
  Widget build(BuildContext context) {
    return LayoutBuilder(builder: (context, constraints) {
      // On narrow screens columns=2 falls back to 1, and inline may fall back to stacked.
      final narrow = constraints.maxWidth < 480;
      final effectiveColumns = narrow ? 1 : (columns == UiDescriptionListColumns.v2 ? 2 : 1);
      final stacked = narrow || layout == UiDescriptionListLayout.stacked;

      Widget group(List<UiDescriptionListItem> g) => stacked
          ? Column(crossAxisAlignment: CrossAxisAlignment.stretch, mainAxisSize: MainAxisSize.min, children: [for (final item in g) _stacked(item)])
          : _inlineGroup(g);

      Widget list;
      if (effectiveColumns == 2) {
        final mid = (items.length / 2).ceil();
        final left = items.sublist(0, mid);
        final right = items.sublist(mid);
        list = Row(crossAxisAlignment: CrossAxisAlignment.start, children: [
          Expanded(child: group(left)),
          SizedBox(width: UiTokens.space(5)),
          Expanded(child: group(right)),
        ]);
      } else {
        list = group(items);
      }

      return Semantics(container: true, child: list);
    });
  }
}
