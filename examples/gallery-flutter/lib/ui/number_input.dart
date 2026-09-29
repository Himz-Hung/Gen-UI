import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'tokens.g.dart';

class UiNumberInput extends StatefulWidget {
  const UiNumberInput({super.key, required this.label, required this.value, this.min, this.max, this.step = 1.0, this.hint, this.error, this.disabled = false, this.onChange});

  final String label;
  final double value;
  final double? min;
  final double? max;
  final double step;
  final String? hint;
  final String? error;
  final bool disabled;
  final ValueChanged<double>? onChange;

  @override
  State<UiNumberInput> createState() => _UiNumberInputState();
}

class _UiNumberInputState extends State<UiNumberInput> {
  late final TextEditingController _controller = TextEditingController(text: _format(widget.value));
  final FocusNode _focusNode = FocusNode();

  static String _format(double v) => v == v.truncateToDouble() ? v.toInt().toString() : v.toString();

  double _clamp(double v) {
    var r = v;
    if (widget.min != null) r = r < widget.min! ? widget.min! : r;
    if (widget.max != null) r = r > widget.max! ? widget.max! : r;
    return r;
  }

  @override
  void initState() {
    super.initState();
    _focusNode.addListener(_onFocusChange);
  }

  void _onFocusChange() {
    // Typed values outside the range are clamped on blur.
    if (!_focusNode.hasFocus) {
      final parsed = double.tryParse(_controller.text);
      final resolved = _clamp(parsed ?? widget.value);
      _controller.text = _format(resolved);
      if (resolved != widget.value) widget.onChange?.call(resolved);
    }
  }

  @override
  void didUpdateWidget(covariant UiNumberInput oldWidget) {
    super.didUpdateWidget(oldWidget);
    final current = double.tryParse(_controller.text);
    if (current != widget.value) {
      _controller.text = _format(widget.value);
    }
  }

  @override
  void dispose() {
    _focusNode.removeListener(_onFocusChange);
    _focusNode.dispose();
    _controller.dispose();
    super.dispose();
  }

  void _step(double delta) {
    final resolved = _clamp(widget.value + delta);
    _controller.text = _format(resolved);
    widget.onChange?.call(resolved);
  }

  @override
  Widget build(BuildContext context) {
    final atMin = widget.min != null && widget.value <= widget.min!;
    final atMax = widget.max != null && widget.value >= widget.max!;
    return Column(crossAxisAlignment: CrossAxisAlignment.start, mainAxisSize: MainAxisSize.min, children: [
      Text(widget.label, style: const TextStyle(color: UiTokens.colorText, fontWeight: FontWeight.w600)),
      SizedBox(height: UiTokens.space(1)),
      Semantics(
        // spinButton role assertions are not implemented by this Flutter
        // version yet; min/max/value are still exposed for a11y.
        minValue: widget.min?.toString(),
        maxValue: widget.max?.toString(),
        value: _format(widget.value),
        child: SizedBox(
          height: widget.error == null && widget.hint == null ? 40 : null,
          child: Row(crossAxisAlignment: CrossAxisAlignment.start, children: [
            _StepButton(
              icon: Icons.remove,
              tooltip: 'Decrease ${widget.label}',
              onPressed: widget.disabled || atMin ? null : () => _step(-widget.step),
            ),
            SizedBox(width: UiTokens.space(2)),
            Expanded(
              child: TextField(
                controller: _controller,
                focusNode: _focusNode,
                enabled: !widget.disabled,
                textAlign: TextAlign.center,
                keyboardType: const TextInputType.numberWithOptions(decimal: true, signed: true),
                inputFormatters: [FilteringTextInputFormatter.allow(RegExp(r'^-?\d*\.?\d*$'))],
                onChanged: (v) {
                  final parsed = double.tryParse(v);
                  if (parsed != null) widget.onChange?.call(parsed);
                },
                decoration: InputDecoration(
                  isDense: true,
                  errorText: widget.error,
                  helperText: widget.error == null ? widget.hint : null,
                  contentPadding: EdgeInsets.symmetric(horizontal: UiTokens.space(3)),
                  border: OutlineInputBorder(borderRadius: BorderRadius.circular(UiTokens.radiusMd)),
                ),
              ),
            ),
            SizedBox(width: UiTokens.space(2)),
            _StepButton(
              icon: Icons.add,
              tooltip: 'Increase ${widget.label}',
              onPressed: widget.disabled || atMax ? null : () => _step(widget.step),
            ),
          ]),
        ),
      ),
    ]);
  }
}

class _StepButton extends StatelessWidget {
  const _StepButton({required this.icon, required this.tooltip, required this.onPressed});

  final IconData icon;
  final String tooltip;
  final VoidCallback? onPressed;

  @override
  Widget build(BuildContext context) {
    return SizedBox(
      width: 40,
      height: 40,
      child: IconButton(
        padding: EdgeInsets.zero,
        constraints: const BoxConstraints.tightFor(width: 40, height: 40),
        tooltip: tooltip,
        icon: Icon(icon),
        onPressed: onPressed,
        style: IconButton.styleFrom(
          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(UiTokens.radiusMd)),
          side: BorderSide(color: UiTokens.colorMuted.withValues(alpha: 0.3)),
        ),
      ),
    );
  }
}
