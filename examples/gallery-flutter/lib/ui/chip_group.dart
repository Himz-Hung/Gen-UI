import 'package:flutter/material.dart';
import 'icons.dart';
import 'theme.g.dart';
import 'tokens.g.dart';

class UiChipGroupOption {
  const UiChipGroupOption({required this.value, required this.label, this.icon, this.disabled});
  final String value;
  final String label;
  final String? icon;
  final bool? disabled;
}

enum UiChipGroupSize { sm, md }

class UiChipGroup extends StatelessWidget {
  const UiChipGroup({super.key, required this.label, required this.options, required this.value, this.multiple = true, this.size = UiChipGroupSize.md, this.wrap = true, this.onChange});

  final String label;
  final List<UiChipGroupOption> options;
  final List<String> value;
  final bool multiple;
  final UiChipGroupSize size;
  final bool wrap;
  final ValueChanged<List<String>>? onChange;

  double get _height => size == UiChipGroupSize.sm ? 28 : 32;

  void _toggle(UiChipGroupOption o) {
    final selected = value.contains(o.value);
    if (multiple) {
      final next = selected ? (List<String>.from(value)..remove(o.value)) : (List<String>.from(value)..add(o.value));
      onChange?.call(next);
    } else {
      // false: at most one selected, pressing it again clears it.
      onChange?.call(selected ? const [] : [o.value]);
    }
  }

  @override
  Widget build(BuildContext context) {
    final chips = [
      for (final o in options)
        _chip(context, o, value.contains(o.value)),
    ];
    return Semantics(
      container: true,
      label: label,
      child: wrap
          ? Wrap(spacing: UiTokens.space(2), runSpacing: UiTokens.space(2), children: chips)
          : SingleChildScrollView(
              scrollDirection: Axis.horizontal,
              child: Row(children: [for (final c in chips) Padding(padding: EdgeInsets.only(right: UiTokens.space(2)), child: c)]),
            ),
    );
  }

  Widget _chip(BuildContext context, UiChipGroupOption o, bool selected) {
    final enabled = o.disabled != true;
    return SizedBox(
      height: _height,
      child: FilterChip(
        // Selected chips use a primary tint with a check icon; state is never color alone.
        selected: selected,
        showCheckmark: true,
        avatar: o.icon == null ? null : Icon(uiIconData(o.icon!), size: 16),
        label: Text(o.label),
        visualDensity: VisualDensity.compact,
        materialTapTargetSize: MaterialTapTargetSize.shrinkWrap,
        shape: StadiumBorder(side: BorderSide(color: selected ? context.ui.color.primary : context.ui.color.muted.withValues(alpha: 0.3))),
        selectedColor: context.ui.color.primary.withValues(alpha: 0.15),
        checkmarkColor: context.ui.color.primary,
        onSelected: enabled ? (_) => _toggle(o) : null,
      ),
    );
  }
}
