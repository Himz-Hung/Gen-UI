import 'package:flutter/material.dart';
import 'theme.g.dart';
import 'tokens.g.dart';

enum UiTooltipPlacement { top, bottom, start, end }

class UiTooltip extends StatelessWidget {
  const UiTooltip({super.key, required this.text, this.placement = UiTooltipPlacement.top, this.children = const []});

  final String text;
  final UiTooltipPlacement placement;
  final List<Widget> children;

  TooltipTriggerMode get _triggerMode => TooltipTriggerMode.longPress;

  @override
  Widget build(BuildContext context) {
    // Wraps exactly one child, which is the trigger. Shows on hover/focus/long-press, hides on leave/blur/Escape
    // and flips placement near the edge of the screen — all handled by Flutter's Tooltip.
    final child = children.isEmpty ? const SizedBox.shrink() : children.first;
    final preferBelow = placement == UiTooltipPlacement.bottom;
    return Tooltip(
      message: text,
      preferBelow: preferBelow,
      triggerMode: _triggerMode,
      textStyle: TextStyle(color: context.ui.color.surface),
      decoration: BoxDecoration(
        color: context.ui.color.text,
        borderRadius: BorderRadius.circular(UiTokens.radiusSm),
      ),
      child: child,
    );
  }
}
