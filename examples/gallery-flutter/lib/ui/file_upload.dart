import 'dart:ui' show SemanticsRole;

import 'package:flutter/material.dart';
import 'theme.g.dart';
import 'tokens.g.dart';

class UiFileUploadFile {
  const UiFileUploadFile({required this.name, required this.sizeLabel});
  final String name;
  final String sizeLabel;
}

class UiFileUpload extends StatelessWidget {
  const UiFileUpload({super.key, required this.label, required this.buttonLabel, this.accept, this.multiple = false, this.files = const [], this.hint, this.error, this.disabled = false, this.onSelect, this.onRemove});

  final String label;
  final String buttonLabel;
  final String? accept;
  final bool multiple;
  final List<UiFileUploadFile> files;
  final String? hint;
  final String? error;
  final bool disabled;
  final VoidCallback? onSelect;
  final ValueChanged<String>? onRemove;

  @override
  Widget build(BuildContext context) {
    final enabled = !disabled;
    return Column(crossAxisAlignment: CrossAxisAlignment.start, mainAxisSize: MainAxisSize.min, children: [
      Text(label, style: TextStyle(color: context.ui.color.text, fontWeight: FontWeight.w600)),
      SizedBox(height: UiTokens.space(1)),
      Container(
        padding: EdgeInsets.all(UiTokens.space(3)),
        decoration: BoxDecoration(
          border: Border.all(color: error != null ? context.ui.color.danger : context.ui.color.muted.withValues(alpha: 0.3)),
          borderRadius: BorderRadius.circular(UiTokens.radiusMd),
        ),
        child: Column(crossAxisAlignment: CrossAxisAlignment.start, mainAxisSize: MainAxisSize.min, children: [
          OutlinedButton.icon(
            onPressed: enabled ? onSelect : null,
            icon: const Icon(Icons.upload_file),
            label: Text(buttonLabel),
          ),
          if (files.isNotEmpty) ...[
            SizedBox(height: UiTokens.space(2)),
            Semantics(
              role: SemanticsRole.list,
              child: Column(
                mainAxisSize: MainAxisSize.min,
                children: [
                  for (final f in files)
                    Semantics(
                      role: SemanticsRole.listItem,
                      child: Padding(
                        padding: EdgeInsets.symmetric(vertical: UiTokens.space(1)),
                        child: Row(children: [
                          Icon(Icons.insert_drive_file_outlined, size: 18, color: context.ui.color.muted),
                          SizedBox(width: UiTokens.space(2)),
                          Expanded(child: Text(f.name, overflow: TextOverflow.ellipsis)),
                          SizedBox(width: UiTokens.space(2)),
                          Text(f.sizeLabel, style: TextStyle(color: context.ui.color.muted, fontSize: 12)),
                          Semantics(
                            label: 'Remove ${f.name}',
                            button: true,
                            child: IconButton(
                              icon: const Icon(Icons.close, size: 18),
                              onPressed: enabled ? () => onRemove?.call(f.name) : null,
                            ),
                          ),
                        ]),
                      ),
                    ),
                ],
              ),
            ),
          ],
        ]),
      ),
      if (error != null) ...[
        SizedBox(height: UiTokens.space(1)),
        Text(error!, style: TextStyle(color: context.ui.color.danger, fontSize: 12)),
      ] else if (hint != null) ...[
        SizedBox(height: UiTokens.space(1)),
        Text(hint!, style: TextStyle(color: context.ui.color.muted, fontSize: 12)),
      ],
    ]);
  }
}
