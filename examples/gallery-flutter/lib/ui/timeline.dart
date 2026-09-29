import 'package:flutter/material.dart';
import 'tokens.g.dart';

class UiTimelineItem {
  const UiTimelineItem({required this.title, this.time, this.description, this.tone});
  final String title;
  final String? time;
  final String? description;
  final UiTimelineTone? tone;
}

enum UiTimelineTone { neutral, primary, success, warning, danger }

enum UiTimelineOrder { oldestFirst, newestFirst }

class UiTimeline extends StatelessWidget {
  const UiTimeline({super.key, required this.items, this.order = UiTimelineOrder.oldestFirst});

  final List<UiTimelineItem> items;
  final UiTimelineOrder order;

  Color _toneColor(UiTimelineTone? tone) => switch (tone) {
        null || UiTimelineTone.neutral => UiTokens.colorMuted,
        UiTimelineTone.primary => UiTokens.colorPrimary,
        UiTimelineTone.success => UiTokens.colorSuccess,
        UiTimelineTone.warning => UiTokens.colorWarning,
        UiTimelineTone.danger => UiTokens.colorDanger,
      };

  @override
  Widget build(BuildContext context) {
    final ordered = order == UiTimelineOrder.newestFirst ? items.reversed.toList() : items;
    return Semantics(
      container: true,
      child: Column(
        mainAxisSize: MainAxisSize.min,
        children: [
          for (var i = 0; i < ordered.length; i++)
            _row(ordered[i], isLast: i == ordered.length - 1),
        ],
      ),
    );
  }

  Widget _row(UiTimelineItem item, {required bool isLast}) {
    final color = _toneColor(item.tone);
    return MergeSemantics(
      child: IntrinsicHeight(
        child: Row(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            SizedBox(
              width: 24,
              child: Column(
                children: [
                  Container(
                    width: 10,
                    height: 10,
                    margin: EdgeInsets.only(top: UiTokens.space(1)),
                    decoration: BoxDecoration(shape: BoxShape.circle, color: color),
                  ),
                  if (!isLast) Expanded(child: Container(width: 1.5, color: UiTokens.colorMuted.withValues(alpha: 0.25))),
                ],
              ),
            ),
            SizedBox(width: UiTokens.space(3)),
            Expanded(
              child: Padding(
                padding: EdgeInsets.only(bottom: UiTokens.space(4)),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    Row(children: [
                      Flexible(child: Text(item.title, style: const TextStyle(color: UiTokens.colorText, fontWeight: FontWeight.w600))),
                      if (item.time != null) ...[
                        SizedBox(width: UiTokens.space(2)),
                        Text(item.time!, style: const TextStyle(color: UiTokens.colorMuted, fontSize: 12)),
                      ],
                    ]),
                    if (item.description != null) ...[
                      SizedBox(height: UiTokens.space(1)),
                      Text(item.description!, style: const TextStyle(color: UiTokens.colorText, fontSize: 13)),
                    ],
                  ],
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }
}
