import 'package:flutter/material.dart';
import 'tokens.g.dart';

enum UiStackGap { v0, v1, v2, v3, v4, v5, v6, v7 }

enum UiStackAlign { start, center, end, stretch }

class UiStack extends StatelessWidget {
  const UiStack({super.key, this.gap = UiStackGap.v3, this.align = UiStackAlign.stretch, this.children = const []});

  final UiStackGap gap;
  final UiStackAlign align;
  final List<Widget> children;

  int get _step => switch (gap) {
        UiStackGap.v0 => 0,
        UiStackGap.v1 => 1,
        UiStackGap.v2 => 2,
        UiStackGap.v3 => 3,
        UiStackGap.v4 => 4,
        UiStackGap.v5 => 5,
        UiStackGap.v6 => 6,
        UiStackGap.v7 => 7,
      };

  CrossAxisAlignment get _cross => switch (align) {
        UiStackAlign.start => CrossAxisAlignment.start,
        UiStackAlign.center => CrossAxisAlignment.center,
        UiStackAlign.end => CrossAxisAlignment.end,
        UiStackAlign.stretch => CrossAxisAlignment.stretch,
      };

  @override
  Widget build(BuildContext context) {
    if (children.isEmpty) return const SizedBox.shrink();
    final gapSize = UiTokens.space(_step);
    return Column(
      mainAxisSize: MainAxisSize.min,
      crossAxisAlignment: _cross,
      children: [
        for (var i = 0; i < children.length; i++) ...[
          if (i > 0) SizedBox(height: gapSize),
          children[i],
        ],
      ],
    );
  }
}
