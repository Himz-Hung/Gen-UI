import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'theme.g.dart';
import 'tokens.g.dart';

enum UiPinInputType { numeric, alphanumeric }

class UiPinInput extends StatefulWidget {
  const UiPinInput({super.key, required this.label, required this.value, this.length = 6, this.type = UiPinInputType.numeric, this.mask = false, this.error, this.disabled = false, this.onChange, this.onComplete});

  final String label;
  final String value;
  final int length;
  final UiPinInputType type;
  final bool mask;
  final String? error;
  final bool disabled;
  final ValueChanged<String>? onChange;
  final ValueChanged<String>? onComplete;

  @override
  State<UiPinInput> createState() => _UiPinInputState();
}

class _UiPinInputState extends State<UiPinInput> {
  late final TextEditingController _controller = TextEditingController(text: widget.value);
  final FocusNode _focusNode = FocusNode();

  int get _length => widget.length;

  @override
  void initState() {
    super.initState();
    _focusNode.addListener(() => setState(() {}));
    _controller.addListener(() => setState(() {}));
  }

  @override
  void didUpdateWidget(covariant UiPinInput oldWidget) {
    super.didUpdateWidget(oldWidget);
    if (widget.value != _controller.text) {
      _controller.value = TextEditingValue(
        text: widget.value,
        selection: TextSelection.collapsed(offset: widget.value.length),
      );
    }
  }

  @override
  void dispose() {
    _controller.dispose();
    _focusNode.dispose();
    super.dispose();
  }

  void _onChanged(String v) {
    widget.onChange?.call(v);
    // All boxes filled, or a full code was pasted in one shot.
    if (v.length == _length) widget.onComplete?.call(v);
  }

  @override
  Widget build(BuildContext context) {
    final text = _controller.text;
    return Column(crossAxisAlignment: CrossAxisAlignment.start, mainAxisSize: MainAxisSize.min, children: [
      Text(widget.label, style: TextStyle(color: context.ui.color.text, fontWeight: FontWeight.w600)),
      SizedBox(height: UiTokens.space(1)),
      Semantics(
        label: widget.label,
        textField: true,
        enabled: !widget.disabled,
        value: text,
        maxValueLength: _length,
        currentValueLength: text.length,
        child: GestureDetector(
          onTap: widget.disabled ? null : () => _focusNode.requestFocus(),
          child: Stack(children: [
            Row(
              mainAxisSize: MainAxisSize.min,
              children: [
                for (var i = 0; i < _length; i++) ...[
                  if (i > 0) SizedBox(width: UiTokens.space(2)),
                  _PinBox(
                    char: i < text.length ? text[i] : '',
                    mask: widget.mask,
                    focused: _focusNode.hasFocus && i == text.length,
                    error: widget.error != null,
                  ),
                ],
              ],
            ),
            Positioned.fill(
              child: Opacity(
                opacity: 0,
                alwaysIncludeSemantics: true,
                child: TextField(
                  controller: _controller,
                  focusNode: _focusNode,
                  enabled: !widget.disabled,
                  autofillHints: const [AutofillHints.oneTimeCode],
                  keyboardType: widget.type == UiPinInputType.numeric ? TextInputType.number : TextInputType.text,
                  inputFormatters: [
                    LengthLimitingTextInputFormatter(_length),
                    if (widget.type == UiPinInputType.numeric) FilteringTextInputFormatter.digitsOnly,
                  ],
                  showCursor: false,
                  decoration: null,
                  onChanged: _onChanged,
                ),
              ),
            ),
          ]),
        ),
      ),
      if (widget.error != null) ...[
        SizedBox(height: UiTokens.space(1)),
        Text(widget.error!, style: TextStyle(color: context.ui.color.danger, fontSize: 12)),
      ],
    ]);
  }
}

class _PinBox extends StatelessWidget {
  const _PinBox({required this.char, required this.mask, required this.focused, required this.error});

  final String char;
  final bool mask;
  final bool focused;
  final bool error;

  @override
  Widget build(BuildContext context) {
    final borderColor = error ? context.ui.color.danger : (focused ? context.ui.color.primary : context.ui.color.muted.withValues(alpha: 0.4));
    return Container(
      width: 44,
      height: 52,
      alignment: Alignment.center,
      decoration: BoxDecoration(
        border: Border.all(color: borderColor, width: focused ? 2 : 1),
        borderRadius: BorderRadius.circular(UiTokens.radiusMd),
      ),
      child: Text(
        char.isEmpty ? '' : (mask ? '•' : char),
        style: TextStyle(color: context.ui.color.text, fontSize: 20, fontWeight: FontWeight.w600),
      ),
    );
  }
}
