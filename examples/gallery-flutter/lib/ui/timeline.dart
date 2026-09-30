import 'package:flutter/material.dart';
import 'theme.g.dart';
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

  Color _toneColor(BuildContext context, UiTimelineTone? tone) => switch (tone) {
        null || UiTimelineTone.neutral => context.ui.color.muted,
        UiTimelineTone.primary => context.ui.color.primary,
        UiTimelineTone.success => context.ui.color.success,
        UiTimelineTone.warning => context.ui.color.warning,
        UiTimelineTone.danger => context.ui.color.danger,
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
            _row(context, ordered[i], isLast: i == ordered.length - 1),
        ],
      ),
    );
  }

  Widget _row(BuildContext context, UiTimelineItem item, {required bool isLast}) {
    final color = _toneColor(context, item.tone);
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
                  if (!isLast) Expanded(child: Container(width: 1.5, color: context.ui.color.muted.withValues(alpha: 0.25))),
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
                      Flexible(child: Text(item.title, style: TextStyle(color: context.ui.color.text, fontWeight: FontWeight.w600))),
                      if (item.time != null) ...[
                        SizedBox(width: UiTokens.space(2)),
                        Text(item.time!, style: TextStyle(color: context.ui.color.muted, fontSize: 12)),
                      ],
                    ]),
                    if (item.description != null) ...[
                      SizedBox(height: UiTokens.space(1)),
                      Text(item.description!, style: TextStyle(color: context.ui.color.text, fontSize: 13)),
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
