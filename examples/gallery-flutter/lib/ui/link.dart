import 'package:flutter/material.dart';
import 'tokens.g.dart';

enum UiLinkVariant { inline, standalone }

class UiLink extends StatelessWidget {
  const UiLink({super.key, required this.label, this.variant = UiLinkVariant.inline, this.onPress});

  final String label;
  final UiLinkVariant variant;
  final VoidCallback? onPress;

  @override
  Widget build(BuildContext context) {
    // Color tokens.color.primary; inline variant is underlined (distinct from surrounding text
    // by more than color alone).
    final style = TextStyle(
      color: UiTokens.colorPrimary,
      fontFamily: UiTokens.fontBody,
      decoration: variant == UiLinkVariant.inline ? TextDecoration.underline : TextDecoration.none,
      fontWeight: variant == UiLinkVariant.standalone ? FontWeight.w600 : FontWeight.w400,
    );
    final text = Text(label, style: style);
    final child = variant == UiLinkVariant.standalone
        ? Padding(padding: EdgeInsets.symmetric(vertical: UiTokens.space(2)), child: text)
        : text;
    // Role link, visible focus ring via InkWell's default focus/hover decoration.
    return Semantics(
      link: true,
      label: label,
      excludeSemantics: true,
      child: InkWell(
        onTap: onPress,
        focusColor: UiTokens.colorPrimary.withValues(alpha: 0.12),
        hoverColor: UiTokens.colorPrimary.withValues(alpha: 0.08),
        mouseCursor: SystemMouseCursors.click,
        child: child,
      ),
    );
  }
}
