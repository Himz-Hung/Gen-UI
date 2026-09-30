import 'package:flutter/material.dart';
import 'theme.g.dart';
import 'tokens.g.dart';

class UiDateRangePickerChangeEvent {
  const UiDateRangePickerChangeEvent({required this.start, required this.end});
  final String start;
  final String end;
}

/// A read-only field that opens the platform date-range picker. The range is validated against
/// disabledDates / minNights / maxNights before change is emitted; values stay ISO.
class UiDateRangePicker extends StatelessWidget {
  const UiDateRangePicker({super.key, required this.label, required this.start, required this.end, this.min, this.max, this.disabledDates = const [], this.minNights, this.maxNights, this.summary, this.placeholder, this.hint, this.error, this.disabled = false, this.onChange});

  final String label;
  final String start;
  final String end;
  final String? min;
  final String? max;
  final List<String> disabledDates;
  final int? minNights;
  final int? maxNights;
  final String? summary;
  final String? placeholder;
  final String? hint;
  final String? error;
  final bool disabled;
  final ValueChanged<UiDateRangePickerChangeEvent>? onChange;

  static DateTime? _parse(String? iso) => iso == null || iso.isEmpty ? null : DateTime.tryParse(iso);
  static String _iso(DateTime d) => '${d.year.toString().padLeft(4, '0')}-${d.month.toString().padLeft(2, '0')}-${d.day.toString().padLeft(2, '0')}';

  /// Nights between start and end that are disabled; a range may not cross any of them.
  bool crossesDisabled(DateTime s, DateTime e) {
    final blocked = disabledDates.map(_parse).whereType<DateTime>().map(_iso).toSet();
    for (var d = s; d.isBefore(e); d = DateTime(d.year, d.month, d.day + 1)) {
      if (blocked.contains(_iso(d))) return true;
    }
    return false;
  }

  /// Whether [s, e] is a range the contract allows.
  bool isAllowed(DateTime s, DateTime e) {
    final nights = DateTime.utc(e.year, e.month, e.day).difference(DateTime.utc(s.year, s.month, s.day)).inDays;
    if (nights < 1) return false;
    if (minNights != null && nights < minNights!) return false;
    if (maxNights != null && nights > maxNights!) return false;
    return !crossesDisabled(s, e);
  }

  Future<void> _open(BuildContext context) async {
    final now = DateTime.now();
    final first = _parse(min) ?? DateTime(now.year, now.month, now.day);
    final last = _parse(max) ?? DateTime(first.year + 2, first.month, first.day);
    final s = _parse(start), e = _parse(end);
    final blocked = disabledDates.map(_parse).whereType<DateTime>().map(_iso).toSet();
    final picked = await showDateRangePicker(
      context: context,
      firstDate: first,
      lastDate: last,
      initialDateRange: s != null && e != null && !e.isBefore(s) ? DateTimeRange(start: s, end: e) : null,
      helpText: label,
      selectableDayPredicate: (day, _, _) => !blocked.contains(_iso(day)),
    );
    // change is emitted only for a complete, allowed range.
    if (picked != null && isAllowed(picked.start, picked.end)) {
      onChange?.call(UiDateRangePickerChangeEvent(start: _iso(picked.start), end: _iso(picked.end)));
    }
  }

  @override
  Widget build(BuildContext context) {
    final loc = MaterialLocalizations.of(context);
    final s = _parse(start), e = _parse(end);
    final text = s == null ? '' : '${loc.formatMediumDate(s)} – ${e == null ? '' : loc.formatMediumDate(e)}';
    return Column(crossAxisAlignment: CrossAxisAlignment.start, mainAxisSize: MainAxisSize.min, children: [
      Text(label, style: TextStyle(color: context.ui.color.text, fontWeight: FontWeight.w600)),
      SizedBox(height: UiTokens.space(1)),
      Semantics(
        button: true,
        enabled: !disabled,
        label: '$label${text.isEmpty ? '' : ', $text'}',
        excludeSemantics: true,
        child: InkWell(
          onTap: disabled ? null : () => _open(context),
          borderRadius: BorderRadius.circular(UiTokens.radiusMd),
          child: InputDecorator(
            isEmpty: text.isEmpty,
            decoration: InputDecoration(
              isDense: true,
              hintText: placeholder,
              errorText: error,
              helperText: error == null ? (summary ?? hint) : null,
              enabled: !disabled,
              suffixIcon: const Icon(Icons.date_range_outlined),
              contentPadding: EdgeInsets.symmetric(horizontal: UiTokens.space(3), vertical: UiTokens.space(3)),
              border: OutlineInputBorder(borderRadius: BorderRadius.circular(UiTokens.radiusMd)),
            ),
            child: Text(text, style: TextStyle(color: context.ui.color.text)),
          ),
        ),
      ),
    ]);
  }
}
