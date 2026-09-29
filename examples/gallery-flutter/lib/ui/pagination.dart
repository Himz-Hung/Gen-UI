import 'package:flutter/material.dart';
import 'tokens.g.dart';

class UiPagination extends StatelessWidget {
  const UiPagination({super.key, required this.page, required this.pageCount, this.onChange});

  final int page;
  final int pageCount;
  final ValueChanged<int>? onChange;

  // At most 7 targets: n<=7 shows all; otherwise collapse the middle with an ellipsis around the current page.
  List<int?> _slots(int page, int count) {
    if (count <= 7) return [for (var i = 1; i <= count; i++) i];
    if (page <= 4) return [1, 2, 3, 4, 5, null, count];
    if (page >= count - 3) return [1, null, count - 4, count - 3, count - 2, count - 1, count];
    return [1, null, page - 1, page, page + 1, null, count];
  }

  @override
  Widget build(BuildContext context) {
    final count = pageCount.clamp(1, 1 << 30);
    final current = page.clamp(1, count);
    final slots = _slots(current, count);

    Widget navButton(IconData icon, String label, bool enabled, int target) {
      return IconButton(
        icon: Icon(icon, size: 18),
        tooltip: label,
        onPressed: enabled ? () => onChange?.call(target) : null,
        padding: EdgeInsets.zero,
        constraints: const BoxConstraints(minWidth: 32, minHeight: 32),
      );
    }

    Widget pageButton(int n) {
      final isCurrent = n == current;
      return Semantics(
        button: true,
        selected: isCurrent,
        label: 'Page $n',
        child: InkWell(
          borderRadius: BorderRadius.circular(UiTokens.radiusSm),
          // Never emits change for the current page.
          onTap: isCurrent ? null : () => onChange?.call(n),
          child: Container(
            width: 32,
            height: 32,
            alignment: Alignment.center,
            decoration: BoxDecoration(
              color: isCurrent ? UiTokens.colorPrimary : null,
              borderRadius: BorderRadius.circular(UiTokens.radiusSm),
            ),
            child: Text(
              '$n',
              style: TextStyle(
                color: isCurrent ? UiTokens.colorSurface : UiTokens.colorText,
                fontWeight: isCurrent ? FontWeight.w700 : FontWeight.w400,
              ),
            ),
          ),
        ),
      );
    }

    return Semantics(
      label: 'Pagination',
      container: true,
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          // Previous is disabled on page 1, Next on the last page.
          navButton(Icons.chevron_left, 'Previous page', current > 1, current - 1),
          for (final s in slots)
            Padding(
              padding: EdgeInsets.symmetric(horizontal: UiTokens.space(1)),
              child: s == null ? const Text('…', style: TextStyle(color: UiTokens.colorMuted)) : pageButton(s),
            ),
          navButton(Icons.chevron_right, 'Next page', current < count, current + 1),
        ],
      ),
    );
  }
}
