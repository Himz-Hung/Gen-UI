import 'package:flutter/material.dart';
import 'tokens.g.dart';

class UiList extends StatelessWidget {
  const UiList({super.key, this.dense = false, this.children = const []});

  final bool dense;
  final List<Widget> children;

  @override
  Widget build(BuildContext context) {
    // Rows separated by a 1px divider; no divider after the last row.
    final divider = Divider(height: 1, thickness: 1, color: UiTokens.colorMuted.withValues(alpha: 0.2));
    final rows = <Widget>[];
    for (var i = 0; i < children.length; i++) {
      rows.add(children[i]);
      if (i != children.length - 1) rows.add(divider);
    }
    return Semantics(
      container: true,
      child: ListTileTheme.merge(
        dense: dense,
        child: Column(mainAxisSize: MainAxisSize.min, children: rows),
      ),
    );
  }
}
