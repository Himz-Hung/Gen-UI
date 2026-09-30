import 'package:flutter/material.dart';
import 'icons.dart';
import 'theme.g.dart';

class UiBottomNavItem {
  const UiBottomNavItem({required this.value, required this.label, required this.icon, this.badge});
  final String value;
  final String label;
  final String icon;
  final String? badge;
}

class UiBottomNav extends StatelessWidget {
  const UiBottomNav({super.key, required this.items, required this.value, this.onChange});

  final List<UiBottomNavItem> items;
  final String value;
  final ValueChanged<String>? onChange;

  @override
  Widget build(BuildContext context) {
    // 3 to 5 items, each with an icon and a label.
    final shown = items.take(5).toList();
    if (shown.isEmpty) return const SizedBox.shrink();
    final index = shown.indexWhere((i) => i.value == value);
    final selectedIndex = index < 0 ? 0 : index;
    return Semantics(
      container: true,
      // Navigation landmark; stays fixed at the bottom above the safe area (the caller places this in
      // Scaffold.bottomNavigationBar, which already sits above the safe area and scrolling content).
      child: NavigationBar(
        selectedIndex: selectedIndex,
        // Pressing the active item again still emits change too.
        onDestinationSelected: (i) => onChange?.call(shown[i].value),
        destinations: [
          for (final item in shown)
            NavigationDestination(
              icon: _icon(context, item, selected: false),
              selectedIcon: _icon(context, item, selected: true),
              label: item.label,
              tooltip: item.badge == null ? item.label : '${item.label}, ${item.badge}',
            ),
        ],
      ),
    );
  }

  Widget _icon(BuildContext context, UiBottomNavItem item, {required bool selected}) {
    final icon = Icon(uiIconData(item.icon), color: selected ? context.ui.color.primary : null);
    if (item.badge == null) return icon;
    return Badge(label: Text(item.badge!), child: icon);
  }
}
