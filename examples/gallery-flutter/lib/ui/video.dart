import 'package:flutter/material.dart';
import 'theme.g.dart';
import 'tokens.g.dart';

enum UiVideoRatio { v16x9, v4x3, v1x1, v9x16 }

class UiVideo extends StatefulWidget {
  const UiVideo({super.key, required this.src, required this.label, this.poster, this.ratio = UiVideoRatio.v16x9, this.controls = true, this.autoplay = false, this.loop = false, this.onEnded});

  final String src;
  final String label;
  final String? poster;
  final UiVideoRatio ratio;
  final bool controls;
  final bool autoplay;
  final bool loop;
  final VoidCallback? onEnded;

  @override
  State<UiVideo> createState() => _UiVideoState();
}

enum _PlayState { paused, playing, error }

class _UiVideoState extends State<UiVideo> {
  // autoplay is only ever muted, and is skipped entirely when the platform requests reduced motion.
  late _PlayState _state = widget.autoplay ? _PlayState.playing : _PlayState.paused;

  double get _ratio => switch (widget.ratio) {
        UiVideoRatio.v16x9 => 16 / 9,
        UiVideoRatio.v4x3 => 4 / 3,
        UiVideoRatio.v1x1 => 1,
        UiVideoRatio.v9x16 => 9 / 16,
      };

  void _togglePlay() {
    setState(() => _state = _state == _PlayState.playing ? _PlayState.paused : _PlayState.playing);
  }

  void _retry() {
    setState(() => _state = _PlayState.paused);
  }

  @override
  Widget build(BuildContext context) {
    final reduceMotion = MediaQuery.maybeOf(context)?.disableAnimations ?? false;
    final effectivelyPlaying = _state == _PlayState.playing && !(widget.autoplay && reduceMotion);

    Widget body;
    if (_state == _PlayState.error) {
      body = ColoredBox(
        color: context.ui.color.muted.withValues(alpha: 0.12),
        child: Center(
          child: Column(mainAxisSize: MainAxisSize.min, children: [
            Icon(Icons.error_outline, color: context.ui.color.muted),
            SizedBox(height: UiTokens.space(2)),
            TextButton(onPressed: _retry, child: const Text('Retry')),
          ]),
        ),
      );
    } else {
      final poster = widget.poster;
      body = Stack(
        fit: StackFit.expand,
        children: [
          ColoredBox(color: context.ui.color.muted.withValues(alpha: 0.12)),
          if (poster != null && poster.isNotEmpty)
            Image.network(
              poster,
              fit: BoxFit.cover,
              errorBuilder: (context, error, stack) => const SizedBox.shrink(),
            ),
          // TODO(video_player): playback — wire the video_player package here once it can be added as a
          // dependency; this frame only renders the poster/ratio box, a play control and error/retry state.
          if (widget.controls)
            Center(
              child: IconButton(
                iconSize: 40,
                icon: Icon(effectivelyPlaying ? Icons.pause_circle_filled : Icons.play_circle_fill, color: context.ui.color.surface),
                tooltip: effectivelyPlaying ? 'Pause' : 'Play',
                onPressed: _togglePlay,
              ),
            ),
        ],
      );
    }

    return Semantics(
      label: widget.label,
      child: AspectRatio(
        aspectRatio: _ratio,
        child: ClipRRect(
          borderRadius: BorderRadius.circular(UiTokens.radiusMd),
          child: body,
        ),
      ),
    );
  }
}
