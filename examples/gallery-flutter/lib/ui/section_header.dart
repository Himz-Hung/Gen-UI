import 'package:flutter/material.dart';
import 'tokens.g.dart';

enum UiSectionHeaderLevel { v2, v3 }

class UiSectionHeader extends StatelessWidget {
  const UiSectionHeader({super.key, required this.title, this.description, this.actionLabel, this.level = UiSectionHeaderLevel.v2, this.onAction});

  final String title;
  final String? description;
  final String? actionLabel;
  final UiSectionHeaderLevel level;
  final VoidCallback? onAction;

  int get _headingLevel => level == UiSectionHeaderLevel.v2 ? 2 : 3;

  @override
  Widget build(BuildContext context) {
    final titleStyle = TextStyle(
      color: UiTokens.colorText,
      fontFamily: UiTokens.fontHeading,
      fontWeight: FontWeight.bold,
      fontSize: level == UiSectionHeaderLevel.v2 ? 20 : 17,
    );
    return Padding(
      // Space above tokens.spacing[5], below tokens.spacing[3].
      padding: EdgeInsets.only(top: UiTokens.space(5), bottom: UiTokens.space(3)),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.center,
        children: [
          Expanded(
            child: Column(
              mainAxisSize: MainAxisSize.min,
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                // Title is a real heading of the given semantic level.
                Semantics(
                  header: true,
                  headingLevel: _headingLevel,
                  child: Text(title, style: titleStyle),
                ),
                if (description != null) ...[
                  SizedBox(height: UiTokens.space(1)),
                  Text(description!, style: TextStyle(color: UiTokens.colorMuted, fontFamily: UiTokens.fontBody)),
                ],
              ],
            ),
          ),
          if (actionLabel != null) ...[
            SizedBox(width: UiTokens.space(3)),
            // At least 44 tall tap target; accessible name should include the section context.
            SizedBox(
              height: 44,
              child: TextButton(
                onPressed: onAction,
                style: TextButton.styleFrom(foregroundColor: UiTokens.colorPrimary),
                child: Text(actionLabel!, style: const TextStyle(decoration: TextDecoration.underline)),
              ),
            ),
          ],
        ],
      ),
    );
  }
}
