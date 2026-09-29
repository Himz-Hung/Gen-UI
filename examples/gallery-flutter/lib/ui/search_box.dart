import 'dart:ui' show SemanticsInputType;

import 'package:flutter/material.dart';
import 'tokens.g.dart';

class UiSearchBox extends StatefulWidget {
  const UiSearchBox({super.key, required this.value, this.placeholder = 'Search', this.loading = false, this.onChange, this.onSearch, this.onClear});

  final String value;
  final String placeholder;
  final bool loading;
  final ValueChanged<String>? onChange;
  final ValueChanged<String>? onSearch;
  final VoidCallback? onClear;

  @override
  State<UiSearchBox> createState() => _UiSearchBoxState();
}

class _UiSearchBoxState extends State<UiSearchBox> {
  late final TextEditingController _controller = TextEditingController(text: widget.value);

  @override
  void initState() {
    super.initState();
    _controller.addListener(_onControllerChanged);
  }

  void _onControllerChanged() => setState(() {});

  @override
  void didUpdateWidget(covariant UiSearchBox oldWidget) {
    super.didUpdateWidget(oldWidget);
    if (widget.value != _controller.text) {
      final offset = _controller.selection.baseOffset;
      _controller.value = TextEditingValue(
        text: widget.value,
        selection: TextSelection.collapsed(offset: offset.clamp(0, widget.value.length)),
      );
    }
  }

  @override
  void dispose() {
    _controller.removeListener(_onControllerChanged);
    _controller.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Semantics(
      inputType: SemanticsInputType.search,
      child: SizedBox(
        height: 40,
        child: TextField(
          controller: _controller,
          textInputAction: TextInputAction.search,
          onChanged: (v) => widget.onChange?.call(v),
          onSubmitted: (v) => widget.onSearch?.call(v),
          decoration: InputDecoration(
            isDense: true,
            hintText: widget.placeholder,
            // loading shows a spinner in place of the search icon.
            prefixIcon: widget.loading
                ? Padding(
                    padding: EdgeInsets.all(UiTokens.space(3)),
                    child: SizedBox.square(dimension: 16, child: CircularProgressIndicator(strokeWidth: 2, color: UiTokens.colorPrimary)),
                  )
                : Icon(Icons.search, color: UiTokens.colorMuted),
            // Clear control is visible only when value is non-empty.
            suffixIcon: _controller.text.isEmpty
                ? null
                : Semantics(
                    label: 'Clear',
                    button: true,
                    child: IconButton(
                      icon: const Icon(Icons.close),
                      onPressed: () {
                        _controller.clear();
                        widget.onChange?.call('');
                        widget.onClear?.call();
                      },
                    ),
                  ),
            contentPadding: EdgeInsets.symmetric(horizontal: UiTokens.space(3)),
            border: OutlineInputBorder(borderRadius: BorderRadius.circular(UiTokens.radiusMd)),
          ),
        ),
      ),
    );
  }
}
