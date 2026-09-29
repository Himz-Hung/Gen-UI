import 'package:flutter/material.dart';
import 'tokens.g.dart';

enum UiGridGap { v0, v1, v2, v3, v4, v5, v6, v7 }

class UiGrid extends StatelessWidget {
  const UiGrid({super.key, this.minItemWidth = 220.0, this.gap = UiGridGap.v4, this.children = const []});

  final double minItemWidth;
  final UiGridGap gap;
  final List<Widget> children;

  int get _step => switch (gap) {
        UiGridGap.v0 => 0,
        UiGridGap.v1 => 1,
        UiGridGap.v2 => 2,
        UiGridGap.v3 => 3,
        UiGridGap.v4 => 4,
        UiGridGap.v5 => 5,
        UiGridGap.v6 => 6,
        UiGridGap.v7 => 7,
      };

  @override
  Widget build(BuildContext context) {
    if (children.isEmpty) return const SizedBox.shrink();
    final gapSize = UiTokens.space(_step);
    return LayoutBuilder(builder: (context, constraints) {
      final width = constraints.maxWidth.isFinite ? constraints.maxWidth : minItemWidth;
      // Column count = floor(availableWidth / minItemWidth), minimum 1. Never a fixed column count.
      final columns = ((width + gapSize) / (minItemWidth + gapSize)).floor().clamp(1, children.length);
      final rows = <Widget>[];
      for (var i = 0; i < children.length; i += columns) {
        final rowItems = children.sublist(i, (i + columns).clamp(0, children.length));
        if (rows.isNotEmpty) rows.add(SizedBox(height: gapSize));
        rows.add(IntrinsicHeight(
          child: Row(
            crossAxisAlignment: CrossAxisAlignment.stretch,
            children: [
              for (var j = 0; j < columns; j++) ...[
                if (j > 0) SizedBox(width: gapSize),
                // Cells in a row share height (IntrinsicHeight) and equal width (Expanded).
                Expanded(child: j < rowItems.length ? rowItems[j] : const SizedBox.shrink()),
              ],
            ],
          ),
        ));
      }
      return Column(mainAxisSize: MainAxisSize.min, crossAxisAlignment: CrossAxisAlignment.stretch, children: rows);
    });
  }
}
