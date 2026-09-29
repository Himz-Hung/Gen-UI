import 'dart:ui' show SemanticsRole;

import 'package:flutter/material.dart';
import 'tokens.g.dart';

enum UiFormFieldDirection { vertical, horizontal }

class UiFormField extends StatelessWidget {
  const UiFormField({super.key, required this.label, this.hint, this.error, this.required = false, this.direction = UiFormFieldDirection.vertical, this.children = const []});

  final String label;
  final String? hint;
  final String? error;
  final bool required;
  final UiFormFieldDirection direction;
  final List<Widget> children;

  @override
  Widget build(BuildContext context) {
    final gapped = <Widget>[
      for (var i = 0; i < children.length; i++) ...[
        if (i > 0)
          direction == UiFormFieldDirection.horizontal ? SizedBox(width: UiTokens.space(3)) : SizedBox(height: UiTokens.space(3)),
        direction == UiFormFieldDirection.horizontal ? Expanded(child: children[i]) : children[i],
      ],
    ];
    return Semantics(
      role: SemanticsRole.form,
      label: error == null ? label : '$label, $error',
      isRequired: required,
      container: true,
      child: Column(crossAxisAlignment: CrossAxisAlignment.start, mainAxisSize: MainAxisSize.min, children: [
        Text.rich(TextSpan(text: label, style: const TextStyle(color: UiTokens.colorText, fontWeight: FontWeight.w600), children: [
          if (required) TextSpan(text: ' *', style: TextStyle(color: UiTokens.colorDanger)),
        ])),
        SizedBox(height: UiTokens.space(2)),
        direction == UiFormFieldDirection.horizontal
            ? Row(crossAxisAlignment: CrossAxisAlignment.start, children: gapped)
            : Column(crossAxisAlignment: CrossAxisAlignment.stretch, mainAxisSize: MainAxisSize.min, children: gapped),
        if (error != null) ...[
          SizedBox(height: UiTokens.space(2)),
          Text(error!, style: TextStyle(color: UiTokens.colorDanger, fontSize: 12)),
        ] else if (hint != null) ...[
          SizedBox(height: UiTokens.space(2)),
          Text(hint!, style: TextStyle(color: UiTokens.colorMuted, fontSize: 12)),
        ],
      ]),
    );
  }
}
