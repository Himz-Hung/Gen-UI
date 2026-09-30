import 'package:flutter/material.dart';
import 'theme.g.dart';
import 'tokens.g.dart';

class UiAvailabilityCalendarDay {
  const UiAvailabilityCalendarDay({required this.date, required this.status, this.priceLabel});
  final String date;
  final UiAvailabilityCalendarStatus status;
  final String? priceLabel;
}

enum UiAvailabilityCalendarStatus { available, limited, booked, closed }

enum UiAvailabilityCalendarWeekStart { monday, sunday }

class UiAvailabilityCalendarLegend {
  const UiAvailabilityCalendarLegend({required this.available, required this.limited, required this.booked, required this.closed});
  final String available;
  final String limited;
  final String booked;
  final String closed;
}

class UiAvailabilityCalendar extends StatelessWidget {
  const UiAvailabilityCalendar({super.key, required this.month, required this.days, this.selectedStart, this.selectedEnd, this.min, this.max, this.weekStart = UiAvailabilityCalendarWeekStart.monday, this.legend, this.onDayPress, this.onMonthChange});

  final String month;
  final List<UiAvailabilityCalendarDay> days;
  final String? selectedStart;
  final String? selectedEnd;
  final String? min;
  final String? max;
  final UiAvailabilityCalendarWeekStart weekStart;
  final UiAvailabilityCalendarLegend? legend;
  final ValueChanged<String>? onDayPress;
  final ValueChanged<String>? onMonthChange;

  static String _ym(DateTime d) => '${d.year.toString().padLeft(4, '0')}-${d.month.toString().padLeft(2, '0')}';
  static String _iso(DateTime d) => '${_ym(d)}-${d.day.toString().padLeft(2, '0')}';

  DateTime get _first {
    final p = month.split('-');
    return DateTime(int.tryParse(p.first) ?? DateTime.now().year, p.length > 1 ? int.tryParse(p[1]) ?? 1 : 1);
  }

  @override
  Widget build(BuildContext context) {
    final loc = MaterialLocalizations.of(context);
    final first = _first;
    final daysInMonth = DateTime(first.year, first.month + 1, 0).day;
    final startWeekday = weekStart == UiAvailabilityCalendarWeekStart.monday ? DateTime.monday : DateTime.sunday;
    final offset = (first.weekday - startWeekday) % 7;
    final byDate = {for (final d in days) d.date: d};
    final today = _iso(DateTime.now());
    final prev = DateTime(first.year, first.month - 1), next = DateTime(first.year, first.month + 1);
    final canPrev = min == null || _ym(prev).compareTo(min!) >= 0;
    final canNext = max == null || _ym(next).compareTo(max!) <= 0;
    // Weekday names from the platform locale, starting at weekStart.
    final names = loc.narrowWeekdays; // index 0 = Sunday
    final order = [for (var i = 0; i < 7; i++) (startWeekday % 7 + i) % 7];

    final cells = <Widget>[
      for (var i = 0; i < offset; i++) const SizedBox.shrink(),
      for (var d = 1; d <= daysInMonth; d++) _day(context, DateTime(first.year, first.month, d), byDate, today),
    ];
    final rows = <Widget>[];
    for (var i = 0; i < cells.length; i += 7) {
      final week = cells.sublist(i, (i + 7).clamp(0, cells.length));
      rows.add(Row(children: [for (var j = 0; j < 7; j++) Expanded(child: j < week.length ? week[j] : const SizedBox.shrink())]));
    }

    return Semantics(
      container: true,
      label: loc.formatMonthYear(first),
      child: Column(crossAxisAlignment: CrossAxisAlignment.stretch, mainAxisSize: MainAxisSize.min, children: [
        Row(children: [
          IconButton(icon: const Icon(Icons.chevron_left), tooltip: loc.previousMonthTooltip, onPressed: canPrev ? () => onMonthChange?.call(_ym(prev)) : null),
          Expanded(child: Center(child: Text(loc.formatMonthYear(first), style: TextStyle(fontWeight: FontWeight.w700, color: context.ui.color.text)))),
          IconButton(icon: const Icon(Icons.chevron_right), tooltip: loc.nextMonthTooltip, onPressed: canNext ? () => onMonthChange?.call(_ym(next)) : null),
        ]),
        Row(children: [for (final w in order) Expanded(child: Center(child: Text(names[w], style: TextStyle(color: context.ui.color.muted, fontSize: 12))))]),
        SizedBox(height: UiTokens.space(1)),
        ...rows,
        if (legend != null) ...[SizedBox(height: UiTokens.space(3)), _legend(context, legend!)],
      ]),
    );
  }

  bool _inRange(String iso) {
    if (selectedStart == null) return false;
    final end = selectedEnd ?? selectedStart!;
    return iso.compareTo(selectedStart!) >= 0 && iso.compareTo(end) <= 0;
  }

  Widget _day(BuildContext context, DateTime date, Map<String, UiAvailabilityCalendarDay> byDate, String today) {
    final iso = _iso(date);
    final info = byDate[iso];
    final status = info?.status ?? UiAvailabilityCalendarStatus.available;
    final pressable = status == UiAvailabilityCalendarStatus.available || status == UiAvailabilityCalendarStatus.limited;
    final isEnd = iso == selectedStart || iso == selectedEnd;
    final inRange = _inRange(iso);
    final muted = status == UiAvailabilityCalendarStatus.closed;
    final dayStyle = TextStyle(
      fontWeight: isEnd ? FontWeight.w700 : FontWeight.w500,
      color: isEnd ? context.ui.color.onPrimary : muted ? context.ui.color.muted.withValues(alpha: 0.5) : context.ui.color.text,
      // booked is struck through, closed dimmed, limited has a dot — never color alone.
      decoration: status == UiAvailabilityCalendarStatus.booked ? TextDecoration.lineThrough : null,
    );
    final statusName = status.name;
    final label = '${MaterialLocalizations.of(context).formatFullDate(date)}, $statusName${info?.priceLabel == null ? '' : ', ${info!.priceLabel}'}';
    final cell = Container(
      margin: const EdgeInsets.all(1),
      padding: EdgeInsets.symmetric(vertical: UiTokens.space(1)),
      decoration: BoxDecoration(
        color: isEnd ? context.ui.color.primary : inRange ? context.ui.color.primary.withValues(alpha: 0.12) : null,
        borderRadius: BorderRadius.circular(UiTokens.radiusSm),
        border: iso == today ? Border.all(color: context.ui.color.primary) : null,
      ),
      child: Column(mainAxisSize: MainAxisSize.min, children: [
        Text('${date.day}', style: dayStyle),
        if (info?.priceLabel != null)
          Text(info!.priceLabel!, style: TextStyle(fontSize: 10, color: isEnd ? context.ui.color.onPrimary : context.ui.color.muted))
        else
          const SizedBox(height: 12),
        SizedBox(
          height: 6,
          child: status == UiAvailabilityCalendarStatus.limited
              ? Container(width: 4, height: 4, decoration: BoxDecoration(color: isEnd ? context.ui.color.onPrimary : context.ui.color.primary, shape: BoxShape.circle))
              : null,
        ),
      ]),
    );
    return Semantics(
      button: pressable,
      enabled: pressable,
      selected: isEnd || inRange,
      label: label,
      excludeSemantics: true,
      // booked and closed days never emit dayPress.
      child: pressable ? InkWell(onTap: () => onDayPress?.call(iso), borderRadius: BorderRadius.circular(UiTokens.radiusSm), child: cell) : cell,
    );
  }

  Widget _legend(BuildContext context, UiAvailabilityCalendarLegend l) {
    Widget item(Widget mark, String text) => Row(mainAxisSize: MainAxisSize.min, children: [mark, SizedBox(width: UiTokens.space(1)), Text(text, style: TextStyle(fontSize: 12, color: context.ui.color.muted))]);
    Widget box({Color? fill, bool strike = false, bool dot = false}) => Container(
          width: 16,
          height: 16,
          alignment: Alignment.center,
          decoration: BoxDecoration(color: fill, border: Border.all(color: context.ui.color.muted.withValues(alpha: 0.4)), borderRadius: BorderRadius.circular(UiTokens.radiusSm)),
          child: strike ? Text('–', style: TextStyle(fontSize: 12, color: context.ui.color.muted)) : dot ? Container(width: 4, height: 4, decoration: BoxDecoration(color: context.ui.color.primary, shape: BoxShape.circle)) : null,
        );
    return Wrap(spacing: UiTokens.space(4), runSpacing: UiTokens.space(2), children: [
      item(box(), l.available),
      item(box(dot: true), l.limited),
      item(box(strike: true), l.booked),
      item(box(fill: context.ui.color.muted.withValues(alpha: 0.15)), l.closed),
    ]);
  }
}
