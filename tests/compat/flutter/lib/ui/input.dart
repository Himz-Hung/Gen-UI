import 'package:flutter/material.dart';
import 'tokens.g.dart';

enum UiInputType { text, email, password, number, tel }

class UiInput extends StatefulWidget {
  const UiInput({super.key, required this.label, required this.value, this.placeholder, this.type = UiInputType.text, this.hint, this.error, this.disabled = false, this.required = false, this.revealLabel, this.onChange, this.onSubmit});

  final String label;
  final String value;
  final String? placeholder;
  final UiInputType type;
  final String? hint;
  final String? error;
  final bool disabled;
  final bool required;
  final String? revealLabel;
  final ValueChanged<String>? onChange;
  final VoidCallback? onSubmit;

  @override
  State<UiInput> createState() => _UiInputState();
}

class _UiInputState extends State<UiInput> {
  late final TextEditingController _controller = TextEditingController(text: widget.value);
  bool _revealed = false;
  final FocusNode _revealFocus = FocusNode(skipTraversal: true, canRequestFocus: false);

  @override
  void didUpdateWidget(covariant UiInput oldWidget) {
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
    _revealFocus.dispose();
    super.dispose();
  }

  TextInputType get _keyboardType => switch (widget.type) {
        UiInputType.email => TextInputType.emailAddress,
        UiInputType.number => const TextInputType.numberWithOptions(decimal: true),
        UiInputType.tel => TextInputType.phone,
        UiInputType.text || UiInputType.password => TextInputType.text,
      };

  /// type=password: a toggle named by revealLabel (or the label) whose pressed state says whether the text shows.
  /// It never takes focus, so the cursor stays in the field, and it never submits.
  Widget _revealControl() {
    final name = widget.revealLabel ?? widget.label;
    return Semantics(
      button: true,
      toggled: _revealed,
      label: name,
      excludeSemantics: true,
      child: IconButton(
        focusNode: _revealFocus,
        tooltip: name,
        icon: Icon(_revealed ? Icons.visibility_off_outlined : Icons.visibility_outlined),
        onPressed: widget.disabled ? null : () => setState(() => _revealed = !_revealed),
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    // MergeSemantics: the visible label becomes the field's accessible name (one node: label + field)
    return MergeSemantics(child: Column(crossAxisAlignment: CrossAxisAlignment.start, mainAxisSize: MainAxisSize.min, children: [
      // Label always visible above the field; required shows a marker.
      Text.rich(TextSpan(text: widget.label, style: const TextStyle(color: UiTokens.colorText, fontWeight: FontWeight.w600), children: [
        if (widget.required) TextSpan(text: ' *', style: TextStyle(color: UiTokens.colorDanger)),
      ])),
      SizedBox(height: UiTokens.space(1)),
      SizedBox(
        height: widget.error == null && widget.hint == null ? 40 : null,
        child: Semantics(
          isRequired: widget.required,
          child: TextField(
            controller: _controller,
            enabled: !widget.disabled,
            obscureText: widget.type == UiInputType.password && !_revealed,
            keyboardType: _keyboardType,
            textInputAction: TextInputAction.done,
            onChanged: (v) => widget.onChange?.call(v),
            onSubmitted: (_) => widget.onSubmit?.call(),
            decoration: InputDecoration(
              isDense: true,
              hintText: widget.placeholder,
              suffixIcon: widget.type == UiInputType.password ? _revealControl() : null,
              errorText: widget.error,
              helperText: widget.error == null ? widget.hint : null,
              contentPadding: EdgeInsets.symmetric(horizontal: UiTokens.space(3)),
              border: OutlineInputBorder(borderRadius: BorderRadius.circular(UiTokens.radiusMd)),
              errorBorder: OutlineInputBorder(borderRadius: BorderRadius.circular(UiTokens.radiusMd), borderSide: BorderSide(color: UiTokens.colorDanger)),
            ),
          ),
        ),
      ),
    ]));
  }
}
