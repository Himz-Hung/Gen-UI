import 'package:flutter/material.dart';
import 'theme.g.dart';
import 'tokens.g.dart';

enum UiTextSize { xs, sm, md, lg }

enum UiTextWeight { regular, medium, bold }

enum UiTextColor { text, muted, primary, danger }

enum UiTextAlign { start, center, end }

class UiText extends StatelessWidget {
  const UiText({super.key, required this.value, this.size = UiTextSize.md, this.weight = UiTextWeight.regular, this.color = UiTextColor.text, this.truncate = false, this.align = UiTextAlign.start});

  final String value;
  final UiTextSize size;
  final UiTextWeight weight;
  final UiTextColor color;
  final bool truncate;
  final UiTextAlign align;

  double get _fontSize => switch (size) {
        UiTextSize.xs => 12,
        UiTextSize.sm => 14,
        UiTextSize.md => 16,
        UiTextSize.lg => 18,
      };

  FontWeight get _fontWeight => switch (weight) {
        UiTextWeight.regular => FontWeight.w400,
        UiTextWeight.medium => FontWeight.w500,
        UiTextWeight.bold => FontWeight.w700,
      };

  Color _color(BuildContext context) => switch (color) {
        UiTextColor.text => context.ui.color.text,
        UiTextColor.muted => context.ui.color.muted,
        UiTextColor.primary => context.ui.color.primary,
        UiTextColor.danger => context.ui.color.danger,
      };

  TextAlign get _textAlign => switch (align) {
        UiTextAlign.start => TextAlign.start,
        UiTextAlign.center => TextAlign.center,
        UiTextAlign.end => TextAlign.end,
      };

  @override
  Widget build(BuildContext context) {
    // Rendered as real text (not an image); truncate=true never wraps and shows an ellipsis
    // while the full value remains available to assistive tech via the semantics label.
    return Text(
      value,
      textAlign: _textAlign,
      maxLines: truncate ? 1 : null,
      overflow: truncate ? TextOverflow.ellipsis : TextOverflow.clip,
      softWrap: !truncate,
      semanticsLabel: value,
      style: TextStyle(fontFamily: UiTokens.fontBody, fontSize: _fontSize, fontWeight: _fontWeight, color: _color(context)),
    );
  }
}
