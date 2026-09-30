import 'package:flutter/material.dart';
import 'theme.g.dart';
import 'tokens.g.dart';

enum UiHeadingLevel { v1, v2, v3, v4 }

enum UiHeadingSize { sm, md, lg, xl }

class UiHeading extends StatelessWidget {
  const UiHeading({super.key, required this.value, this.level = UiHeadingLevel.v2, this.size});

  final String value;
  final UiHeadingLevel level;
  final UiHeadingSize? size;

  int get _semanticLevel => switch (level) {
        UiHeadingLevel.v1 => 1,
        UiHeadingLevel.v2 => 2,
        UiHeadingLevel.v3 => 3,
        UiHeadingLevel.v4 => 4,
      };

  // size controls appearance only; defaults follow level when size is not given.
  UiHeadingSize get _effectiveSize => size ?? switch (level) {
        UiHeadingLevel.v1 => UiHeadingSize.xl,
        UiHeadingLevel.v2 => UiHeadingSize.lg,
        UiHeadingLevel.v3 => UiHeadingSize.md,
        UiHeadingLevel.v4 => UiHeadingSize.sm,
      };

  double get _fontSize => switch (_effectiveSize) {
        UiHeadingSize.sm => 16,
        UiHeadingSize.md => 20,
        UiHeadingSize.lg => 24,
        UiHeadingSize.xl => 30,
      };

  @override
  Widget build(BuildContext context) {
    // level controls semantics only (document outline); exposed as a heading of the given level.
    return Semantics(
      header: true,
      headingLevel: _semanticLevel,
      child: Text(
        value,
        style: TextStyle(
          fontFamily: UiTokens.fontHeading,
          fontSize: _fontSize,
          fontWeight: FontWeight.bold,
          color: context.ui.color.text,
        ),
      ),
    );
  }
}
