import 'package:flutter/material.dart';
import 'theme.g.dart';

class UiSlider extends StatelessWidget {
  const UiSlider({super.key, required this.label, required this.value, required this.min, required this.max, this.step = 1.0, this.valueLabel, this.disabled = false, this.onChange, this.onCommit});

  final String label;
  final double value;
  final double min;
  final double max;
  final double step;
  final String? valueLabel;
  final bool disabled;
  final ValueChanged<double>? onChange;
  final ValueChanged<double>? onCommit;

  double _clamp(double v) {
    final clamped = v.clamp(min, max);
    if (step <= 0) return clamped;
    final snapped = min + ((clamped - min) / step).round() * step;
    return snapped.clamp(min, max);
  }

  @override
  Widget build(BuildContext context) {
    final v = _clamp(value);
    final divisions = step > 0 && max > min ? ((max - min) / step).round().clamp(1, 1 << 20) : null;
    // MergeSemantics: the visible label becomes the field's accessible name (one node: label + field)
    return MergeSemantics(child: Column(crossAxisAlignment: CrossAxisAlignment.start, mainAxisSize: MainAxisSize.min, children: [
      Row(children: [
        Expanded(child: Text(label, style: TextStyle(color: context.ui.color.text, fontWeight: FontWeight.w600))),
        if (valueLabel != null) Text(valueLabel!, style: TextStyle(color: context.ui.color.muted)),
      ]),
      SliderTheme(
        data: SliderTheme.of(context).copyWith(activeTrackColor: context.ui.color.primary, thumbColor: context.ui.color.primary),
        child: Slider(
          value: v,
          min: min,
          max: max,
          divisions: divisions,
          label: valueLabel ?? v.toString(),
          onChanged: disabled ? null : (nv) => onChange?.call(_clamp(nv)),
          onChangeEnd: disabled ? null : (nv) => onCommit?.call(_clamp(nv)),
          semanticFormatterCallback: (_) => valueLabel ?? v.toString(),
        ),
      ),
    ]));
  }
}
