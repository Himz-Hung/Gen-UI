import 'dart:async';
import 'package:flutter/material.dart';
import 'icons.dart';
import 'tokens.g.dart';

enum UiToastTone { info, success, warning, danger }

class UiToast extends StatefulWidget {
  const UiToast({
    super.key,
    required this.open,
    required this.message,
    this.tone = UiToastTone.info,
    this.actionLabel,
    this.duration = 4000,
    this.onClose,
    this.onAction,
  });

  final bool open;
  final String message;
  final UiToastTone tone;
  final String? actionLabel;
  final int duration;
  final VoidCallback? onClose;
  final VoidCallback? onAction;

  @override
  State<UiToast> createState() => _UiToastState();
}

class _UiToastState extends State<UiToast> {
  Timer? _timer;
  // The timer pauses while hovered or focused; _remaining is what is left when it resumes.
  Duration _remaining = Duration.zero;
  final Stopwatch _running = Stopwatch();
  bool _hovered = false, _focused = false;

  @override
  void initState() {
    super.initState();
    _schedule();
  }

  @override
  void didUpdateWidget(covariant UiToast oldWidget) {
    super.didUpdateWidget(oldWidget);
    if (widget.open &&
        (!oldWidget.open ||
            widget.duration != oldWidget.duration ||
            widget.message != oldWidget.message)) {
      _schedule();
    } else if (!widget.open) {
      _timer?.cancel();
    }
  }

  void _schedule() {
    _remaining = Duration(milliseconds: widget.duration);
    _resume();
  }

  void _resume() {
    _timer?.cancel();
    // duration 0 = stays until closed; nothing runs while hovered or focused.
    if (!widget.open || widget.duration <= 0 || _hovered || _focused) return;
    _running
      ..reset()
      ..start();
    _timer = Timer(_remaining, () => widget.onClose?.call());
  }

  void _pause() {
    if (_timer?.isActive ?? false) {
      _timer!.cancel();
      final left = _remaining - _running.elapsed;
      _remaining = left.isNegative ? Duration.zero : left;
    }
  }

  void _setHold({bool? hovered, bool? focused}) {
    _hovered = hovered ?? _hovered;
    _focused = focused ?? _focused;
    (_hovered || _focused) ? _pause() : _resume();
  }

  @override
  void dispose() {
    _timer?.cancel();
    super.dispose();
  }

  Color get _color => switch (widget.tone) {
    UiToastTone.info => UiTokens.colorPrimary,
    UiToastTone.success => UiTokens.colorSuccess,
    UiToastTone.warning => UiTokens.colorWarning,
    UiToastTone.danger => UiTokens.colorDanger,
  };

  IconData get _icon => switch (widget.tone) {
    UiToastTone.info => uiIconData('info'),
    UiToastTone.success => uiIconData('success'),
    UiToastTone.warning => uiIconData('warning'),
    UiToastTone.danger => uiIconData('error'),
  };

  @override
  Widget build(BuildContext context) {
    if (!widget.open) return const SizedBox.shrink();
    // Own Material surface: does not depend on a Scaffold being present. Positioned bottom centre,
    // above all content — the caller places this widget via a Stack/Overlay covering the screen.
    return Align(
      alignment: Alignment.bottomCenter,
      child: SafeArea(
        child: Padding(
          padding: EdgeInsets.all(UiTokens.space(4)),
          child: Semantics(
            liveRegion: true,
            // danger is reported assertively; the rest as a polite status update.
            child: MouseRegion(
              onEnter: (_) => _setHold(hovered: true),
              onExit: (_) => _setHold(hovered: false),
              child: Focus(
                onFocusChange: (f) => _setHold(focused: f),
                skipTraversal: true,
                child: Material(
                  color: UiTokens.colorText,
                  borderRadius: BorderRadius.circular(UiTokens.radiusMd),
                  elevation: 4,
                  child: Padding(
                    padding: EdgeInsets.symmetric(
                      horizontal: UiTokens.space(4),
                      vertical: UiTokens.space(3),
                    ),
                    child: Row(
                      mainAxisSize: MainAxisSize.min,
                      children: [
                        Icon(_icon, size: 18, color: _color),
                        SizedBox(width: UiTokens.space(3)),
                        Flexible(
                          child: Text(
                            widget.message,
                            style: const TextStyle(
                              color: UiTokens.colorSurface,
                            ),
                            overflow: TextOverflow.ellipsis,
                          ),
                        ),
                        if (widget.actionLabel != null) ...[
                          SizedBox(width: UiTokens.space(3)),
                          TextButton(
                            onPressed: widget.onAction,
                            style: TextButton.styleFrom(
                              foregroundColor: UiTokens.colorPrimary,
                            ),
                            child: Text(widget.actionLabel!),
                          ),
                        ],
                        IconButton(
                          icon: Icon(
                            uiIconData('close'),
                            size: 16,
                            color: UiTokens.colorSurface,
                          ),
                          tooltip: 'Close',
                          onPressed: widget.onClose,
                          padding: EdgeInsets.zero,
                          constraints: const BoxConstraints(
                            minWidth: 28,
                            minHeight: 28,
                          ),
                        ),
                      ],
                    ),
                  ),
                ),
              ),
            ),
          ),
        ),
      ),
    );
  }
}
