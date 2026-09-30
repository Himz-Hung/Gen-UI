import 'package:flutter/material.dart';
import 'icons.dart';
import 'theme.g.dart';
import 'tokens.g.dart';

class UiMenuItem {
  const UiMenuItem({required this.value, required this.label, this.icon, this.danger, this.disabled});
  final String value;
  final String label;
  final String? icon;
  final bool? danger;
  final bool? disabled;
}

enum UiMenuAlign { start, end }

class UiMenu extends StatelessWidget {
  const UiMenu({super.key, required this.label, required this.items, this.align = UiMenuAlign.start, this.onSelect, this.children = const []});

  final String label;
  final List<UiMenuItem> items;
  final UiMenuAlign align;
  final ValueChanged<String>? onSelect;
  final List<Widget> children;

  @override
  Widget build(BuildContext context) {
    // danger items use tokens.color.danger text and come last.
    final ordered = [
      ...items.where((i) => i.danger != true),
      ...items.where((i) => i.danger == true),
    ];

    return MenuAnchor(
      alignmentOffset: const Offset(0, 4),
      // align: which edge of the trigger the menu lines up with.
      style: MenuStyle(
        alignment: align == UiMenuAlign.start ? AlignmentDirectional.bottomStart : AlignmentDirectional.bottomEnd,
        backgroundColor: WidgetStatePropertyAll(context.ui.color.surface),
        shape: WidgetStatePropertyAll(RoundedRectangleBorder(borderRadius: BorderRadius.circular(UiTokens.radiusMd))),
      ),
      menuChildren: [
        for (final item in ordered)
          MenuItemButton(
            // Roles menu / menuitem.
            leadingIcon: item.icon == null ? null : Icon(uiIconData(item.icon!), size: 18, color: item.danger == true ? context.ui.color.danger : null),
            onPressed: item.disabled == true ? null : () => onSelect?.call(item.value),
            child: Text(
              item.label,
              style: TextStyle(color: item.danger == true ? context.ui.color.danger : context.ui.color.text),
            ),
          ),
      ],
      builder: (context, controller, child) {
        return Semantics(
          label: label,
          button: true,
          child: GestureDetector(
            behavior: HitTestBehavior.opaque,
            onTap: () => controller.isOpen ? controller.close() : controller.open(),
            child: IgnorePointer(child: child),
          ),
        );
      },
      child: Column(mainAxisSize: MainAxisSize.min, children: children),
    );
  }
}
