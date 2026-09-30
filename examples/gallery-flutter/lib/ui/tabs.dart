import 'package:flutter/material.dart';
import 'theme.g.dart';

class UiTabsTab {
  const UiTabsTab({required this.value, required this.label});
  final String value;
  final String label;
}

class UiTabs extends StatelessWidget {
  const UiTabs({super.key, required this.tabs, required this.value, this.onChange, this.children = const []});

  final List<UiTabsTab> tabs;
  final String value;
  final ValueChanged<String>? onChange;
  final List<Widget> children;

  @override
  Widget build(BuildContext context) {
    // A plain Row of tab buttons driven directly by `value` (no TabController to keep in sync):
    // children are the content of the active tab, swapped in by the screen when value changes.
    return Column(
      crossAxisAlignment: CrossAxisAlignment.stretch,
      mainAxisSize: MainAxisSize.min,
      children: [
        Semantics(
          container: true,
          explicitChildNodes: true,
          child: SizedBox(
            height: 44,
            child: Row(
              children: [for (final t in tabs) Expanded(child: _tab(context, t))],
            ),
          ),
        ),
        Divider(height: 1, thickness: 1, color: context.ui.color.muted),
        ...children,
      ],
    );
  }

  Widget _tab(BuildContext context, UiTabsTab t) {
    final selected = t.value == value;
    return Semantics(
      selected: selected,
      button: true,
      label: t.label,
      child: InkWell(
        onTap: () => onChange?.call(t.value),
        child: Container(
          alignment: Alignment.center,
          decoration: BoxDecoration(
            border: Border(
              // Active tab is marked by a primary-colored indicator and bold text — not color alone.
              bottom: BorderSide(color: selected ? context.ui.color.primary : Colors.transparent, width: 2),
            ),
          ),
          child: Text(
            t.label,
            overflow: TextOverflow.ellipsis,
            style: TextStyle(
              color: selected ? context.ui.color.primary : context.ui.color.muted,
              fontWeight: selected ? FontWeight.w700 : FontWeight.w400,
            ),
          ),
        ),
      ),
    );
  }
}
