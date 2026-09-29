import 'package:flutter/material.dart';
import 'tokens.g.dart';

enum UiStatTrend { up, down, flat }

class UiStat extends StatelessWidget {
  const UiStat({super.key, required this.label, required this.value, this.trend, this.hint});

  final String label;
  final String value;
  final UiStatTrend? trend;
  final String? hint;

  (IconData, Color)? get _trend => switch (trend) {
        null => null,
        UiStatTrend.up => (Icons.arrow_upward, UiTokens.colorSuccess),
        UiStatTrend.down => (Icons.arrow_downward, UiTokens.colorDanger),
        UiStatTrend.flat => (Icons.trending_flat, UiTokens.colorMuted),
      };

  @override
  Widget build(BuildContext context) {
    final trendInfo = _trend;
    return MergeSemantics(
      child: Column(crossAxisAlignment: CrossAxisAlignment.start, mainAxisSize: MainAxisSize.min, children: [
        Text(label, style: const TextStyle(color: UiTokens.colorMuted, fontSize: 13)),
        SizedBox(height: UiTokens.space(1)),
        Row(mainAxisSize: MainAxisSize.min, children: [
          Text(
            value,
            style: const TextStyle(
              color: UiTokens.colorText,
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
          Text(hint!, style: const TextStyle(color: UiTokens.colorMuted, fontSize: 12)),
        ],
      ]),
    );
  }
}
