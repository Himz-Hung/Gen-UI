import 'package:flutter/material.dart';
import 'button.dart';
import 'icons.dart';
import 'theme.g.dart';
import 'tokens.g.dart';

class UiEmptyState extends StatelessWidget {
  const UiEmptyState({super.key, required this.title, this.description, this.icon, this.actionLabel, this.onAction});

  final String title;
  final String? description;
  final String? icon;
  final String? actionLabel;
  final VoidCallback? onAction;

  @override
  Widget build(BuildContext context) {
    return Semantics(
      container: true,
      child: ConstrainedBox(
        constraints: const BoxConstraints(minHeight: 240),
        child: Center(
          child: Padding(
            padding: EdgeInsets.all(UiTokens.space(5)),
            child: Column(
              mainAxisSize: MainAxisSize.min,
              children: [
                if (icon != null) ...[
                  Icon(uiIconData(icon!), size: 48, color: context.ui.color.muted),
                  SizedBox(height: UiTokens.space(3)),
                ],
                Text(
                  title,
                  textAlign: TextAlign.center,
                  style: TextStyle(color: context.ui.color.text, fontWeight: FontWeight.w600, fontSize: 18),
                ),
                if (description != null) ...[
                  SizedBox(height: UiTokens.space(2)),
                  Text(
                    description!,
                    textAlign: TextAlign.center,
                    style: TextStyle(color: context.ui.color.muted),
                  ),
                ],
                // action is emitted only via the Button rendered when actionLabel is present.
                if (actionLabel != null) ...[
                  SizedBox(height: UiTokens.space(4)),
                  UiButton(label: actionLabel!, onPress: onAction),
                ],
              ],
            ),
          ),
        ),
      ),
    );
  }
}
