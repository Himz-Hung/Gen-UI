import 'package:flutter/material.dart';
import 'icons.dart';
import 'theme.g.dart';
import 'tokens.g.dart';

class UiBreadcrumbsItem {
  const UiBreadcrumbsItem({required this.value, required this.label});
  final String value;
  final String label;
}

class UiBreadcrumbs extends StatefulWidget {
  const UiBreadcrumbs({super.key, required this.items, this.onPress});

  final List<UiBreadcrumbsItem> items;
  final ValueChanged<String>? onPress;

  @override
  State<UiBreadcrumbs> createState() => _UiBreadcrumbsState();
}

class _UiBreadcrumbsState extends State<UiBreadcrumbs> {
  bool _expanded = false;

  @override
  void didUpdateWidget(covariant UiBreadcrumbs oldWidget) {
    super.didUpdateWidget(oldWidget);
    if (oldWidget.items != widget.items) _expanded = false;
  }

  @override
  Widget build(BuildContext context) {
    final items = widget.items;
    return Semantics(
      label: 'Breadcrumb',
      container: true,
      child: LayoutBuilder(
        builder: (context, constraints) {
          // Rough width estimate (chars * 8 + chevron) against the available width; only collapses
          // middle items when there are at least 4 (so the last item, which is never a link, stays clear).
          final approxWidth = items.fold<double>(0, (sum, i) => sum + i.label.length * 8 + 28);
          final shouldCollapse = !_expanded && items.length > 3 && approxWidth > constraints.maxWidth;
          final visible = shouldCollapse ? [items.first, null, items.last] : [for (final i in items) i];
          return Wrap(
            crossAxisAlignment: WrapCrossAlignment.center,
            children: [
              for (var i = 0; i < visible.length; i++) ...[
                if (i > 0) Padding(
                  padding: EdgeInsets.symmetric(horizontal: UiTokens.space(1)),
                  child: Icon(uiIconData('chevron-right'), size: 14, color: context.ui.color.muted),
                ),
                _crumb(visible[i], isLast: i == visible.length - 1),
              ],
            ],
          );
        },
      ),
    );
  }

  Widget _crumb(UiBreadcrumbsItem? item, {required bool isLast}) {
    if (item == null) {
      // The collapsed middle: expands the full trail on press.
      return TextButton(
        onPressed: () => setState(() => _expanded = true),
        style: TextButton.styleFrom(minimumSize: Size.zero, padding: EdgeInsets.symmetric(horizontal: UiTokens.space(1))),
        child: Text('…', style: TextStyle(color: context.ui.color.muted)),
      );
    }
    if (isLast) {
      // The last item is plain text and marked as the current page.
      return Semantics(
        label: '${item.label}, current page',
        child: ExcludeSemantics(
          child: Text(item.label, style: TextStyle(color: context.ui.color.text, fontWeight: FontWeight.w600)),
        ),
      );
    }
    return TextButton(
      onPressed: () => widget.onPress?.call(item.value),
      style: TextButton.styleFrom(minimumSize: Size.zero, padding: EdgeInsets.symmetric(horizontal: UiTokens.space(1))),
      child: Text(item.label, style: TextStyle(color: context.ui.color.muted)),
    );
  }
}
