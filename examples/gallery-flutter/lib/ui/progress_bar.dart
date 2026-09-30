import 'package:flutter/material.dart';
import 'theme.g.dart';
import 'tokens.g.dart';

enum UiProgressBarTone { primary, success, warning, danger }

class UiProgressBar extends StatelessWidget {
  const UiProgressBar({super.key, required this.label, this.value, this.valueLabel, this.tone = UiProgressBarTone.primary, this.showLabel = true});

  final String label;
  final double? value;
  final String? valueLabel;
  final UiProgressBarTone tone;
  final bool showLabel;

  Color _color(BuildContext context) => switch (tone) {
        UiProgressBarTone.primary => context.ui.color.primary,
        UiProgressBarTone.success => context.ui.color.success,
        UiProgressBarTone.warning => context.ui.color.warning,
        UiProgressBarTone.danger => context.ui.color.danger,
      };

  @override
  Widget build(BuildContext context) {
    final clamped = value?.clamp(0, 100).toDouble();
    final text = valueLabel ?? (clamped == null ? null : '${clamped.round()}%');
    return Semantics(
      label: label,
      value: clamped == null ? null : '${clamped.round()}',
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        mainAxisSize: MainAxisSize.min,
        children: [
          if (showLabel) ...[
            Row(
              children: [
                Expanded(child: Text(label, style: TextStyle(color: context.ui.color.text, fontWeight: FontWeight.w600))),
                if (text != null) Text(text, style: TextStyle(color: context.ui.color.muted)),
              ],
            ),
            SizedBox(height: UiTokens.space(2)),
          ],
          ExcludeSemantics(
            child: ClipRRect(
              borderRadius: BorderRadius.circular(UiTokens.radiusFull),
              child: LinearProgressIndicator(
                value: clamped == null ? null : clamped / 100,
                minHeight: 8,
                backgroundColor: _color(context).withValues(alpha: 0.15),
                valueColor: AlwaysStoppedAnimation<Color>(_color(context)),
              ),
            ),
          ),
        ],
      ),
    );
  }
}
