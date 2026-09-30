import 'package:flutter/material.dart';
import 'theme.g.dart';
import 'tokens.g.dart';

class UiSelectOption {
  const UiSelectOption({required this.value, required this.label});
  final String value;
  final String label;
}

class UiSelect extends StatelessWidget {
  const UiSelect({super.key, required this.label, required this.value, required this.options, this.placeholder, this.disabled = false, this.error, this.onChange});

  final String label;
  final String value;
  final List<UiSelectOption> options;
  final String? placeholder;
  final bool disabled;
  final String? error;
  final ValueChanged<String>? onChange;

  @override
  Widget build(BuildContext context) {
    final selected = options.any((o) => o.value == value) ? value : null;
    return Column(crossAxisAlignment: CrossAxisAlignment.start, mainAxisSize: MainAxisSize.min, children: [
      // Label always visible above the control.
      Text(label, style: TextStyle(color: context.ui.color.text, fontWeight: FontWeight.w600)),
      SizedBox(height: UiTokens.space(1)),
      SizedBox(
        height: error == null ? 40 : null,
        child: DropdownButtonFormField<String>(
          initialValue: selected,
          isExpanded: true,
          hint: placeholder == null ? null : Text(placeholder!),
          items: [for (final o in options) DropdownMenuItem(value: o.value, child: Text(o.label))],
          onChanged: disabled ? null : (v) { if (v != null) onChange?.call(v); },
          decoration: InputDecoration(
            isDense: true,
            errorText: error,
            contentPadding: EdgeInsets.symmetric(horizontal: UiTokens.space(3)),
            border: OutlineInputBorder(borderRadius: BorderRadius.circular(UiTokens.radiusMd)),
          ),
        ),
      ),
    ]);
  }
}
