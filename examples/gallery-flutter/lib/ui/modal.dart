import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'theme.g.dart';
import 'tokens.g.dart';

enum UiModalSize { sm, md, lg }

class UiModal extends StatefulWidget {
  const UiModal({super.key, required this.open, required this.title, this.size = UiModalSize.md, this.onClose, this.children = const []});

  final bool open;
  final String title;
  final UiModalSize size;
  final VoidCallback? onClose;
  final List<Widget> children;

  @override
  State<UiModal> createState() => _UiModalState();
}

class _UiModalState extends State<UiModal> {
  final OverlayPortalController _overlayController = OverlayPortalController();
  final FocusScopeNode _focusScopeNode = FocusScopeNode();

  double get _width => switch (widget.size) { UiModalSize.sm => 320, UiModalSize.md => 480, UiModalSize.lg => 640 };

  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) => _sync());
  }

  @override
  void didUpdateWidget(covariant UiModal oldWidget) {
    super.didUpdateWidget(oldWidget);
    if (widget.open != oldWidget.open) {
      WidgetsBinding.instance.addPostFrameCallback((_) => _sync());
    }
  }

  // OverlayPortalController.show()/hide() must not be called while the tree
  // is building, so the open/closed state is applied a frame later.
  void _sync() {
    if (!mounted) return;
    if (widget.open && !_overlayController.isShowing) _overlayController.show();
    if (!widget.open && _overlayController.isShowing) _overlayController.hide();
  }

  @override
  void dispose() {
    _focusScopeNode.dispose();
    super.dispose();
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
    final panel = ConstrainedBox(
      constraints: BoxConstraints(maxWidth: _width, maxHeight: MediaQuery.sizeOf(context).height * 0.9),
      child: Material(
        color: context.ui.color.surface,
        borderRadius: BorderRadius.circular(UiTokens.radiusLg),
        clipBehavior: Clip.antiAlias,
        child: Padding(
          padding: EdgeInsets.all(UiTokens.space(5)),
          child: Column(mainAxisSize: MainAxisSize.min, crossAxisAlignment: CrossAxisAlignment.stretch, children: [
            Row(children: [
              Expanded(
                child: Text(widget.title, style: TextStyle(color: context.ui.color.text, fontWeight: FontWeight.w700, fontSize: 18)),
              ),
              SizedBox(width: UiTokens.space(3)),
              // Always has a visible close control.
              Semantics(
                button: true,
                label: 'Close',
                child: InkWell(
                  borderRadius: BorderRadius.circular(UiTokens.radiusFull),
                  onTap: widget.onClose,
                  child: Padding(padding: EdgeInsets.all(UiTokens.space(1)), child: Icon(Icons.close, color: context.ui.color.muted)),
                ),
              ),
            ]),
            SizedBox(height: UiTokens.space(4)),
            Flexible(child: SingleChildScrollView(child: Column(mainAxisSize: MainAxisSize.min, crossAxisAlignment: CrossAxisAlignment.stretch, children: widget.children))),
          ]),
        ),
      ),
    );

    return Semantics(
      // Role dialog, aria-modal, labelled by title.
      container: true,
      scopesRoute: true,
      explicitChildNodes: true,
      label: widget.title,
      child: Stack(children: [
        Positioned.fill(
          child: GestureDetector(
            behavior: HitTestBehavior.opaque,
            // Backdrop press closes; background content is inert while open.
            onTap: widget.onClose,
            child: ColoredBox(color: context.ui.color.scrim.withValues(alpha: 0.5)),
          ),
        ),
        Positioned.fill(
          child: Center(
            child: GestureDetector(
              // Swallow taps on the panel so they don't reach the backdrop.
              onTap: () {},
              child: FocusScope(
                node: _focusScopeNode,
                autofocus: true,
                child: CallbackShortcuts(
                  bindings: {const SingleActivator(LogicalKeyboardKey.escape): () => widget.onClose?.call()},
                  child: Focus(autofocus: true, child: panel),
                ),
              ),
            ),
          ),
        ),
      ]),
    );
  }
}
