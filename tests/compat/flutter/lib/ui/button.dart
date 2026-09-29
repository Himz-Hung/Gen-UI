import 'package:flutter/material.dart';
import 'icons.dart';
import 'tokens.g.dart';

enum UiButtonVariant { primary, secondary, ghost, danger }

enum UiButtonSize { sm, md, lg }

class UiButton extends StatelessWidget {
  const UiButton({super.key, required this.label, this.variant = UiButtonVariant.primary, this.size = UiButtonSize.md, this.disabled = false, this.loading = false, this.icon, this.fullWidth = false, this.onPress});

  final String label;
  final UiButtonVariant variant;
  final UiButtonSize size;
  final bool disabled;
  final bool loading;
  final String? icon;
  final bool fullWidth;
  final VoidCallback? onPress;

  double get _height => switch (size) { UiButtonSize.sm => 32, UiButtonSize.md => 40, UiButtonSize.lg => 48 };

  @override
  Widget build(BuildContext context) {
    // loading implies disabled and keeps the same size; never emits press while disabled or loading.
    final enabled = !disabled && !loading;
    final fg = switch (variant) { UiButtonVariant.primary || UiButtonVariant.danger => UiTokens.colorSurface, _ => UiTokens.colorPrimary };
    // the label stays laid out (invisible) under the spinner, so width and height do not change while loading
    final child = Stack(alignment: Alignment.center, children: [
      Visibility(
        visible: !loading, maintainSize: true, maintainAnimation: true, maintainState: true,
        child: Row(mainAxisSize: MainAxisSize.min, children: [
          if (icon != null) ...[Icon(uiIconData(icon!), size: 18), SizedBox(width: UiTokens.space(2))],
          Flexible(child: Text(label, overflow: TextOverflow.ellipsis)),
        ]),
      ),
      if (loading) SizedBox.square(dimension: _height * 0.45, child: CircularProgressIndicator(strokeWidth: 2, color: fg)),
    ]);
    final style = ButtonStyle(
      minimumSize: WidgetStatePropertyAll(Size(fullWidth ? double.infinity : 0, _height)),
      fixedSize: WidgetStatePropertyAll(Size.fromHeight(_height)),
      padding: WidgetStatePropertyAll(EdgeInsets.symmetric(horizontal: UiTokens.space(4))),
      shape: WidgetStatePropertyAll(RoundedRectangleBorder(borderRadius: BorderRadius.circular(UiTokens.radiusMd))),
      // the contract height is the laid-out height too: no invisible 48px tap padding around sm / md
      tapTargetSize: MaterialTapTargetSize.shrinkWrap,
    );
    final onPressed = enabled ? onPress : null;
    final button = switch (variant) {
      UiButtonVariant.primary => FilledButton(onPressed: onPressed, style: style.copyWith(backgroundColor: const WidgetStatePropertyAll(UiTokens.colorPrimary)), child: child),
      UiButtonVariant.danger => FilledButton(onPressed: onPressed, style: style.copyWith(backgroundColor: const WidgetStatePropertyAll(UiTokens.colorDanger)), child: child),
      UiButtonVariant.secondary => OutlinedButton(onPressed: onPressed, style: style, child: child),
      UiButtonVariant.ghost => TextButton(onPressed: onPressed, style: style, child: child),
    };
    return Semantics(button: true, enabled: enabled, label: label, excludeSemantics: loading, child: fullWidth ? SizedBox(width: double.infinity, child: button) : button);
  }
}
