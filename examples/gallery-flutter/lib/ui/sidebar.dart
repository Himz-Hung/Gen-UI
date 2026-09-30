import 'package:flutter/material.dart';
import 'icons.dart';
import 'theme.g.dart';
import 'tokens.g.dart';

class UiSidebarItem {
  const UiSidebarItem({required this.value, required this.label, this.icon, this.badge, this.section});
  final String value;
  final String label;
  final String? icon;
  final String? badge;
  final String? section;
}

class UiSidebar extends StatelessWidget {
  const UiSidebar({super.key, required this.items, required this.value, this.title, this.collapsed = false, this.onChange, this.onToggle});

  final List<UiSidebarItem> items;
  final String value;
  final String? title;
  final bool collapsed;
  final ValueChanged<String>? onChange;
  final VoidCallback? onToggle;

  // Group items by section, keeping the first-appearance order of both sections and items.
  List<MapEntry<String?, List<UiSidebarItem>>> get _groups {
    final order = <String?>[];
    final byKey = <String?, List<UiSidebarItem>>{};
    for (final item in items) {
      final key = item.section;
      if (!byKey.containsKey(key)) {
        order.add(key);
        byKey[key] = [];
      }
      byKey[key]!.add(item);
    }
    return [for (final k in order) MapEntry(k, byKey[k]!)];
  }

  @override
  Widget build(BuildContext context) {
    return Semantics(
      // Navigation landmark named by title.
      label: title,
      container: true,
      child: Container(
        width: collapsed ? 64 : 240,
        color: context.ui.color.surface,
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.stretch,
          mainAxisSize: MainAxisSize.min,
          children: [
            if (title != null && !collapsed)
              Padding(
                padding: EdgeInsets.fromLTRB(UiTokens.space(4), UiTokens.space(4), UiTokens.space(4), UiTokens.space(2)),
                child: Text(title!, style: TextStyle(color: context.ui.color.text, fontWeight: FontWeight.w700, fontSize: 16)),
              ),
            if (onToggle != null)
              Align(
                alignment: collapsed ? Alignment.center : Alignment.centerRight,
                child: Semantics(
                  button: true,
                  expanded: !collapsed,
                  label: collapsed ? 'Expand' : 'Collapse',
                  excludeSemantics: true,
                  child: IconButton(
                    icon: Icon(collapsed ? Icons.chevron_right : Icons.chevron_left),
                    tooltip: collapsed ? 'Expand' : 'Collapse',
                    onPressed: onToggle,
                  ),
                ),
              ),
            for (final g in _groups) ..._section(context, g.key, g.value),
          ],
        ),
      ),
    );
  }

  List<Widget> _section(BuildContext context, String? section, List<UiSidebarItem> items) {
    return [
      if (section != null && !collapsed)
        Padding(
          padding: EdgeInsets.fromLTRB(UiTokens.space(4), UiTokens.space(4), UiTokens.space(4), UiTokens.space(1)),
          child: Text(section, style: TextStyle(color: context.ui.color.muted, fontWeight: FontWeight.w600, fontSize: 12)),
        ),
      for (final item in items) _item(context, item),
    ];
  }

  Widget _item(BuildContext context, UiSidebarItem item) {
    final selected = item.value == value;
    final icon = item.icon == null ? null : Icon(uiIconData(item.icon!), size: 20, color: selected ? context.ui.color.primary : context.ui.color.muted);
    // Collapsed: badges become a dot instead of the text.
    final badgeDot = item.badge == null || !collapsed
        ? null
        : Container(width: 8, height: 8, decoration: BoxDecoration(color: context.ui.color.danger, shape: BoxShape.circle));

    final row = SizedBox(
      height: 40,
      child: Material(
        color: selected ? context.ui.color.primary.withValues(alpha: 0.08) : Colors.transparent,
        child: InkWell(
          onTap: () => onChange?.call(item.value),
          child: Padding(
            padding: EdgeInsets.symmetric(horizontal: collapsed ? UiTokens.space(3) : UiTokens.space(4)),
            child: Row(
              mainAxisAlignment: collapsed ? MainAxisAlignment.center : MainAxisAlignment.start,
              children: [
                Stack(clipBehavior: Clip.none, children: [
                  ?icon,
                  if (badgeDot != null) Positioned(right: -2, top: -2, child: badgeDot),
                ]),
                if (!collapsed) ...[
                  SizedBox(width: UiTokens.space(3)),
                  Expanded(
                    child: Text(
                      item.label,
                      overflow: TextOverflow.ellipsis,
                      style: TextStyle(
                        color: selected ? context.ui.color.primary : context.ui.color.text,
                        fontWeight: selected ? FontWeight.w700 : FontWeight.w400,
                      ),
                    ),
                  ),
                  // Expanded: badge shows its text.
                  if (item.badge != null)
                    Container(
                      padding: EdgeInsets.symmetric(horizontal: UiTokens.space(2)),
                      decoration: BoxDecoration(color: context.ui.color.muted.withValues(alpha: 0.15), borderRadius: BorderRadius.circular(UiTokens.radiusFull)),
                      child: Text(item.badge!, style: TextStyle(color: context.ui.color.muted, fontSize: 12)),
                    ),
                ],
              ],
            ),
          ),
        ),
      ),
    );

    final semanticRow = Semantics(button: true, selected: selected, label: item.label, excludeSemantics: true, child: row);
    // Collapsed: labels hide and show as tooltips.
    return collapsed ? Tooltip(message: item.label, child: semanticRow) : semanticRow;
  }
}
