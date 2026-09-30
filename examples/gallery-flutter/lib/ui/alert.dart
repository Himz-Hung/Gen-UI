import 'package:flutter/material.dart';
import 'icons.dart';
import 'theme.g.dart';
import 'tokens.g.dart';

enum UiAlertTone { info, success, warning, danger }

class UiAlert extends StatelessWidget {
  const UiAlert({super.key, this.tone = UiAlertTone.info, required this.title, this.description, this.dismissible = false, this.onDismiss});

  final UiAlertTone tone;
  final String title;
  final String? description;
  final bool dismissible;
  final VoidCallback? onDismiss;

  Color _color(BuildContext context) => switch (tone) {
        UiAlertTone.info => context.ui.color.primary,
        UiAlertTone.success => context.ui.color.success,
        UiAlertTone.warning => context.ui.color.warning,
        UiAlertTone.danger => context.ui.color.danger,
      };

  IconData get _icon => switch (tone) {
        UiAlertTone.info => uiIconData('info'),
        UiAlertTone.success => uiIconData('success'),
        UiAlertTone.warning => uiIconData('warning'),
        UiAlertTone.danger => uiIconData('error'),
      };

  @override
  Widget build(BuildContext context) {
    // Tone conveyed by icon, color and title text color — never color alone.
    // danger/warning behave as an assertive alert; info/success as a polite status update.
    return Semantics(
      liveRegion: true,
      child: SizedBox(
        width: double.infinity,
        child: Material(
          color: _color(context).withValues(alpha: 0.08),
          borderRadius: BorderRadius.circular(UiTokens.radiusMd),
          child: Padding(
            padding: EdgeInsets.all(UiTokens.space(4)),
            child: Row(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Icon(_icon, color: _color(context), size: 20),
                SizedBox(width: UiTokens.space(3)),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      Text(title, style: TextStyle(color: _color(context), fontWeight: FontWeight.w600)),
                      if (description != null) ...[
                        SizedBox(height: UiTokens.space(1)),
                        Text(description!, style: TextStyle(color: context.ui.color.text)),
                      ],
                    ],
                  ),
                ),
                if (dismissible)
                  IconButton(
                    icon: Icon(uiIconData('close'), size: 18),
                    tooltip: 'Dismiss',
                    onPressed: onDismiss,
                    padding: EdgeInsets.zero,
                    constraints: const BoxConstraints(minWidth: 32, minHeight: 32),
                  ),
              ],
            ),
          ),
        ),
      ),
    );
  }
}
