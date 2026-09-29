import 'package:flutter/material.dart';
import 'icons.dart';
import 'tokens.g.dart';

enum UiFloatingActionButtonPosition { end, center, start }

enum UiFloatingActionButtonSize { sm, md }

/// Lifted out of the layout into an OverlayPortal, so it stays fixed at the bottom of the screen
/// while the content scrolls, with no Scaffold needed. It takes no space where it is placed.
class UiFloatingActionButton extends StatefulWidget {
  const UiFloatingActionButton({super.key, required this.label, required this.icon, this.extended = false, this.position = UiFloatingActionButtonPosition.end, this.size = UiFloatingActionButtonSize.md, this.disabled = false, this.onPress});

  final String label;
  final String icon;
  final bool extended;
  final UiFloatingActionButtonPosition position;
  final UiFloatingActionButtonSize size;
  final bool disabled;
  final VoidCallback? onPress;

  @override
  State<UiFloatingActionButton> createState() => _UiFloatingActionButtonState();
}

class _UiFloatingActionButtonState extends State<UiFloatingActionButton> {
  final OverlayPortalController _controller = OverlayPortalController();

  @override
  void initState() {
    super.initState();
    // show() must not run during build.
    WidgetsBinding.instance.addPostFrameCallback((_) { if (mounted && !_controller.isShowing) _controller.show(); });
  }

  AlignmentDirectional get _alignment => switch (widget.position) {
        UiFloatingActionButtonPosition.end => AlignmentDirectional.bottomEnd,
        UiFloatingActionButtonPosition.center => AlignmentDirectional.bottomCenter,
        UiFloatingActionButtonPosition.start => AlignmentDirectional.bottomStart,
      };

  Widget _button() {
    final enabled = !widget.disabled;
    final bg = enabled ? UiTokens.colorPrimary : UiTokens.colorMuted.withValues(alpha: 0.4);
    final icon = Icon(uiIconData(widget.icon), color: UiTokens.colorSurface);
    final shape = RoundedRectangleBorder(borderRadius: BorderRadius.circular(UiTokens.radiusLg));
    // Never emits press while disabled.
    final onPressed = enabled ? widget.onPress : null;
    final Widget fab = widget.extended
        ? FloatingActionButton.extended(heroTag: null, onPressed: onPressed, backgroundColor: bg, shape: shape, icon: icon, label: Text(widget.label, style: const TextStyle(color: UiTokens.colorSurface, fontWeight: FontWeight.w600)))
        : widget.size == UiFloatingActionButtonSize.sm
            ? FloatingActionButton.small(heroTag: null, onPressed: onPressed, backgroundColor: bg, shape: shape, tooltip: widget.label, child: icon)
            : FloatingActionButton(heroTag: null, onPressed: onPressed, backgroundColor: bg, shape: shape, tooltip: widget.label, child: icon);
    // Role button named by label, also when the label is not shown.
    return Semantics(button: true, enabled: enabled, label: widget.label, excludeSemantics: true, child: fab);
  }

  @override
  Widget build(BuildContext context) {
    return OverlayPortal(
      controller: _controller,
      overlayChildBuilder: (context) => SafeArea(
        child: Padding(
          // Leaves room above a bottom navigation bar (80 logical pixels) when the screen has one.
          padding: EdgeInsets.all(UiTokens.space(5)),
          child: Align(alignment: _alignment, child: _button()),
        ),
      ),
      child: const SizedBox.shrink(),
    );
  }
}
