import 'package:flutter/gestures.dart';
import 'package:flutter/material.dart';
import 'tokens.g.dart';

enum UiRichTextSize { sm, md, lg }

enum UiRichTextColor { defaultValue, muted }

/// A small Markdown subset: paragraphs, **bold**, *italic*, [links](url), "- " / "1. " lists, "## " / "### " headings.
/// Anything else is shown as plain text — never executed or embedded.
class UiRichText extends StatefulWidget {
  const UiRichText({super.key, required this.markdown, this.size = UiRichTextSize.md, this.color = UiRichTextColor.defaultValue, this.onLink});

  final String markdown;
  final UiRichTextSize size;
  final UiRichTextColor color;
  final ValueChanged<String>? onLink;

  @override
  State<UiRichText> createState() => _UiRichTextState();
}

class _UiRichTextState extends State<UiRichText> {
  final List<TapGestureRecognizer> _recognizers = [];

  @override
  void dispose() {
    for (final r in _recognizers) { r.dispose(); }
    super.dispose();
  }

  double get _fontSize => switch (widget.size) { UiRichTextSize.sm => 13, UiRichTextSize.md => 15, UiRichTextSize.lg => 17 };
  Color get _color => widget.color == UiRichTextColor.muted ? UiTokens.colorMuted : UiTokens.colorText;

  static final _inline = RegExp(r'\*\*(.+?)\*\*|\*(.+?)\*|\[([^\]]+)\]\(([^)\s]+)\)');

  List<InlineSpan> _spans(String text) {
    final out = <InlineSpan>[];
    var at = 0;
    for (final m in _inline.allMatches(text)) {
      if (m.start > at) out.add(TextSpan(text: text.substring(at, m.start)));
      if (m[1] != null) {
        out.add(TextSpan(text: m[1], style: const TextStyle(fontWeight: FontWeight.w700)));
      } else if (m[2] != null) {
        out.add(TextSpan(text: m[2], style: const TextStyle(fontStyle: FontStyle.italic)));
      } else {
        // Links emit onLink instead of navigating by themselves.
        final url = m[4]!;
        final r = TapGestureRecognizer()..onTap = () => widget.onLink?.call(url);
        _recognizers.add(r);
        out.add(TextSpan(text: m[3], recognizer: r, style: const TextStyle(color: UiTokens.colorPrimary, decoration: TextDecoration.underline), semanticsLabel: m[3]));
      }
      at = m.end;
    }
    if (at < text.length) out.add(TextSpan(text: text.substring(at)));
    return out;
  }

  Widget _para(String text, {TextStyle? style}) => Text.rich(TextSpan(children: _spans(text)), style: TextStyle(fontSize: _fontSize, color: _color, height: 1.5).merge(style));

  @override
  Widget build(BuildContext context) {
    for (final r in _recognizers) { r.dispose(); }
    _recognizers.clear();
    final blocks = <Widget>[];
    // Blank lines separate paragraphs.
    for (final block in widget.markdown.replaceAll('\r\n', '\n').split(RegExp(r'\n\s*\n'))) {
      final lines = block.split('\n').where((l) => l.trim().isNotEmpty).toList();
      if (lines.isEmpty) continue;
      final first = lines.first.trimLeft();
      if (first.startsWith('### ') || first.startsWith('## ')) {
        final level3 = first.startsWith('### ');
        blocks.add(Semantics(header: true, child: _para(first.substring(level3 ? 4 : 3), style: TextStyle(fontSize: level3 ? 18 : 22, fontWeight: FontWeight.w700, color: UiTokens.colorText))));
        if (lines.length > 1) blocks.add(_para(lines.skip(1).join(' ')));
      } else if (lines.every((l) => RegExp(r'^\s*(-|\d+\.)\s+').hasMatch(l))) {
        final ordered = RegExp(r'^\s*\d+\.').hasMatch(lines.first);
        blocks.add(Semantics(
          container: true,
          child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
            for (var i = 0; i < lines.length; i++)
              Row(crossAxisAlignment: CrossAxisAlignment.start, children: [
                SizedBox(width: 24, child: Text(ordered ? '${i + 1}.' : '•', style: TextStyle(fontSize: _fontSize, color: _color, height: 1.5))),
                Expanded(child: _para(lines[i].replaceFirst(RegExp(r'^\s*(-|\d+\.)\s+'), ''))),
              ]),
          ]),
        ));
      } else {
        blocks.add(_para(lines.join(' ')));
      }
    }
    return Column(crossAxisAlignment: CrossAxisAlignment.stretch, mainAxisSize: MainAxisSize.min, children: [
      for (var i = 0; i < blocks.length; i++) ...[if (i > 0) SizedBox(height: UiTokens.space(3)), blocks[i]],
    ]);
  }
}
