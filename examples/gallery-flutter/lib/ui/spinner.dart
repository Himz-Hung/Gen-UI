import 'package:flutter/material.dart';
import 'tokens.g.dart';

enum UiSpinnerSize { sm, md, lg }

class UiSpinner extends StatelessWidget {
  const UiSpinner({super.key, required this.label, this.size = UiSpinnerSize.md, this.showLabel = false});

  final String label;
  final UiSpinnerSize size;
  final bool showLabel;

  // Sizes sm 16, md 24, lg 40 logical pixels.
  double get _diameter => switch (size) { UiSpinnerSize.sm => 16, UiSpinnerSize.md => 24, UiSpinnerSize.lg => 40 };

  @override
  Widget build(BuildContext context) {
    final indicator = SizedBox.square(
      dimension: _diameter,
      child: CircularProgressIndicator(strokeWidth: _diameter <= 16 ? 2 : 3, color: UiTokens.colorPrimary),
    );
    return Semantics(
      label: label,
      child: showLabel
          ? Row(mainAxisSize: MainAxisSize.min, children: [
              indicator,
              SizedBox(width: UiTokens.space(3)),
              Text(label, style: const TextStyle(color: UiTokens.colorText)),
            ])
          : ExcludeSemantics(child: indicator),
    );
  }
}
