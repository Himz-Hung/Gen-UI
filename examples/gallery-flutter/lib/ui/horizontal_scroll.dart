import 'package:flutter/material.dart';
import 'tokens.g.dart';

enum UiHorizontalScrollGap { v0, v1, v2, v3, v4, v5, v6, v7 }

class UiHorizontalScroll extends StatefulWidget {
  const UiHorizontalScroll({super.key, required this.label, this.gap = UiHorizontalScrollGap.v3, this.itemWidth, this.snap = true, this.showArrows = true, this.children = const []});

  final String label;
  final UiHorizontalScrollGap gap;
  final double? itemWidth;
  final bool snap;
  final bool showArrows;
  final List<Widget> children;

  @override
  State<UiHorizontalScroll> createState() => _UiHorizontalScrollState();
}

class _UiHorizontalScrollState extends State<UiHorizontalScroll> {
  final ScrollController _controller = ScrollController();
  bool _atStart = true, _atEnd = false;

  double get _gap => UiTokens.space(widget.gap.index);

  @override
  void initState() {
    super.initState();
    _controller.addListener(_update);
    WidgetsBinding.instance.addPostFrameCallback((_) => _update());
  }

  void _update() {
    if (!mounted || !_controller.hasClients) return;
    final p = _controller.position;
    final start = p.pixels <= p.minScrollExtent + 1, end = p.pixels >= p.maxScrollExtent - 1;
    if (start != _atStart || end != _atEnd) setState(() { _atStart = start; _atEnd = end; });
  }

  @override
  void dispose() {
    _controller.dispose();
    super.dispose();
  }

  // Arrows scroll by about one viewport width.
  void _by(double direction) {
    if (!_controller.hasClients) return;
    final p = _controller.position;
    _controller.animateTo((p.pixels + direction * p.viewportDimension * 0.9).clamp(p.minScrollExtent, p.maxScrollExtent), duration: const Duration(milliseconds: 300), curve: Curves.easeOut);
  }

  @override
  Widget build(BuildContext context) {
    final items = [
      for (var i = 0; i < widget.children.length; i++) ...[
        if (i > 0) SizedBox(width: _gap),
        widget.itemWidth == null ? widget.children[i] : SizedBox(width: widget.itemWidth, child: widget.children[i]),
      ],
    ];
    // One row in source order, never wraps; as tall as its tallest item (IntrinsicHeight).
    final row = SingleChildScrollView(
      controller: _controller,
      scrollDirection: Axis.horizontal,
      physics: widget.snap && widget.itemWidth != null ? _SnapPhysics(widget.itemWidth! + _gap) : null,
      padding: EdgeInsets.symmetric(horizontal: UiTokens.space(4)),
      child: IntrinsicHeight(child: Row(crossAxisAlignment: CrossAxisAlignment.stretch, children: items)),
    );
    final pointer = widget.showArrows && Theme.of(context).platform != TargetPlatform.android && Theme.of(context).platform != TargetPlatform.iOS;
    return Semantics(
      container: true,
      label: widget.label,
      child: !pointer
          ? row
          : Stack(alignment: Alignment.center, children: [
              row,
              PositionedDirectional(start: 0, child: _arrow(Icons.chevron_left, 'Previous', _atStart ? null : () => _by(-1))),
              PositionedDirectional(end: 0, child: _arrow(Icons.chevron_right, 'Next', _atEnd ? null : () => _by(1))),
            ]),
    );
  }

  Widget _arrow(IconData icon, String name, VoidCallback? onPressed) => Material(
        color: UiTokens.colorSurface,
        shape: const CircleBorder(),
        elevation: 2,
        child: IconButton(icon: Icon(icon), tooltip: name, onPressed: onPressed),
      );
}

/// Settles on item edges when every item has the same width.
class _SnapPhysics extends ScrollPhysics {
  const _SnapPhysics(this.extent, {super.parent});
  final double extent;

  @override
  _SnapPhysics applyTo(ScrollPhysics? ancestor) => _SnapPhysics(extent, parent: buildParent(ancestor));

  @override
  Simulation? createBallisticSimulation(ScrollMetrics position, double velocity) {
    if ((velocity <= 0 && position.pixels <= position.minScrollExtent) || (velocity >= 0 && position.pixels >= position.maxScrollExtent)) {
      return super.createBallisticSimulation(position, velocity);
    }
    final page = position.pixels / extent + (velocity > 0 ? 0.5 : velocity < 0 ? -0.5 : 0);
    final target = (page.round() * extent).clamp(position.minScrollExtent, position.maxScrollExtent);
    if ((target - position.pixels).abs() < 0.5) return null;
    return ScrollSpringSimulation(spring, position.pixels, target, velocity, tolerance: toleranceFor(position));
  }
}
