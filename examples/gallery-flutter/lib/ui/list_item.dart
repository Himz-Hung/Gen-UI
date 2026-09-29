import 'package:flutter/material.dart';
import 'tokens.g.dart';

class UiListItem extends StatelessWidget {
  const UiListItem({super.key, required this.title, this.subtitle, this.trailing, this.pressable = false, this.onPress});

  final String title;
  final String? subtitle;
  final String? trailing;
  final bool pressable;
  final VoidCallback? onPress;

  @override
  Widget build(BuildContext context) {
    final dense = ListTileTheme.of(context).dense ?? false;
    final minHeight = dense ? 40.0 : (subtitle == null ? 48.0 : 56.0);
    final content = ConstrainedBox(
      constraints: BoxConstraints(minHeight: minHeight),
      child: Padding(
        padding: EdgeInsets.symmetric(horizontal: UiTokens.space(4), vertical: UiTokens.space(2)),
        child: Row(children: [
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              mainAxisSize: MainAxisSize.min,
              children: [
                Text(title, overflow: TextOverflow.ellipsis, style: const TextStyle(color: UiTokens.colorText, fontWeight: FontWeight.w500)),
                if (subtitle != null)
                  Text(subtitle!, overflow: TextOverflow.ellipsis, style: const TextStyle(color: UiTokens.colorMuted, fontSize: 13)),
              ],
            ),
          ),
          if (trailing != null) ...[
            SizedBox(width: UiTokens.space(3)),
            Text(trailing!, style: const TextStyle(color: UiTokens.colorMuted)),
          ],
        ]),
      ),
    );
    // pressable=false: no hover feedback, never emits press.
    return MergeSemantics(
      child: Semantics(
        button: pressable,
        enabled: pressable ? true : null,
        child: pressable
            ? InkWell(onTap: onPress, child: content)
            : content,
      ),
    );
  }
}
