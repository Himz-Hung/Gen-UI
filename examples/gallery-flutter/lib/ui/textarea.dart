import 'package:flutter/material.dart';
import 'tokens.g.dart';

class UiTextarea extends StatefulWidget {
  const UiTextarea({super.key, required this.label, required this.value, this.placeholder, this.rows = 3, this.autoGrow = false, this.maxLength, this.hint, this.error, this.disabled = false, this.required = false, this.onChange});

  final String label;
  final String value;
  final String? placeholder;
  final int rows;
  final bool autoGrow;
  final int? maxLength;
  final String? hint;
  final String? error;
  final bool disabled;
  final bool required;
  final ValueChanged<String>? onChange;

  @override
  State<UiTextarea> createState() => _UiTextareaState();
}

class _UiTextareaState extends State<UiTextarea> {
  late final TextEditingController _controller = TextEditingController(text: widget.value);

  @override
  void didUpdateWidget(covariant UiTextarea oldWidget) {
    super.didUpdateWidget(oldWidget);
    if (widget.value != _controller.text) {
      final offset = _controller.selection.baseOffset;
      _controller.value = TextEditingValue(
        text: widget.value,
        selection: TextSelection.collapsed(offset: offset.clamp(0, widget.value.length)),
      );
    }
  }

  @override
  void dispose() {
    _controller.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final rows = widget.rows;
    final maxLength = widget.maxLength;
    return Column(crossAxisAlignment: CrossAxisAlignment.start, mainAxisSize: MainAxisSize.min, children: [
      Text.rich(TextSpan(text: widget.label, style: const TextStyle(color: UiTokens.colorText, fontWeight: FontWeight.w600), children: [
        if (widget.required) TextSpan(text: ' *', style: TextStyle(color: UiTokens.colorDanger)),
      ])),
      SizedBox(height: UiTokens.space(1)),
      Semantics(
        isRequired: widget.required,
        multiline: true,
        child: TextField(
          controller: _controller,
          enabled: !widget.disabled,
          minLines: rows,
          // Enter always inserts a new line; it never submits.
          maxLines: widget.autoGrow ? 10 : rows,
          maxLength: maxLength,
          buildCounter: maxLength == null
              ? null
              : (context, {required currentLength, required isFocused, required maxLength}) => Text(
                    '$currentLength / $maxLength',
                    style: TextStyle(color: UiTokens.colorMuted, fontSize: 12),
                  ),
          onChanged: (v) => widget.onChange?.call(v),
          decoration: InputDecoration(
            isDense: true,
            hintText: widget.placeholder,
            errorText: widget.error,
            helperText: widget.error == null ? widget.hint : null,
            contentPadding: EdgeInsets.symmetric(horizontal: UiTokens.space(3), vertical: UiTokens.space(2)),
            border: OutlineInputBorder(borderRadius: BorderRadius.circular(UiTokens.radiusMd)),
            errorBorder: OutlineInputBorder(borderRadius: BorderRadius.circular(UiTokens.radiusMd), borderSide: BorderSide(color: UiTokens.colorDanger)),
          ),
        ),
      ),
    ]);
  }
}
