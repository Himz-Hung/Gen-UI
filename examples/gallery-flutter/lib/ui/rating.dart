import 'package:flutter/material.dart';
import 'icons.dart';
import 'theme.g.dart';

enum UiRatingSize { sm, md, lg }

class UiRating extends StatelessWidget {
  const UiRating({super.key, required this.label, required this.value, this.max = 5, this.readOnly = false, this.size = UiRatingSize.md, this.onChange});

  final String label;
  final double value;
  final int max;
  final bool readOnly;
  final UiRatingSize size;
  final ValueChanged<int>? onChange;

  double get _iconSize => switch (size) { UiRatingSize.sm => 16, UiRatingSize.md => 20, UiRatingSize.lg => 28 };

  @override
  Widget build(BuildContext context) {
    final maxStars = max;
    // Filled stars use tokens.color.warning; empty stars are outlined.
    final filledColor = context.ui.color.warning;
    if (readOnly) {
      final rounded = (value.clamp(0, max) * 2).round() / 2;
      return Semantics(
        image: true,
        label: '$rounded of $maxStars',
        excludeSemantics: true,
        child: Row(mainAxisSize: MainAxisSize.min, children: [
          for (var i = 1; i <= maxStars; i++) Icon(_iconFor(i, rounded), size: _iconSize, color: filledColor),
        ]),
      );
    }
    return Semantics(
      label: label,
      container: true,
      child: Column(crossAxisAlignment: CrossAxisAlignment.start, mainAxisSize: MainAxisSize.min, children: [
        Text(label, style: TextStyle(color: context.ui.color.text, fontWeight: FontWeight.w600)),
        Row(mainAxisSize: MainAxisSize.min, children: [
          for (var i = 1; i <= maxStars; i++)
            Semantics(
              label: '$i of $maxStars',
              selected: value.round() == i,
              button: true,
              child: SizedBox(
                width: 32,
                height: 32,
                child: IconButton(
                  padding: EdgeInsets.zero,
                  constraints: const BoxConstraints.tightFor(width: 32, height: 32),
                  icon: Icon(i <= value ? uiIconData('star') : uiIconData('star-empty'), size: _iconSize, color: filledColor),
                  onPressed: () => onChange?.call(i),
                ),
              ),
            ),
        ]),
      ]),
    );
  }

  IconData _iconFor(int i, double rounded) {
    if (i <= rounded) return uiIconData('star');
    if (i - 0.5 == rounded) return uiIconData('star-half');
    return uiIconData('star-empty');
  }
}
