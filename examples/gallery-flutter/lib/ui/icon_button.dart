import 'package:flutter/material.dart';
import 'icons.dart';
import 'tokens.g.dart';

enum UiIconButtonVariant { ghost, secondary }

enum UiIconButtonSize { sm, md, lg }

class UiIconButton extends StatelessWidget {
  const UiIconButton({super.key, required this.icon, required this.label, this.variant = UiIconButtonVariant.ghost, this.size = UiIconButtonSize.md, this.disabled = false, this.badge, this.onPress});

  final String icon;
  final String label;
  final UiIconButtonVariant variant;
  final UiIconButtonSize size;
  final bool disabled;
  final String? badge;
  final VoidCallback? onPress;

  // Square: sm 32, md 40, lg 48.
  double get _dimension => switch (size) {
        UiIconButtonSize.sm => 32,
        UiIconButtonSize.md => 40,
        UiIconButtonSize.lg => 48,
      };

  double get _iconSize => switch (size) {
        UiIconButtonSize.sm => 16,
        UiIconButtonSize.md => 20,
        UiIconButtonSize.lg => 24,
      };

  @override
  Widget build(BuildContext context) {
    final fg = disabled ? UiTokens.colorMuted.withValues(alpha: 0.5) : UiTokens.colorText;
    final button = IconButton(
      // Never emits press while disabled.
      onPressed: disabled ? null : onPress,
      icon: Icon(uiIconData(icon), size: _iconSize),
      color: fg,
      tooltip: label,
      iconSize: _iconSize,
      constraints: BoxConstraints.tightFor(width: _dimension, height: _dimension),
      padding: EdgeInsets.zero,
      style: variant == UiIconButtonVariant.secondary
          ? IconButton.styleFrom(
              backgroundColor: UiTokens.colorMuted.withValues(alpha: 0.1),
              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(UiTokens.radiusMd)),
              tapTargetSize: MaterialTapTargetSize.shrinkWrap,
            )
          // shrinkWrap: the laid-out size is the contract size, no invisible 48px tap padding
          : IconButton.styleFrom(shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(UiTokens.radiusMd)), tapTargetSize: MaterialTapTargetSize.shrinkWrap),
    );
    // The badge is part of the accessible name and never changes the button size.
    final count = badge != null && RegExp(r'^\d+$').hasMatch(badge!) && int.parse(badge!) > 99 ? '99+' : badge;
    final name = badge == null ? label : (badge!.isEmpty ? '$label, new' : '$label, $count');
    final child = badge == null
        ? button
        : Stack(clipBehavior: Clip.none, children: [
            button,
            PositionedDirectional(
              top: 2,
              end: 2,
              child: IgnorePointer(
                child: Container(
                  constraints: BoxConstraints(minWidth: badge!.isEmpty ? 8 : 16, minHeight: badge!.isEmpty ? 8 : 16),
                  padding: EdgeInsets.symmetric(horizontal: badge!.isEmpty ? 0 : 4),
                  decoration: BoxDecoration(color: UiTokens.colorDanger, borderRadius: BorderRadius.circular(UiTokens.radiusFull)),
                  alignment: Alignment.center,
                  child: badge!.isEmpty ? null : Text(count!, style: const TextStyle(color: UiTokens.colorSurface, fontSize: 10, fontWeight: FontWeight.w700, height: 1.2)),
                ),
              ),
            ),
          ]);
    // Role button with label (and badge) as accessible name; label is not shown visually, only via tooltip/semantics.
    return Semantics(button: true, enabled: !disabled, label: name, excludeSemantics: true, child: child);
  }
}
