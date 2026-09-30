import 'package:flutter/material.dart';
import 'theme.g.dart';
import 'tokens.g.dart';

enum UiStatTrend { up, down, flat }

class UiStat extends StatelessWidget {
  const UiStat({super.key, required this.label, required this.value, this.trend, this.hint});

  final String label;
  final String value;
  final UiStatTrend? trend;
  final String? hint;

  (IconData, Color)? _trend(BuildContext context) => switch (trend) {
        null => null,
        UiStatTrend.up => (Icons.arrow_upward, context.ui.color.success),
        UiStatTrend.down => (Icons.arrow_downward, context.ui.color.danger),
        UiStatTrend.flat => (Icons.trending_flat, context.ui.color.muted),
      };

  @override
  Widget build(BuildContext context) {
    final trendInfo = _trend(context);
    return MergeSemantics(
      child: Column(crossAxisAlignment: CrossAxisAlignment.start, mainAxisSize: MainAxisSize.min, children: [
        Text(label, style: TextStyle(color: context.ui.color.muted, fontSize: 13)),
        SizedBox(height: UiTokens.space(1)),
        Row(mainAxisSize: MainAxisSize.min, children: [
          Text(
            value,
            style: TextStyle(
              color: context.ui.color.text,
              fontFamily: UiTokens.fontHeading,
              fontSize: 20,
              fontWeight: FontWeight.w700,
            ),
          ),
          if (trendInfo != null) ...[
            SizedBox(width: UiTokens.space(1)),
            Icon(trendInfo.$1, size: 16, color: trendInfo.$2),
          ],
        ]),
        if (hint != null) ...[
          SizedBox(height: UiTokens.space(1)),
          Text(hint!, style: TextStyle(color: context.ui.color.muted, fontSize: 12)),
        ],
      ]),
    );
  }
}
