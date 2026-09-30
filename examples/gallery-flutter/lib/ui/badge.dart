import 'package:flutter/material.dart';
import 'theme.g.dart';
import 'tokens.g.dart';

enum UiBadgeTone { neutral, primary, success, warning, danger }

class UiBadge extends StatelessWidget {
  const UiBadge({super.key, required this.label, this.tone = UiBadgeTone.neutral});

  final String label;
  final UiBadgeTone tone;

  Color _color(BuildContext context) => switch (tone) {
        UiBadgeTone.neutral => context.ui.color.secondary,
        UiBadgeTone.primary => context.ui.color.primary,
        UiBadgeTone.success => context.ui.color.success,
        UiBadgeTone.warning => context.ui.color.warning,
        UiBadgeTone.danger => context.ui.color.danger,
      };

  @override
  Widget build(BuildContext context) {
    // Tone is conveyed by both color and the label text itself, never color alone.
    final color = _color(context);
    return Semantics(
      label: label,
      excludeSemantics: true,
      child: Container(
        height: 22,
        padding: EdgeInsets.symmetric(horizontal: UiTokens.space(2)),
        decoration: BoxDecoration(
          color: color.withValues(alpha: 0.12),
          borderRadius: BorderRadius.circular(UiTokens.radiusFull),
        ),
        alignment: Alignment.center,
        child: Text(
          label,
          overflow: TextOverflow.ellipsis,
          style: TextStyle(color: color, fontSize: 12, fontWeight: FontWeight.w500, height: 1),
        ),
      ),
    );
  }
}
