import 'package:flutter/material.dart';
import 'theme.g.dart';
import 'tokens.g.dart';

class UiCheckbox extends StatelessWidget {
  const UiCheckbox({super.key, required this.label, required this.checked, this.disabled = false, this.onChange});

  final String label;
  final bool checked;
  final bool disabled;
  final ValueChanged<bool>? onChange;

  @override
  Widget build(BuildContext context) {
    final enabled = !disabled;
    void toggle() => onChange?.call(!checked);
    return Semantics(
      checked: checked,
      enabled: enabled,
      label: label,
      child: InkWell(
        onTap: enabled ? toggle : null,
        child: Padding(
          padding: EdgeInsets.symmetric(vertical: UiTokens.space(1)),
          child: Row(mainAxisSize: MainAxisSize.min, children: [
            SizedBox(
              width: 20,
              height: 20,
              child: Checkbox(
                value: checked,
                onChanged: enabled ? (v) => onChange?.call(v ?? false) : null,
                activeColor: context.ui.color.primary,
                materialTapTargetSize: MaterialTapTargetSize.shrinkWrap,
                visualDensity: VisualDensity.compact,
              ),
            ),
            SizedBox(width: UiTokens.space(2)),
            Flexible(child: Text(label, style: TextStyle(color: enabled ? context.ui.color.text : context.ui.color.muted))),
          ]),
        ),
      ),
    );
  }
}
