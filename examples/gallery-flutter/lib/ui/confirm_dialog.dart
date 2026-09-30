import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'button.dart';
import 'theme.g.dart';
import 'tokens.g.dart';

enum UiConfirmDialogTone { defaultValue, danger }

class UiConfirmDialog extends StatefulWidget {
  const UiConfirmDialog({
    super.key,
    required this.open,
    required this.title,
    required this.message,
    required this.confirmLabel,
    required this.cancelLabel,
    this.tone = UiConfirmDialogTone.defaultValue,
    this.loading = false,
    this.onConfirm,
    this.onCancel,
  });

  final bool open;
  final String title;
  final String message;
  final String confirmLabel;
  final String cancelLabel;
  final UiConfirmDialogTone tone;
  final bool loading;
  final VoidCallback? onConfirm;
  final VoidCallback? onCancel;

  @override
  State<UiConfirmDialog> createState() => _UiConfirmDialogState();
}

class _UiConfirmDialogState extends State<UiConfirmDialog> {
  final OverlayPortalController _overlayController = OverlayPortalController();
  final FocusNode _cancelFocus = FocusNode();
  final FocusNode _confirmFocus = FocusNode();

  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) => _sync());
  }

  @override
  void didUpdateWidget(covariant UiConfirmDialog oldWidget) {
    super.didUpdateWidget(oldWidget);
    if (widget.open != oldWidget.open) {
      WidgetsBinding.instance.addPostFrameCallback((_) => _sync());
    }
  }

  // OverlayPortalController.show()/hide() must not be called while the tree
  // is building, so the open/closed state (and the focus it triggers) is
  // applied a frame later, once the overlay's buttons actually exist.
  void _sync() {
    if (!mounted) return;
    if (widget.open && !_overlayController.isShowing) {
      _overlayController.show();
      WidgetsBinding.instance.addPostFrameCallback((_) => _requestInitialFocus());
    }
    if (!widget.open && _overlayController.isShowing) _overlayController.hide();
  }

  void _requestInitialFocus() {
    if (!mounted) return;
    // Initial focus is on cancel when tone=danger, otherwise on confirm.
    final target = widget.tone == UiConfirmDialogTone.danger ? _cancelFocus : _confirmFocus;
    target.requestFocus();
  }

  @override
  void dispose() {
    _cancelFocus.dispose();
    _confirmFocus.dispose();
    super.dispose();
  }

  void _cancel() {
    // loading keeps the dialog open and disables cancel.
    if (widget.loading) return;
    widget.onCancel?.call();
  }

  @override
  Widget build(BuildContext context) {
    return OverlayPortal(
      controller: _overlayController,
      overlayChildBuilder: (context) => _buildOverlay(context),
      child: const SizedBox.shrink(),
    );
  }

  Widget _buildOverlay(BuildContext context) {
    final danger = widget.tone == UiConfirmDialogTone.danger;

    final panel = ConstrainedBox(
      constraints: const BoxConstraints(maxWidth: 420),
      child: Material(
        color: context.ui.color.surface,
        borderRadius: BorderRadius.circular(UiTokens.radiusLg),
        clipBehavior: Clip.antiAlias,
        child: Padding(
          padding: EdgeInsets.all(UiTokens.space(5)),
          child: Column(mainAxisSize: MainAxisSize.min, crossAxisAlignment: CrossAxisAlignment.stretch, children: [
            Text(widget.title, style: TextStyle(color: context.ui.color.text, fontWeight: FontWeight.w700, fontSize: 18)),
            SizedBox(height: UiTokens.space(3)),
            Text(widget.message, style: TextStyle(color: context.ui.color.text)),
            SizedBox(height: UiTokens.space(5)),
            Row(mainAxisAlignment: MainAxisAlignment.end, children: [
              // Two buttons: cancel (secondary) and confirm (primary, or danger), confirm last.
              Focus(
                focusNode: _cancelFocus,
                child: UiButton(
                  label: widget.cancelLabel,
                  variant: UiButtonVariant.secondary,
                  disabled: widget.loading,
                  onPress: _cancel,
                ),
              ),
              SizedBox(width: UiTokens.space(3)),
              Focus(
                focusNode: _confirmFocus,
                child: UiButton(
                  label: widget.confirmLabel,
                  variant: danger ? UiButtonVariant.danger : UiButtonVariant.primary,
                  loading: widget.loading,
                  onPress: widget.onConfirm,
                ),
              ),
            ]),
          ]),
        ),
      ),
    );

    return Semantics(
      // Role alertdialog labelled by title and described by message.
      container: true,
      scopesRoute: true,
      explicitChildNodes: true,
      label: widget.title,
      hint: widget.message,
      child: Stack(children: [
        Positioned.fill(
          child: GestureDetector(
            behavior: HitTestBehavior.opaque,
            // Backdrop press cancels.
            onTap: _cancel,
            child: ColoredBox(color: context.ui.color.scrim.withValues(alpha: 0.5)),
          ),
        ),
        Positioned.fill(
          child: Center(
            child: GestureDetector(
              onTap: () {},
              child: CallbackShortcuts(
                bindings: {const SingleActivator(LogicalKeyboardKey.escape): _cancel},
                child: FocusScope(child: panel),
              ),
            ),
          ),
        ),
      ]),
    );
  }
}
