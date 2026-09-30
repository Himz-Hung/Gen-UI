import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'theme.g.dart';
import 'tokens.g.dart';

enum UiDrawerSide { start, end, bottom }

enum UiDrawerSize { sm, md, lg }

class UiDrawer extends StatefulWidget {
  const UiDrawer({super.key, required this.open, required this.title, this.side = UiDrawerSide.end, this.size = UiDrawerSize.md, this.onClose, this.children = const []});

  final bool open;
  final String title;
  final UiDrawerSide side;
  final UiDrawerSize size;
  final VoidCallback? onClose;
  final List<Widget> children;

  @override
  State<UiDrawer> createState() => _UiDrawerState();
}

class _UiDrawerState extends State<UiDrawer> {
  final OverlayPortalController _overlayController = OverlayPortalController();
  final FocusScopeNode _focusScopeNode = FocusScopeNode();

  // Width sm 320, md 400, lg 560 logical pixels (height for bottom).
  double get _extent => switch (widget.size) { UiDrawerSize.sm => 320, UiDrawerSize.md => 400, UiDrawerSize.lg => 560 };

  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) => _sync());
  }

  @override
  void didUpdateWidget(covariant UiDrawer oldWidget) {
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
    final screen = MediaQuery.sizeOf(context);
    final isBottom = widget.side == UiDrawerSide.bottom;
    final capped = isBottom ? (_extent > screen.height * 0.9 ? screen.height * 0.9 : _extent) : _extent;
    // Full width on narrow screens.
    final panelWidth = isBottom ? double.infinity : (capped > screen.width ? screen.width : capped);

    final titleBar = Padding(
      padding: EdgeInsets.fromLTRB(UiTokens.space(5), UiTokens.space(4), UiTokens.space(4), UiTokens.space(3)),
      child: Row(children: [
        Expanded(child: Text(widget.title, style: TextStyle(color: context.ui.color.text, fontWeight: FontWeight.w700, fontSize: 18))),
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
    );

    final panelContent = Column(mainAxisSize: MainAxisSize.min, crossAxisAlignment: CrossAxisAlignment.stretch, children: [
      // Title bar does not scroll.
      titleBar,
      Flexible(
        child: SingleChildScrollView(
          padding: EdgeInsets.fromLTRB(UiTokens.space(5), 0, UiTokens.space(5), UiTokens.space(5)),
          child: Column(mainAxisSize: MainAxisSize.min, crossAxisAlignment: CrossAxisAlignment.stretch, children: widget.children),
        ),
      ),
    ]);

    Widget panel = Material(
      color: context.ui.color.surface,
      child: panelContent,
    );

    if (isBottom) {
      panel = ConstrainedBox(constraints: BoxConstraints(maxHeight: capped), child: panel);
      panel = ClipRRect(
        borderRadius: BorderRadius.only(topLeft: Radius.circular(UiTokens.radiusLg), topRight: Radius.circular(UiTokens.radiusLg)),
        child: panel,
      );
    } else {
      panel = SizedBox(width: panelWidth, height: double.infinity, child: panel);
    }

    final alignment = switch (widget.side) {
      UiDrawerSide.start => Alignment.centerLeft,
      UiDrawerSide.end => Alignment.centerRight,
      UiDrawerSide.bottom => Alignment.bottomCenter,
    };

    void closeOnSwipe(DragEndDetails d) => widget.onClose?.call();

    Widget gestureWrapped = panel;
    if (isBottom) {
      gestureWrapped = GestureDetector(onVerticalDragEnd: closeOnSwipe, child: panel);
    } else if (widget.side == UiDrawerSide.end) {
      gestureWrapped = GestureDetector(onHorizontalDragEnd: closeOnSwipe, child: panel);
    } else {
      gestureWrapped = GestureDetector(onHorizontalDragEnd: closeOnSwipe, child: panel);
    }

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
            // Backdrop press closes.
            onTap: widget.onClose,
            child: ColoredBox(color: context.ui.color.scrim.withValues(alpha: 0.5)),
          ),
        ),
        Align(
          alignment: alignment,
          child: GestureDetector(
            onTap: () {},
            child: FocusScope(
              node: _focusScopeNode,
              autofocus: true,
              child: CallbackShortcuts(
                bindings: {const SingleActivator(LogicalKeyboardKey.escape): () => widget.onClose?.call()},
                child: Focus(autofocus: true, child: gestureWrapped),
              ),
            ),
          ),
        ),
      ]),
    );
  }
}
