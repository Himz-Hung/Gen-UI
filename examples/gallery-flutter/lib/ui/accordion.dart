import 'package:flutter/material.dart';
import 'tokens.g.dart';

class UiAccordionItem {
  const UiAccordionItem({required this.value, required this.title});
  final String value;
  final String title;
}

class UiAccordion extends StatelessWidget {
  const UiAccordion({super.key, required this.items, required this.open, this.multiple = false, this.onChange, this.children = const []});

  final List<UiAccordionItem> items;
  final List<String> open;
  final bool multiple;
  final ValueChanged<List<String>>? onChange;
  final List<Widget> children;

  void _toggle(String value) {
    final isOpen = open.contains(value);
    final next = multiple
        ? (isOpen ? open.where((v) => v != value).toList() : [...open, value])
        : (isOpen ? <String>[] : [value]);
    onChange?.call(next);
  }

  @override
  Widget build(BuildContext context) {
    final divider = Divider(height: 1, thickness: 1, color: UiTokens.colorMuted.withValues(alpha: 0.2));
    final rows = <Widget>[];
    for (var i = 0; i < items.length; i++) {
      final item = items[i];
      final isOpen = open.contains(item.value);
      if (i != 0) rows.add(divider);
      rows.add(
        Column(crossAxisAlignment: CrossAxisAlignment.stretch, mainAxisSize: MainAxisSize.min, children: [
          Semantics(
            button: true,
            expanded: isOpen,
            label: item.title,
            child: InkWell(
              onTap: () => _toggle(item.value),
              child: Padding(
                padding: EdgeInsets.symmetric(horizontal: UiTokens.space(4), vertical: UiTokens.space(3)),
                child: Row(children: [
                  Expanded(child: Text(item.title, style: const TextStyle(color: UiTokens.colorText, fontWeight: FontWeight.w600))),
                  AnimatedRotation(
                    turns: isOpen ? 0.5 : 0,
                    duration: const Duration(milliseconds: 150),
                    child: const Icon(Icons.expand_more, color: UiTokens.colorMuted),
                  ),
                ]),
              ),
            ),
          ),
          // children[i] is the content of items[i]; a closed section keeps its content out of the layout entirely.
          if (isOpen && i < children.length)
            Padding(
              padding: EdgeInsets.fromLTRB(UiTokens.space(4), 0, UiTokens.space(4), UiTokens.space(3)),
              child: children[i],
            ),
        ]),
      );
    }
    return Semantics(container: true, child: Column(mainAxisSize: MainAxisSize.min, children: rows));
  }
}
