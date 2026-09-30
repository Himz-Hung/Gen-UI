import 'package:flutter/material.dart';
import 'theme.g.dart';
import 'tokens.g.dart';

enum UiCardPadding { v0, v2, v3, v4, v5 }

class UiCard extends StatelessWidget {
  const UiCard({super.key, this.padding = UiCardPadding.v4, this.pressable = false, this.selected = false, this.onPress, this.children = const []});

  final UiCardPadding padding;
  final bool pressable;
  final bool selected;
  final VoidCallback? onPress;
  final List<Widget> children;

  int get _step => switch (padding) { UiCardPadding.v0 => 0, UiCardPadding.v2 => 2, UiCardPadding.v3 => 3, UiCardPadding.v4 => 4, UiCardPadding.v5 => 5 };

  @override
  Widget build(BuildContext context) {
    final shape = RoundedRectangleBorder(
      borderRadius: BorderRadius.circular(UiTokens.radiusLg),
      side: BorderSide(color: selected ? context.ui.color.primary : context.ui.color.muted.withValues(alpha: 0.3), width: selected ? 2 : 1),
    );
    final content = Padding(
      padding: EdgeInsets.all(UiTokens.space(_step)),
      child: Column(crossAxisAlignment: CrossAxisAlignment.stretch, mainAxisSize: MainAxisSize.min, children: children),
    );
    return Material(
      color: context.ui.color.surface,
      shape: shape,
      clipBehavior: Clip.antiAlias,
      // pressable=false: no hover feedback, never emits press.
      child: pressable ? Semantics(button: true, child: InkWell(onTap: onPress, child: content)) : content,
    );
  }
}
