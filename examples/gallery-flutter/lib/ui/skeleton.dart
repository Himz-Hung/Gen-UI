import 'package:flutter/material.dart';
import 'tokens.g.dart';

enum UiSkeletonShape { text, rect, circle, card }

enum UiSkeletonRatio { v1x1, v4x3, v16x9, v5x7 }

class UiSkeleton extends StatefulWidget {
  const UiSkeleton({super.key, this.shape = UiSkeletonShape.rect, this.lines = 1, this.ratio});

  final UiSkeletonShape shape;
  final int lines;
  final UiSkeletonRatio? ratio;

  @override
  State<UiSkeleton> createState() => _UiSkeletonState();
}

class _UiSkeletonState extends State<UiSkeleton> with SingleTickerProviderStateMixin {
  late final AnimationController _controller = AnimationController(vsync: this, duration: const Duration(milliseconds: 1200))..repeat(reverse: true);

  @override
  void dispose() {
    _controller.dispose();
    super.dispose();
  }

  double? get _ratio => switch (widget.ratio) {
        UiSkeletonRatio.v1x1 => 1,
        UiSkeletonRatio.v4x3 => 4 / 3,
        UiSkeletonRatio.v16x9 => 16 / 9,
        UiSkeletonRatio.v5x7 => 5 / 7,
        null => null,
      };

  @override
  Widget build(BuildContext context) {
    // Hidden from assistive tech; the parent announces loading.
    return ExcludeSemantics(
      child: switch (widget.shape) {
        UiSkeletonShape.text => _text(),
        UiSkeletonShape.circle => _block(width: 40, height: 40, radius: UiTokens.radiusFull),
        UiSkeletonShape.card => _ratioBlock(radius: UiTokens.radiusLg),
        UiSkeletonShape.rect => _ratioBlock(radius: UiTokens.radiusMd),
      },
    );
  }

  Widget _text() {
    final n = widget.lines.clamp(1, 100);
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      mainAxisSize: MainAxisSize.min,
      children: [
        for (var i = 0; i < n; i++) ...[
          if (i > 0) SizedBox(height: UiTokens.space(2)),
          // Last line of a paragraph is shorter, like real text.
          _block(width: i == n - 1 && n > 1 ? 160 : double.infinity, height: 12, radius: UiTokens.radiusSm),
        ],
      ],
    );
  }

  Widget _ratioBlock({required double radius}) {
    final block = _block(width: double.infinity, height: _ratio == null ? 120 : null, radius: radius);
    return _ratio == null ? block : AspectRatio(aspectRatio: _ratio!, child: block);
  }

  Widget _block({required double width, double? height, required double radius}) {
    // Takes the same space as the real content so nothing shifts on load.
    return AnimatedBuilder(
      animation: _controller,
      builder: (context, child) {
        // Respects reduced-motion preference by staying static.
        final reduceMotion = MediaQuery.maybeOf(context)?.disableAnimations ?? false;
        final t = reduceMotion ? 0.4 : _controller.value;
        return Container(
          width: width,
          height: height,
          decoration: BoxDecoration(
            color: UiTokens.colorMuted.withValues(alpha: 0.12 + 0.10 * t),
            borderRadius: BorderRadius.circular(radius),
          ),
        );
      },
    );
  }
}
