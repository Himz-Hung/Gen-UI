import 'package:flutter/material.dart';
import 'theme.g.dart';
import 'tokens.g.dart';

class UiTag extends StatelessWidget {
  const UiTag({super.key, required this.label, this.removable = true, this.onRemove});

  final String label;
  final bool removable;
  final VoidCallback? onRemove;

  @override
  Widget build(BuildContext context) {
    return Container(
      height: 28,
      padding: EdgeInsets.only(left: UiTokens.space(3), right: removable ? UiTokens.space(1) : UiTokens.space(3)),
      decoration: BoxDecoration(
        color: context.ui.color.secondary.withValues(alpha: 0.12),
        borderRadius: BorderRadius.circular(UiTokens.radiusFull),
      ),
      child: Row(mainAxisSize: MainAxisSize.min, children: [
        Text(label, overflow: TextOverflow.ellipsis, style: TextStyle(color: context.ui.color.text, fontSize: 13)),
        if (removable) ...[
          SizedBox(width: UiTokens.space(1)),
          IconButton(
            onPressed: onRemove,
            icon: const Icon(Icons.close),
            iconSize: 14,
            padding: EdgeInsets.zero,
            constraints: const BoxConstraints.tightFor(width: 20, height: 20),
            tooltip: 'Remove $label',
            visualDensity: VisualDensity.compact,
          ),
        ],
      ]),
    );
  }
}
