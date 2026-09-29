import 'package:flutter/material.dart';
import 'tokens.g.dart';

enum UiInlineGap { v0, v1, v2, v3, v4, v5, v6, v7 }

enum UiInlineAlign { start, center, end, baseline }

enum UiInlineJustify { start, center, end, between }

class UiInline extends StatelessWidget {
  const UiInline({super.key, this.gap = UiInlineGap.v2, this.align = UiInlineAlign.center, this.justify = UiInlineJustify.start, this.wrap = true, this.children = const []});

  final UiInlineGap gap;
  final UiInlineAlign align;
  final UiInlineJustify justify;
  final bool wrap;
  final List<Widget> children;

  int get _step => switch (gap) {
        UiInlineGap.v0 => 0,
        UiInlineGap.v1 => 1,
        UiInlineGap.v2 => 2,
        UiInlineGap.v3 => 3,
        UiInlineGap.v4 => 4,
        UiInlineGap.v5 => 5,
        UiInlineGap.v6 => 6,
        UiInlineGap.v7 => 7,
      };

  CrossAxisAlignment get _crossAxisAlignment => switch (align) {
        UiInlineAlign.start => CrossAxisAlignment.start,
        UiInlineAlign.center => CrossAxisAlignment.center,
        UiInlineAlign.end => CrossAxisAlignment.end,
        UiInlineAlign.baseline => CrossAxisAlignment.baseline,
      };

  WrapCrossAlignment get _wrapCrossAlignment => switch (align) {
        UiInlineAlign.start => WrapCrossAlignment.start,
        UiInlineAlign.center => WrapCrossAlignment.center,
        UiInlineAlign.end => WrapCrossAlignment.end,
        UiInlineAlign.baseline => WrapCrossAlignment.center,
      };

  MainAxisAlignment get _mainAxisAlignment => switch (justify) {
        UiInlineJustify.start => MainAxisAlignment.start,
        UiInlineJustify.center => MainAxisAlignment.center,
        UiInlineJustify.end => MainAxisAlignment.end,
        UiInlineJustify.between => MainAxisAlignment.spaceBetween,
      };

  WrapAlignment get _wrapAlignment => switch (justify) {
        UiInlineJustify.start => WrapAlignment.start,
        UiInlineJustify.center => WrapAlignment.center,
        UiInlineJustify.end => WrapAlignment.end,
        UiInlineJustify.between => WrapAlignment.spaceBetween,
      };

  @override
  Widget build(BuildContext context) {
    if (children.isEmpty) return const SizedBox.shrink();
    final gapSize = UiTokens.space(_step);
    if (wrap) {
      return Wrap(
        spacing: gapSize,
        runSpacing: gapSize,
        alignment: _wrapAlignment,
        crossAxisAlignment: _wrapCrossAlignment,
        children: children,
      );
    }
    // wrap=false: children never wrap; they shrink or overflow is clipped.
    return Row(
      mainAxisSize: MainAxisSize.min,
      mainAxisAlignment: _mainAxisAlignment,
      crossAxisAlignment: align == UiInlineAlign.baseline ? CrossAxisAlignment.baseline : _crossAxisAlignment,
      textBaseline: align == UiInlineAlign.baseline ? TextBaseline.alphabetic : null,
      children: [
        for (var i = 0; i < children.length; i++) ...[
          if (i > 0) SizedBox(width: gapSize),
          Flexible(child: children[i]),
        ],
      ],
    );
  }
}
