import 'package:flutter/material.dart';
import 'button.dart';
import 'drawer.dart';
import 'icons.dart';
import 'tokens.g.dart';

class UiSiteHeaderLink {
  const UiSiteHeaderLink({required this.value, required this.label, this.active});
  final String value;
  final String label;
  final bool? active;
}

class UiSiteHeaderAction {
  const UiSiteHeaderAction({required this.value, required this.label, this.icon, this.variant});
  final String value;
  final String label;
  final String? icon;
  final UiSiteHeaderVariant? variant;
}

enum UiSiteHeaderVariant { primary, secondary, ghost }

class UiSiteHeader extends StatefulWidget {
  const UiSiteHeader({super.key, required this.brand, this.logo, this.links = const [], this.actions = const [], required this.menuLabel, this.sticky = true, this.onBrandPress, this.onNavigate, this.onAction});

  final String brand;
  final String? logo;
  final List<UiSiteHeaderLink> links;
  final List<UiSiteHeaderAction> actions;
  final String menuLabel;
  final bool sticky;
  final VoidCallback? onBrandPress;
  final ValueChanged<String>? onNavigate;
  final ValueChanged<String>? onAction;

  @override
  State<UiSiteHeader> createState() => _UiSiteHeaderState();
}

class _UiSiteHeaderState extends State<UiSiteHeader> {
  bool _menuOpen = false;

  static UiButtonVariant _variant(UiSiteHeaderVariant? v) => switch (v) {
        UiSiteHeaderVariant.primary => UiButtonVariant.primary,
        UiSiteHeaderVariant.secondary => UiButtonVariant.secondary,
        _ => UiButtonVariant.ghost,
      };

  Widget _brand() => Semantics(
        link: true,
        label: widget.brand,
        excludeSemantics: true,
        child: InkWell(
          onTap: widget.onBrandPress,
          child: Row(mainAxisSize: MainAxisSize.min, children: [
            if (widget.logo != null) ...[
              Image.network(widget.logo!, height: 28, errorBuilder: (_, _, _) => const SizedBox.shrink()),
              SizedBox(width: UiTokens.space(2)),
            ],
            Text(widget.brand, style: const TextStyle(fontWeight: FontWeight.w800, fontSize: 18, color: UiTokens.colorText)),
          ]),
        ),
      );

  // The active link is marked by a bar and bold text, not color alone.
  Widget _link(UiSiteHeaderLink l) {
    final active = l.active ?? false;
    return Semantics(
      link: true,
      selected: active,
      label: l.label,
      excludeSemantics: true,
      child: InkWell(
        onTap: () => widget.onNavigate?.call(l.value),
        child: Container(
          height: 64,
          padding: EdgeInsets.symmetric(horizontal: UiTokens.space(3)),
          alignment: Alignment.center,
          decoration: BoxDecoration(border: Border(bottom: BorderSide(color: active ? UiTokens.colorPrimary : const Color(0x00000000), width: 3))),
          child: Text(l.label, style: TextStyle(fontWeight: active ? FontWeight.w700 : FontWeight.w500, color: UiTokens.colorText)),
        ),
      ),
    );
  }

  void _close() => setState(() => _menuOpen = false);

  @override
  Widget build(BuildContext context) {
    return LayoutBuilder(builder: (context, c) {
      final wide = c.maxWidth >= 768;
      final bar = Container(
        height: wide ? 64 : 56,
        padding: EdgeInsets.symmetric(horizontal: UiTokens.space(4)),
        decoration: BoxDecoration(color: UiTokens.colorSurface, border: Border(bottom: BorderSide(color: UiTokens.colorMuted.withValues(alpha: 0.25)))),
        child: Row(children: [
          _brand(),
          if (wide) ...[
            SizedBox(width: UiTokens.space(5)),
            Semantics(container: true, explicitChildNodes: true, child: Row(children: [for (final l in widget.links) _link(l)])),
            const Spacer(),
            for (final a in widget.actions) ...[
              SizedBox(width: UiTokens.space(2)),
              UiButton(label: a.label, icon: a.icon, variant: _variant(a.variant), size: UiButtonSize.sm, onPress: () => widget.onAction?.call(a.value)),
            ],
          ] else ...[
            const Spacer(),
            Semantics(
              button: true,
              expanded: _menuOpen,
              label: widget.menuLabel,
              excludeSemantics: true,
              child: IconButton(icon: Icon(uiIconData('menu')), tooltip: widget.menuLabel, onPressed: () => setState(() => _menuOpen = true)),
            ),
          ],
        ]),
      );
      if (wide) return Semantics(container: true, child: bar);
      // Narrow: a Drawer lists the links, then the actions as full-width buttons; choosing one closes it.
      return Column(mainAxisSize: MainAxisSize.min, crossAxisAlignment: CrossAxisAlignment.stretch, children: [
        bar,
        UiDrawer(open: _menuOpen, title: widget.brand, onClose: _close, children: [
          for (final l in widget.links)
            ListTile(
              title: Text(l.label, style: TextStyle(fontWeight: (l.active ?? false) ? FontWeight.w700 : FontWeight.w500)),
              selected: l.active ?? false,
              onTap: () { _close(); widget.onNavigate?.call(l.value); },
            ),
          if (widget.actions.isNotEmpty) SizedBox(height: UiTokens.space(3)),
          for (final a in widget.actions)
            Padding(
              padding: EdgeInsets.only(top: UiTokens.space(2)),
              child: UiButton(label: a.label, icon: a.icon, variant: _variant(a.variant), fullWidth: true, onPress: () { _close(); widget.onAction?.call(a.value); }),
            ),
        ]),
      ]);
    });
  }
}
