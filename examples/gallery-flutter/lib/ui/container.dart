import 'package:flutter/material.dart';
import 'tokens.g.dart';

enum UiContainerMaxWidth { sm, md, lg, xl, full }

enum UiContainerPadding { v0, v1, v2, v3, v4, v5, v6, v7 }

class UiContainer extends StatelessWidget {
  const UiContainer({super.key, this.maxWidth = UiContainerMaxWidth.lg, this.padding = UiContainerPadding.v4, this.children = const []});

  final UiContainerMaxWidth maxWidth;
  final UiContainerPadding padding;
  final List<Widget> children;

  double? get _maxWidth => switch (maxWidth) {
        UiContainerMaxWidth.sm => 640,
        UiContainerMaxWidth.md => 768,
        UiContainerMaxWidth.lg => 1024,
        UiContainerMaxWidth.xl => 1280,
        UiContainerMaxWidth.full => null,
      };

  int get _step => switch (padding) {
        UiContainerPadding.v0 => 0,
        UiContainerPadding.v1 => 1,
        UiContainerPadding.v2 => 2,
        UiContainerPadding.v3 => 3,
        UiContainerPadding.v4 => 4,
        UiContainerPadding.v5 => 5,
        UiContainerPadding.v6 => 6,
        UiContainerPadding.v7 => 7,
      };

  @override
  Widget build(BuildContext context) {
    final content = Padding(
      padding: EdgeInsets.symmetric(horizontal: UiTokens.space(_step)),
      child: Column(mainAxisSize: MainAxisSize.min, crossAxisAlignment: CrossAxisAlignment.stretch, children: children),
    );
    final width = _maxWidth;
    // Content never exceeds maxWidth; centered horizontally when narrower than the viewport.
    return Align(
      alignment: Alignment.topCenter,
      child: width == null ? content : ConstrainedBox(constraints: BoxConstraints(maxWidth: width), child: content),
    );
  }
}
