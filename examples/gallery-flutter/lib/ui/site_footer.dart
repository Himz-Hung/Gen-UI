import 'package:flutter/material.dart';
import 'icons.dart';
import 'theme.g.dart';
import 'tokens.g.dart';

class UiSiteFooterColumn {
  const UiSiteFooterColumn({required this.title, required this.links});
  final String title;
  final List<UiSiteFooterLink> links;
}

class UiSiteFooterLink {
  const UiSiteFooterLink({required this.value, required this.label});
  final String value;
  final String label;
}

class UiSiteFooterSocial {
  const UiSiteFooterSocial({required this.value, required this.label, required this.icon});
  final String value;
  final String label;
  final String icon;
}

class UiSiteFooter extends StatelessWidget {
  const UiSiteFooter({super.key, this.brand, this.description, this.columns = const [], this.social = const [], this.legal, this.onNavigate});

  final String? brand;
  final String? description;
  final List<UiSiteFooterColumn> columns;
  final List<UiSiteFooterSocial> social;
  final String? legal;
  final ValueChanged<String>? onNavigate;

  // Every link at least 44 tall.
  Widget _link(BuildContext context, UiSiteFooterLink l) => Semantics(
        link: true,
        label: l.label,
        excludeSemantics: true,
        child: InkWell(
          onTap: () => onNavigate?.call(l.value),
          child: Container(constraints: BoxConstraints(minHeight: 44), alignment: AlignmentDirectional.centerStart, child: Text(l.label, style: TextStyle(color: context.ui.color.text))),
        ),
      );

  Widget _column(BuildContext context, UiSiteFooterColumn c) => Semantics(
        container: true,
        label: c.title,
        child: Column(crossAxisAlignment: CrossAxisAlignment.start, mainAxisSize: MainAxisSize.min, children: [
          Text(c.title, style: TextStyle(fontWeight: FontWeight.w700, color: context.ui.color.text)),
          SizedBox(height: UiTokens.space(1)),
          for (final l in c.links) _link(context, l),
        ]),
      );

  Widget _brandBlock(BuildContext context) => Column(crossAxisAlignment: CrossAxisAlignment.start, mainAxisSize: MainAxisSize.min, children: [
        if (brand != null) Text(brand!, style: TextStyle(fontWeight: FontWeight.w800, fontSize: 18, color: context.ui.color.text)),
        if (description != null) ...[SizedBox(height: UiTokens.space(2)), Text(description!, style: TextStyle(color: context.ui.color.muted))],
      ]);

  Widget _social(BuildContext context) => Wrap(spacing: UiTokens.space(1), children: [
        for (final s in social) IconButton(icon: Icon(uiIconData(s.icon)), tooltip: s.label, onPressed: () => onNavigate?.call(s.value)),
      ]);

  @override
  Widget build(BuildContext context) {
    return LayoutBuilder(builder: (context, c) {
      final wide = c.maxWidth >= 768;
      final hasBrand = brand != null || description != null;
      final Widget body;
      if (wide) {
        body = Row(crossAxisAlignment: CrossAxisAlignment.start, children: [
          if (hasBrand) Expanded(flex: 2, child: _brandBlock(context)),
          for (final col in columns) Expanded(child: Padding(padding: EdgeInsets.only(left: UiTokens.space(4)), child: _column(context, col))),
          if (social.isNotEmpty) _social(context),
        ]);
      } else {
        // Narrow: everything stacks; with more than two columns each collapses under its title.
        final collapse = columns.length > 2;
        body = Column(crossAxisAlignment: CrossAxisAlignment.stretch, mainAxisSize: MainAxisSize.min, children: [
          if (hasBrand) ...[_brandBlock(context), SizedBox(height: UiTokens.space(4))],
          for (final col in columns)
            collapse
                ? ExpansionTile(
                    tilePadding: EdgeInsets.zero,
                    childrenPadding: EdgeInsets.zero,
                    expandedAlignment: Alignment.centerLeft,
                    title: Text(col.title, style: TextStyle(fontWeight: FontWeight.w700, color: context.ui.color.text)),
                    children: [for (final l in col.links) _link(context, l)],
                  )
                : Padding(padding: EdgeInsets.only(bottom: UiTokens.space(4)), child: _column(context, col)),
          if (social.isNotEmpty) _social(context),
        ]);
      }
      return Semantics(
        container: true,
        // A Material (not a colored box) so collapsible columns keep their ink feedback.
        child: Material(
          color: context.ui.color.muted.withValues(alpha: 0.08),
          child: Padding(
          padding: EdgeInsets.all(UiTokens.space(wide ? 6 : 4)),
          child: Column(crossAxisAlignment: CrossAxisAlignment.stretch, mainAxisSize: MainAxisSize.min, children: [
            body,
            if (legal != null) ...[
              SizedBox(height: UiTokens.space(5)),
              Divider(color: context.ui.color.muted.withValues(alpha: 0.25)),
              SizedBox(height: UiTokens.space(2)),
              Text(legal!, style: TextStyle(color: context.ui.color.muted, fontSize: 12)),
            ],
          ]),
          ),
        ),
      );
    });
  }
}
