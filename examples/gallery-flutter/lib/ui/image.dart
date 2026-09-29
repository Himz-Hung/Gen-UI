import 'package:flutter/material.dart';
import 'tokens.g.dart';

enum UiImageRatio { v1x1, v4x3, v3x4, v16x9, v5x7 }

enum UiImageFit { cover, contain }

enum UiImageRadius { none, sm, md, lg }

class UiImage extends StatelessWidget {
  const UiImage({super.key, required this.src, required this.alt, this.ratio = UiImageRatio.v5x7, this.fit = UiImageFit.contain, this.radius = UiImageRadius.md});

  final String src;
  final String alt;
  final UiImageRatio ratio;
  final UiImageFit fit;
  final UiImageRadius radius;

  double get _ratio => switch (ratio) { UiImageRatio.v1x1 => 1, UiImageRatio.v4x3 => 4 / 3, UiImageRatio.v3x4 => 3 / 4, UiImageRatio.v16x9 => 16 / 9, UiImageRatio.v5x7 => 5 / 7 };
  double get _radius => switch (radius) { UiImageRadius.none => 0, UiImageRadius.sm => UiTokens.radiusSm, UiImageRadius.md => UiTokens.radiusMd, UiImageRadius.lg => UiTokens.radiusLg };

  @override
  Widget build(BuildContext context) {
    // The box keeps its ratio before, during and after load: no layout shift.
    final placeholder = ColoredBox(color: UiTokens.colorMuted.withValues(alpha: 0.12));
    final image = Image.network(
      src,
      fit: fit == UiImageFit.cover ? BoxFit.cover : BoxFit.contain,
      loadingBuilder: (context, child, progress) => progress == null ? child : placeholder,
      errorBuilder: (context, error, stack) => Stack(fit: StackFit.expand, children: [placeholder, Icon(Icons.broken_image_outlined, color: UiTokens.colorMuted)]),
    );
    return Semantics(
      image: alt.isNotEmpty,
      label: alt.isEmpty ? null : alt,
      excludeSemantics: true,
      child: AspectRatio(aspectRatio: _ratio, child: ClipRRect(borderRadius: BorderRadius.circular(_radius), child: image)),
    );
  }
}
