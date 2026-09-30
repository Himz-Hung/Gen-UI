import 'package:flutter/material.dart';
import 'icons.dart';
import 'theme.g.dart';

enum UiIconSize { xs, sm, md, lg, xl }

enum UiIconColor { inherit, primary, muted, success, warning, danger }

class UiIcon extends StatelessWidget {
  const UiIcon({super.key, required this.name, this.size = UiIconSize.md, this.color = UiIconColor.inherit, this.label});

  final String name;
  final UiIconSize size;
  final UiIconColor color;
  final String? label;

  double get _size => switch (size) {
        UiIconSize.xs => 12,
        UiIconSize.sm => 16,
        UiIconSize.md => 20,
        UiIconSize.lg => 24,
        UiIconSize.xl => 32,
      };

  Color? _color(BuildContext context) => switch (color) {
        UiIconColor.inherit => null,
        UiIconColor.primary => context.ui.color.primary,
        UiIconColor.muted => context.ui.color.muted,
        UiIconColor.success => context.ui.color.success,
        UiIconColor.warning => context.ui.color.warning,
        UiIconColor.danger => context.ui.color.danger,
      };

  @override
  Widget build(BuildContext context) {
    // Square box at the token size so there is no layout shift; unknown names fall back to a neutral placeholder.
    final icon = SizedBox.square(
      dimension: _size,
      child: Icon(uiIconData(name), size: _size, color: _color(context)),
    );
    if (label == null) return ExcludeSemantics(child: icon);
    return Semantics(image: true, label: label, excludeSemantics: true, child: icon);
  }
}
