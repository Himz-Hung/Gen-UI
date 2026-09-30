import 'package:flutter/material.dart';
import 'theme.g.dart';
import 'tokens.g.dart';

class UiSwitch extends StatelessWidget {
  const UiSwitch({super.key, required this.label, required this.checked, this.description, this.disabled = false, this.onChange});

  final String label;
  final bool checked;
  final String? description;
  final bool disabled;
  final ValueChanged<bool>? onChange;

  @override
  Widget build(BuildContext context) {
    final enabled = !disabled;
    void toggle() => onChange?.call(!checked);
    return Semantics(
      toggled: checked,
      enabled: enabled,
      label: label,
      child: InkWell(
        onTap: enabled ? toggle : null,
        child: Padding(
          padding: EdgeInsets.symmetric(vertical: UiTokens.space(1)),
          child: Row(children: [
            // Label leads, switch trails; pressing the label toggles it too.
            Expanded(
              child: Column(crossAxisAlignment: CrossAxisAlignment.start, mainAxisSize: MainAxisSize.min, children: [
                Text(label, style: TextStyle(color: enabled ? context.ui.color.text : context.ui.color.muted, fontWeight: FontWeight.w600)),
                if (description != null)
                  Text(description!, style: TextStyle(color: context.ui.color.muted, fontSize: 12)),
              ]),
            ),
            SizedBox(width: UiTokens.space(3)),
            SizedBox(
              width: 44,
              height: 24,
              child: FittedBox(
                child: Switch(
                  value: checked,
                  onChanged: enabled ? (v) => onChange?.call(v) : null,
                  activeTrackColor: context.ui.color.primary,
                ),
              ),
            ),
          ]),
        ),
      ),
    );
  }
}
