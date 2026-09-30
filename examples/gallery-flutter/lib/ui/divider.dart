import 'package:flutter/material.dart';
import 'theme.g.dart';

enum UiDividerOrientation { horizontal, vertical }

class UiDivider extends StatelessWidget {
  const UiDivider({super.key, this.orientation = UiDividerOrientation.horizontal});

  final UiDividerOrientation orientation;

  @override
  Widget build(BuildContext context) {
    // 1 logical pixel thick, tokens.color.muted at reduced opacity. Not announced by screen readers.
    final color = context.ui.color.muted.withValues(alpha: 0.3);
    final line = orientation == UiDividerOrientation.horizontal
        ? Divider(color: color, thickness: 1, height: 1)
        : VerticalDivider(color: color, thickness: 1, width: 1);
    return ExcludeSemantics(child: line);
  }
}
