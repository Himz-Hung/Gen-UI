import 'package:flutter/material.dart';
import 'icons.dart';
import 'tokens.g.dart';

class UiSegmentedControlOption {
  const UiSegmentedControlOption({required this.value, required this.label, this.icon});
  final String value;
  final String label;
  final String? icon;
}

enum UiSegmentedControlSize { sm, md }

class UiSegmentedControl extends StatelessWidget {
  const UiSegmentedControl({super.key, required this.label, required this.options, required this.value, this.size = UiSegmentedControlSize.md, this.fullWidth = false, this.onChange});

  final String label;
  final List<UiSegmentedControlOption> options;
  final String value;
  final UiSegmentedControlSize size;
  final bool fullWidth;
  final ValueChanged<String>? onChange;

  // Height sm 32, md 40.
  double get _height => size == UiSegmentedControlSize.sm ? 32 : 40;

  @override
  Widget build(BuildContext context) {
    final selectedExists = options.any((o) => o.value == value);
    return Semantics(
      label: label,
      container: true,
      child: Container(
        height: _height,
        width: fullWidth ? double.infinity : null,
        padding: const EdgeInsets.all(2),
        decoration: BoxDecoration(
          color: UiTokens.colorMuted.withValues(alpha: 0.12),
          borderRadius: BorderRadius.circular(UiTokens.radiusMd),
        ),
        child: Row(
          mainAxisSize: fullWidth ? MainAxisSize.max : MainAxisSize.min,
          children: [
            for (final o in options)
              _segment(o, selectedExists && o.value == value),
          ],
        ),
      ),
    );
  }

  Widget _segment(UiSegmentedControlOption o, bool selected) {
    final content = Row(
      mainAxisSize: MainAxisSize.min,
      children: [
        if (o.icon != null) ...[Icon(uiIconData(o.icon!), size: 16), SizedBox(width: UiTokens.space(1))],
        Flexible(
          child: Text(
            o.label,
            overflow: TextOverflow.ellipsis,
            style: TextStyle(
              color: selected ? UiTokens.colorText : UiTokens.colorMuted,
              fontWeight: selected ? FontWeight.w700 : FontWeight.w400,
            ),
          ),
        ),
      ],
    );
    final button = Semantics(
      button: true,
      selected: selected,
      label: o.label,
      child: Material(
        color: selected ? UiTokens.colorSurface : Colors.transparent,
        elevation: selected ? 1 : 0,
        borderRadius: BorderRadius.circular(UiTokens.radiusSm),
        child: InkWell(
          borderRadius: BorderRadius.circular(UiTokens.radiusSm),
          onTap: () => onChange?.call(o.value),
          child: Padding(
            padding: EdgeInsets.symmetric(horizontal: UiTokens.space(3)),
            child: Center(child: content),
          ),
        ),
      ),
    );
    return fullWidth ? Expanded(child: button) : button;
  }
}
