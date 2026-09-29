import 'dart:ui' show SemanticsRole;

import 'package:flutter/material.dart';
import 'tokens.g.dart';

class UiRadioGroupOption {
  const UiRadioGroupOption({required this.value, required this.label, this.description, this.disabled});
  final String value;
  final String label;
  final String? description;
  final bool? disabled;
}

enum UiRadioGroupDirection { vertical, horizontal }

class UiRadioGroup extends StatelessWidget {
  const UiRadioGroup({super.key, required this.label, required this.value, required this.options, this.direction = UiRadioGroupDirection.vertical, this.disabled = false, this.error, this.onChange});

  final String label;
  final String value;
  final List<UiRadioGroupOption> options;
  final UiRadioGroupDirection direction;
  final bool disabled;
  final String? error;
  final ValueChanged<String>? onChange;

  @override
  Widget build(BuildContext context) {
    final tiles = [
      for (final o in options)
        _RadioOptionTile(
          option: o,
          enabled: !disabled && o.disabled != true,
          onSelect: () => onChange?.call(o.value),
        ),
    ];
    return Semantics(
      role: SemanticsRole.radioGroup,
      label: label,
      child: Column(crossAxisAlignment: CrossAxisAlignment.start, mainAxisSize: MainAxisSize.min, children: [
        Text(label, style: const TextStyle(color: UiTokens.colorText, fontWeight: FontWeight.w600)),
        SizedBox(height: UiTokens.space(1)),
        RadioGroup<String>(
          groupValue: value,
          onChanged: disabled ? (_) {} : (v) { if (v != null) onChange?.call(v); },
          child: direction == UiRadioGroupDirection.vertical
              ? Column(crossAxisAlignment: CrossAxisAlignment.start, mainAxisSize: MainAxisSize.min, children: tiles)
              : Wrap(spacing: UiTokens.space(3), children: tiles),
        ),
        if (error != null) ...[
          SizedBox(height: UiTokens.space(1)),
          Text(error!, style: TextStyle(color: UiTokens.colorDanger, fontSize: 12)),
        ],
      ]),
    );
  }
}

class _RadioOptionTile extends StatelessWidget {
  const _RadioOptionTile({required this.option, required this.enabled, required this.onSelect});

  final UiRadioGroupOption option;
  final bool enabled;
  final VoidCallback onSelect;

  @override
  Widget build(BuildContext context) {
    // Pressing the label or description selects the option too.
    return InkWell(
      onTap: enabled ? onSelect : null,
      child: Padding(
        padding: EdgeInsets.symmetric(vertical: UiTokens.space(1)),
        child: Row(mainAxisSize: MainAxisSize.min, crossAxisAlignment: CrossAxisAlignment.center, children: [
          SizedBox(
            width: 20,
            height: 20,
            child: Radio<String>(value: option.value, toggleable: false, enabled: enabled),
          ),
          SizedBox(width: UiTokens.space(2)),
          Flexible(
            child: Column(crossAxisAlignment: CrossAxisAlignment.start, mainAxisSize: MainAxisSize.min, children: [
              Text(option.label, style: TextStyle(color: enabled ? UiTokens.colorText : UiTokens.colorMuted)),
              if (option.description != null)
                Text(option.description!, style: TextStyle(color: UiTokens.colorMuted, fontSize: 12)),
            ]),
          ),
        ]),
      ),
    );
  }
}
