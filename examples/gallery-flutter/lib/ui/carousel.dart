import 'package:flutter/material.dart';
import 'theme.g.dart';
import 'tokens.g.dart';

class UiCarousel extends StatefulWidget {
  const UiCarousel({super.key, required this.label, this.index = 0, this.loop = false, this.showDots = true, this.showArrows = true, this.onChange, this.children = const []});

  final String label;
  final int index;
  final bool loop;
  final bool showDots;
  final bool showArrows;
  final ValueChanged<int>? onChange;
  final List<Widget> children;

  @override
  State<UiCarousel> createState() => _UiCarouselState();
}

class _UiCarouselState extends State<UiCarousel> {
  late PageController _controller;

  int get _count => widget.children.length;
  int get _clampedIndex => _count == 0 ? 0 : widget.index.clamp(0, _count - 1);

  @override
  void initState() {
    super.initState();
    _controller = PageController(initialPage: _clampedIndex);
  }

  @override
  void didUpdateWidget(covariant UiCarousel oldWidget) {
    super.didUpdateWidget(oldWidget);
    final target = _clampedIndex;
    if (_controller.hasClients && _controller.page?.round() != target) {
      _controller.animateToPage(target, duration: const Duration(milliseconds: 200), curve: Curves.ease);
    }
  }

  @override
  void dispose() {
    _controller.dispose();
    super.dispose();
  }

  void _go(int delta) {
    if (_count == 0) return;
    var next = _clampedIndex + delta;
    if (next < 0) {
      next = widget.loop ? _count - 1 : 0;
    } else if (next > _count - 1) {
      next = widget.loop ? 0 : _count - 1;
    }
    if (next == _clampedIndex) return;
    if (_controller.hasClients) {
      _controller.animateToPage(next, duration: const Duration(milliseconds: 200), curve: Curves.ease);
    }
  }

  @override
  Widget build(BuildContext context) {
    if (_count == 0) return const SizedBox.shrink();
    // Never advances by itself: only user swipes, arrow presses or dot taps change the page.
    final pageView = PageView(
      controller: _controller,
      onPageChanged: (i) => widget.onChange?.call(i),
      children: widget.children,
    );
    final region = Semantics(
      container: true,
      label: '${widget.label}, slide ${_clampedIndex + 1} of $_count',
      child: LayoutBuilder(builder: (context, constraints) {
        return constraints.hasBoundedHeight ? pageView : AspectRatio(aspectRatio: 16 / 9, child: pageView);
      }),
    );
    return Column(mainAxisSize: MainAxisSize.min, children: [
      Stack(alignment: Alignment.center, children: [
        region,
        if (widget.showArrows && _count > 1) ...[
          Align(
            alignment: Alignment.centerLeft,
            child: IconButton(
              tooltip: 'Previous slide',
              icon: const Icon(Icons.chevron_left),
              onPressed: () => _go(-1),
            ),
          ),
          Align(
            alignment: Alignment.centerRight,
            child: IconButton(
              tooltip: 'Next slide',
              icon: const Icon(Icons.chevron_right),
              onPressed: () => _go(1),
            ),
          ),
        ],
      ]),
      if (widget.showDots && _count > 1) ...[
        SizedBox(height: UiTokens.space(2)),
        Row(
          mainAxisSize: MainAxisSize.min,
          children: [
            for (var i = 0; i < _count; i++)
              Padding(
                padding: EdgeInsets.symmetric(horizontal: UiTokens.space(1) / 2),
                child: GestureDetector(
                  onTap: () => _go(i - _clampedIndex),
                  child: Container(
                    width: 8,
                    height: 8,
                    decoration: BoxDecoration(
                      shape: BoxShape.circle,
                      color: i == _clampedIndex ? context.ui.color.primary : context.ui.color.muted.withValues(alpha: 0.3),
                    ),
                  ),
                ),
              ),
          ],
        ),
      ],
    ]);
  }
}
