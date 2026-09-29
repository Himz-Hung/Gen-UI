import 'dart:async';

import 'package:flutter/material.dart';
import 'tokens.g.dart';

class UiPullToRefresh extends StatefulWidget {
  const UiPullToRefresh({super.key, required this.label, required this.refreshing, this.onRefresh, this.children = const []});

  final String label;
  final bool refreshing;
  final VoidCallback? onRefresh;
  final List<Widget> children;

  @override
  State<UiPullToRefresh> createState() => _UiPullToRefreshState();
}

class _UiPullToRefreshState extends State<UiPullToRefresh> {
  Completer<void>? _completer;

  @override
  void didUpdateWidget(covariant UiPullToRefresh oldWidget) {
    super.didUpdateWidget(oldWidget);
    // The indicator stays while refreshing=true; resolves once refreshing turns false.
    if (oldWidget.refreshing && !widget.refreshing) {
      _completer?.complete();
      _completer = null;
    }
  }

  @override
  void dispose() {
    _completer?.complete();
    super.dispose();
  }

  Future<void> _handleRefresh() {
    // Never emits refresh again while refreshing.
    if (widget.refreshing) return Future.value();
    widget.onRefresh?.call();
    final completer = Completer<void>();
    _completer = completer;
    // In case refreshing was already false by the time this frame settles, resolve promptly.
    if (!widget.refreshing) return Future.value();
    return completer.future;
  }

  @override
  Widget build(BuildContext context) {
    final content = widget.children.length == 1
        ? widget.children.first
        : Column(mainAxisSize: MainAxisSize.min, crossAxisAlignment: CrossAxisAlignment.stretch, children: widget.children);
    return Semantics(
      // The refresh action is also available to assistive tech: exposed as a tappable
      // action named by label, reachable without the pull gesture.
      label: widget.label,
      onTap: widget.refreshing ? null : () => _handleRefresh(),
      child: RefreshIndicator(
        color: UiTokens.colorPrimary,
        onRefresh: _handleRefresh,
        child: SingleChildScrollView(
          physics: const AlwaysScrollableScrollPhysics(),
          child: content,
        ),
      ),
    );
  }
}
