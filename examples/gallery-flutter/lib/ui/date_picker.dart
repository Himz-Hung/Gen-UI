import 'package:flutter/material.dart';
import 'tokens.g.dart';

class UiDatePicker extends StatefulWidget {
  const UiDatePicker({super.key, required this.label, required this.value, this.min, this.max, this.placeholder, this.hint, this.error, this.disabled = false, this.onChange});

  final String label;
  final String value;
  final String? min;
  final String? max;
  final String? placeholder;
  final String? hint;
  final String? error;
  final bool disabled;
  final ValueChanged<String>? onChange;

  @override
  State<UiDatePicker> createState() => _UiDatePickerState();
}

class _UiDatePickerState extends State<UiDatePicker> {
  static DateTime? _parseIso(String? s) {
    if (s == null || s.isEmpty) return null;
    return DateTime.tryParse(s);
  }

  DateTime get _firstDate => _parseIso(widget.min) ?? DateTime(1900);
  DateTime get _lastDate => _parseIso(widget.max) ?? DateTime(2100);

  static String _toIso(DateTime d) => DateUtils.dateOnly(d).toIso8601String().substring(0, 10);

  Future<void> _open() async {
    if (widget.disabled) return;
    final current = _parseIso(widget.value);
    final initial = (current ?? DateTime.now()).clamp(_firstDate, _lastDate);
    final picked = await showDatePicker(context: context, initialDate: initial, firstDate: _firstDate, lastDate: _lastDate);
    if (picked != null) widget.onChange?.call(_toIso(picked));
  }

  @override
  Widget build(BuildContext context) {
    final date = _parseIso(widget.value);
    // The field shows the date formatted for the current locale; value/change stay ISO.
    final displayText = date == null ? '' : MaterialLocalizations.of(context).formatMediumDate(date);
    return Column(crossAxisAlignment: CrossAxisAlignment.start, mainAxisSize: MainAxisSize.min, children: [
      Text(widget.label, style: const TextStyle(color: UiTokens.colorText, fontWeight: FontWeight.w600)),
      SizedBox(height: UiTokens.space(1)),
      Semantics(
        button: true,
        enabled: !widget.disabled,
        label: widget.label,
        value: displayText,
        child: InkWell(
          onTap: _open,
          borderRadius: BorderRadius.circular(UiTokens.radiusMd),
          child: InputDecorator(
            decoration: InputDecoration(
              isDense: true,
              enabled: !widget.disabled,
              hintText: widget.placeholder,
              errorText: widget.error,
              helperText: widget.error == null ? widget.hint : null,
              suffixIcon: Icon(Icons.calendar_today_outlined, size: 18, color: UiTokens.colorMuted),
              contentPadding: EdgeInsets.symmetric(horizontal: UiTokens.space(3), vertical: UiTokens.space(3)),
              border: OutlineInputBorder(borderRadius: BorderRadius.circular(UiTokens.radiusMd)),
            ),
            child: Text(
              displayText,
              style: TextStyle(color: widget.disabled ? UiTokens.colorMuted : UiTokens.colorText),
            ),
          ),
        ),
      ),
    ]);
  }
}

extension on DateTime {
  DateTime clamp(DateTime min, DateTime max) {
    if (isBefore(min)) return min;
    if (isAfter(max)) return max;
    return this;
  }
}
