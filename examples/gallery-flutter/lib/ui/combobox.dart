import 'package:flutter/material.dart';
import 'theme.g.dart';
import 'tokens.g.dart';

class UiComboboxOption {
  const UiComboboxOption({required this.value, required this.label, this.description});
  final String value;
  final String label;
  final String? description;
}

class UiCombobox extends StatefulWidget {
  const UiCombobox({super.key, required this.label, required this.value, required this.query, required this.options, this.placeholder, this.loading = false, this.emptyText, this.hint, this.error, this.disabled = false, this.onSearch, this.onChange});

  final String label;
  final String value;
  final String query;
  final List<UiComboboxOption> options;
  final String? placeholder;
  final bool loading;
  final String? emptyText;
  final String? hint;
  final String? error;
  final bool disabled;
  final ValueChanged<String>? onSearch;
  final ValueChanged<String>? onChange;

  @override
  State<UiCombobox> createState() => _UiComboboxState();
}

class _UiComboboxState extends State<UiCombobox> {
  late final TextEditingController _controller = TextEditingController(text: widget.query);
  final FocusNode _focusNode = FocusNode();
  bool _open = false;

  @override
  void initState() {
    super.initState();
    _focusNode.addListener(() => setState(() => _open = _focusNode.hasFocus));
  }

  @override
  void didUpdateWidget(covariant UiCombobox oldWidget) {
    super.didUpdateWidget(oldWidget);
    if (widget.query != _controller.text) {
      final offset = _controller.selection.baseOffset;
      _controller.value = TextEditingValue(
        text: widget.query,
        selection: TextSelection.collapsed(offset: offset.clamp(0, widget.query.length)),
      );
    }
  }

  @override
  void dispose() {
    _controller.dispose();
    _focusNode.dispose();
    super.dispose();
  }

  void _choose(UiComboboxOption o) {
    _controller.text = o.label;
    widget.onChange?.call(o.value);
    _focusNode.unfocus();
    setState(() => _open = false);
  }

  @override
  Widget build(BuildContext context) {
    final showList = _open && !widget.disabled && (widget.options.isNotEmpty || widget.loading || (widget.query.isNotEmpty && widget.emptyText != null));
    return Column(crossAxisAlignment: CrossAxisAlignment.start, mainAxisSize: MainAxisSize.min, children: [
      Text(widget.label, style: TextStyle(color: context.ui.color.text, fontWeight: FontWeight.w600)),
      SizedBox(height: UiTokens.space(1)),
      Semantics(
        // comboBox role assertions are not implemented by this Flutter
        // version yet; expanded state is still exposed for a11y.
        expanded: showList,
        child: SizedBox(
          height: widget.error == null && widget.hint == null ? 40 : null,
          child: TextField(
            controller: _controller,
            focusNode: _focusNode,
            enabled: !widget.disabled,
            onChanged: (v) => widget.onSearch?.call(v),
            decoration: InputDecoration(
              isDense: true,
              hintText: widget.placeholder,
              errorText: widget.error,
              helperText: widget.error == null ? widget.hint : null,
              contentPadding: EdgeInsets.symmetric(horizontal: UiTokens.space(3)),
              border: OutlineInputBorder(borderRadius: BorderRadius.circular(UiTokens.radiusMd)),
            ),
          ),
        ),
      ),
      if (showList)
        Container(
          margin: EdgeInsets.only(top: UiTokens.space(1)),
          constraints: const BoxConstraints(maxHeight: 240),
          decoration: BoxDecoration(
            border: Border.all(color: context.ui.color.muted.withValues(alpha: 0.3)),
            borderRadius: BorderRadius.circular(UiTokens.radiusMd),
          ),
          child: widget.loading
              ? Padding(
                  padding: EdgeInsets.all(UiTokens.space(3)),
                  child: Row(mainAxisSize: MainAxisSize.min, children: [
                    SizedBox.square(dimension: 16, child: CircularProgressIndicator(strokeWidth: 2, color: context.ui.color.primary)),
                    SizedBox(width: UiTokens.space(2)),
                    const Text('Loading…'),
                  ]),
                )
              : widget.options.isEmpty
                  ? Padding(
                      padding: EdgeInsets.all(UiTokens.space(3)),
                      child: Text(widget.emptyText ?? '', style: TextStyle(color: context.ui.color.muted)),
                    )
                  : Column(
                      mainAxisSize: MainAxisSize.min,
                      children: [
                        for (final o in widget.options)
                          InkWell(
                            onTap: () => _choose(o),
                            child: Padding(
                              padding: EdgeInsets.symmetric(horizontal: UiTokens.space(3), vertical: UiTokens.space(2)),
                              child: Column(crossAxisAlignment: CrossAxisAlignment.start, mainAxisSize: MainAxisSize.min, children: [
                                Text(o.label),
                                if (o.description != null)
                                  Text(o.description!, style: TextStyle(color: context.ui.color.muted, fontSize: 12)),
                              ]),
                            ),
                          ),
                      ],
                    ),
        ),
    ]);
  }
}
