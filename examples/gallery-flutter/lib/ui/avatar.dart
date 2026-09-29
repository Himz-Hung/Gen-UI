import 'package:flutter/material.dart';
import 'tokens.g.dart';

enum UiAvatarSize { xs, sm, md, lg, xl }

enum UiAvatarShape { circle, square }

enum UiAvatarStatus { none, online, away, offline }

class UiAvatar extends StatelessWidget {
  const UiAvatar({super.key, required this.name, this.src, this.size = UiAvatarSize.md, this.shape = UiAvatarShape.circle, this.status = UiAvatarStatus.none});

  final String name;
  final String? src;
  final UiAvatarSize size;
  final UiAvatarShape shape;
  final UiAvatarStatus status;

  double get _dimension => switch (size) {
        UiAvatarSize.xs => 24,
        UiAvatarSize.sm => 32,
        UiAvatarSize.md => 40,
        UiAvatarSize.lg => 56,
        UiAvatarSize.xl => 80,
      };

  Color? get _statusColor => switch (status) {
        UiAvatarStatus.none => null,
        UiAvatarStatus.online => UiTokens.colorSuccess,
        UiAvatarStatus.away => UiTokens.colorWarning,
        UiAvatarStatus.offline => UiTokens.colorMuted,
      };

  String get _initials {
    final words = name.trim().split(RegExp(r'\s+')).where((w) => w.isNotEmpty).toList();
    if (words.isEmpty) return '';
    if (words.length == 1) {
      final w = words.first;
      return w.substring(0, w.length < 2 ? w.length : 2).toUpperCase();
    }
    return (words[0].substring(0, 1) + words[1].substring(0, 1)).toUpperCase();
  }

  @override
  Widget build(BuildContext context) {
    final dim = _dimension;
    final radius = shape == UiAvatarShape.circle ? BorderRadius.circular(dim / 2) : BorderRadius.circular(UiTokens.radiusMd);
    final initials = ClipRRect(
      borderRadius: radius,
      child: Container(
        width: dim,
        height: dim,
        color: UiTokens.colorSecondary,
        alignment: Alignment.center,
        child: Text(
          _initials,
          style: TextStyle(color: UiTokens.colorSurface, fontWeight: FontWeight.w600, fontSize: dim * 0.36),
        ),
      ),
    );
    final content = Stack(
      children: [
        initials,
        if (src != null && src!.isNotEmpty)
          Positioned.fill(
            child: ClipRRect(
              borderRadius: radius,
              // Falls back to initials underneath while loading or on error.
              child: Image.network(
                src!,
                width: dim,
                height: dim,
                fit: BoxFit.cover,
                errorBuilder: (context, error, stack) => const SizedBox.shrink(),
                loadingBuilder: (context, child, progress) => progress == null ? child : const SizedBox.shrink(),
              ),
            ),
          ),
      ],
    );
    final withStatus = status == UiAvatarStatus.none
        ? content
        : Stack(
            clipBehavior: Clip.none,
            children: [
              content,
              Positioned(
                right: -1,
                bottom: -1,
                child: Container(
                  width: dim * 0.28,
                  height: dim * 0.28,
                  decoration: BoxDecoration(
                    shape: BoxShape.circle,
                    color: _statusColor,
                    border: Border.all(color: UiTokens.colorSurface, width: 2),
                  ),
                ),
              ),
            ],
          );
    return Semantics(
      image: true,
      label: name,
      excludeSemantics: true,
      child: SizedBox(width: dim, height: dim, child: withStatus),
    );
  }
}
