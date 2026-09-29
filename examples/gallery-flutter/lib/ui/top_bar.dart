import 'package:flutter/material.dart';
import 'icons.dart';
import 'tokens.g.dart';

class UiTopBarAction {
  const UiTopBarAction({required this.icon, required this.label, required this.action});
  final String icon;
  final String label;
  final String action;
}

class UiTopBar extends StatelessWidget {
  const UiTopBar({super.key, required this.title, this.showBack = false, this.actions = const [], this.onBack, this.onActionPress});

  final String title;
  final bool showBack;
  final List<UiTopBarAction> actions;
  final VoidCallback? onBack;
  final ValueChanged<String>? onActionPress;

  @override
  Widget build(BuildContext context) {
    // Sticking to the top while scrolling is the parent's job (e.g. wrap in a SliverAppBar/pinned header);
    // this widget only renders the fixed 56px bar itself.
    return Semantics(
      header: true,
      container: true,
      child: SizedBox(
        height: 56,
        child: Material(
          color: UiTokens.colorSurface,
          child: Padding(
            padding: EdgeInsets.symmetric(horizontal: UiTokens.space(2)),
            child: Row(
              children: [
                if (showBack)
                  IconButton(
                    icon: Icon(uiIconData('back')),
                    tooltip: 'Back',
                    onPressed: onBack,
                  )
                else
                  SizedBox(width: UiTokens.space(2)),
                Expanded(
                  child: Text(
                    title,
                    maxLines: 1,
                    overflow: TextOverflow.ellipsis,
                    style: const TextStyle(color: UiTokens.colorText, fontWeight: FontWeight.w700, fontSize: 18),
                  ),
                ),
                for (final a in actions)
                  IconButton(
                    icon: Icon(uiIconData(a.icon)),
                    tooltip: a.label,
                    onPressed: () => onActionPress?.call(a.action),
                  ),
              ],
            ),
          ),
        ),
      ),
    );
  }
}
