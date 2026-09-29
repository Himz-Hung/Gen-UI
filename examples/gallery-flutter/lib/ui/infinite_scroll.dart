import 'package:flutter/material.dart';
import 'tokens.g.dart';

class UiInfiniteScroll extends StatefulWidget {
  const UiInfiniteScroll({super.key, required this.loading, required this.hasMore, required this.loadMoreLabel, this.endText, this.onLoadMore, this.children = const []});

  final bool loading;
  final bool hasMore;
  final String loadMoreLabel;
  final String? endText;
  final VoidCallback? onLoadMore;
  final List<Widget> children;

  @override
  State<UiInfiniteScroll> createState() => _UiInfiniteScrollState();
}

class _UiInfiniteScrollState extends State<UiInfiniteScroll> {
  // Guards against emitting loadMore more than once per request.
  bool _pending = false;

  @override
  void didUpdateWidget(covariant UiInfiniteScroll oldWidget) {
    super.didUpdateWidget(oldWidget);
    if (oldWidget.loading && !widget.loading) {
      _pending = false;
    }
    if (!widget.hasMore) {
      _pending = false;
    }
  }

  void _maybeLoadMore() {
    // Emits loadMore once, and never while loading or when hasMore is false.
    if (widget.loading || !widget.hasMore || _pending) return;
    setState(() => _pending = true);
    widget.onLoadMore?.call();
  }

  @override
  Widget build(BuildContext context) {
    return NotificationListener<ScrollNotification>(
      onNotification: (notification) {
        final metrics = notification.metrics;
        // Trigger when the end comes within about one screen height.
        if (metrics.maxScrollExtent - metrics.pixels <= metrics.viewportDimension) {
          _maybeLoadMore();
        }
        return false;
      },
      child: Column(
        mainAxisSize: MainAxisSize.min,
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          // Items already shown never move: appended purely below the existing children.
          ...widget.children,
          if (widget.loading)
            Padding(
              padding: EdgeInsets.symmetric(vertical: UiTokens.space(4)),
              child: const Center(child: SizedBox.square(dimension: 24, child: CircularProgressIndicator(strokeWidth: 2))),
            ),
          if (widget.hasMore)
            // A load-more button is always present as a fallback for keyboard/assistive tech/failed loads.
            Padding(
              padding: EdgeInsets.symmetric(vertical: UiTokens.space(2)),
              child: Center(
                child: TextButton(
                  onPressed: widget.loading ? null : _maybeLoadMore,
                  child: Text(widget.loadMoreLabel),
                ),
              ),
            )
          else if (widget.endText != null)
            Padding(
              padding: EdgeInsets.symmetric(vertical: UiTokens.space(4)),
              child: Center(
                child: Semantics(
                  liveRegion: true,
                  child: Text(widget.endText!, style: TextStyle(color: UiTokens.colorMuted)),
                ),
              ),
            ),
        ],
      ),
    );
  }
}
