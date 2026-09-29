import 'package:flutter/material.dart';
import 'tokens.g.dart';

enum UiSpacerSize { v1, v2, v3, v4, v5, v6, v7 }

class UiSpacer extends StatelessWidget {
  const UiSpacer({super.key, this.size = UiSpacerSize.v3, this.grow = false});

  final UiSpacerSize size;
  final bool grow;

  int get _step => switch (size) {
        UiSpacerSize.v1 => 1,
        UiSpacerSize.v2 => 2,
        UiSpacerSize.v3 => 3,
        UiSpacerSize.v4 => 4,
        UiSpacerSize.v5 => 5,
        UiSpacerSize.v6 => 6,
        UiSpacerSize.v7 => 7,
      };

  @override
  Widget build(BuildContext context) {
    // Renders nothing visible.
    final box = SizedBox(width: UiTokens.space(_step), height: UiTokens.space(_step));
    // grow=true takes all remaining space along the parent axis (requires a Flex ancestor, e.g. Inline).
    return grow ? Expanded(child: box) : box;
  }
}
