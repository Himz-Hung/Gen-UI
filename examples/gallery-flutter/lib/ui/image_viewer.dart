import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'tokens.g.dart';

class UiImageViewerImage {
  const UiImageViewerImage({required this.src, required this.alt});
  final String src;
  final String alt;
}

class UiImageViewer extends StatefulWidget {
  const UiImageViewer({super.key, required this.open, required this.label, required this.images, this.index = 0, this.onClose, this.onChange});

  final bool open;
  final String label;
  final List<UiImageViewerImage> images;
  final int index;
  final VoidCallback? onClose;
  final ValueChanged<int>? onChange;

  @override
  State<UiImageViewer> createState() => _UiImageViewerState();
}

class _UiImageViewerState extends State<UiImageViewer> {
  final OverlayPortalController _overlay = OverlayPortalController();
  late PageController _pages = PageController(initialPage: _clamped);
  bool _zoomed = false;

  int get _clamped => widget.images.isEmpty ? 0 : widget.index.clamp(0, widget.images.length - 1);

  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) => _sync());
  }

  @override
  void didUpdateWidget(covariant UiImageViewer old) {
    super.didUpdateWidget(old);
    if (widget.open != old.open) {
      if (widget.open) { _pages.dispose(); _pages = PageController(initialPage: _clamped); _zoomed = false; }
      WidgetsBinding.instance.addPostFrameCallback((_) => _sync());
    } else if (widget.index != old.index && _pages.hasClients && _pages.page?.round() != _clamped) {
      _pages.animateToPage(_clamped, duration: const Duration(milliseconds: 250), curve: Curves.easeOut);
    }
  }

  // show()/hide() must not run during build.
  void _sync() {
    if (!mounted) return;
    if (widget.open && !_overlay.isShowing) _overlay.show();
    if (!widget.open && _overlay.isShowing) _overlay.hide();
  }

  @override
  void dispose() {
    _pages.dispose();
    super.dispose();
  }

  void _go(int delta) {
    final next = _clamped + delta;
    if (next < 0 || next >= widget.images.length) return;
    widget.onChange?.call(next);
  }

  @override
  Widget build(BuildContext context) => OverlayPortal(controller: _overlay, overlayChildBuilder: _viewer, child: const SizedBox.shrink());

  Widget _viewer(BuildContext context) {
    final many = widget.images.length > 1;
    return CallbackShortcuts(
      bindings: {
        const SingleActivator(LogicalKeyboardKey.escape): () => widget.onClose?.call(),
        const SingleActivator(LogicalKeyboardKey.arrowLeft): () => _go(-1),
        const SingleActivator(LogicalKeyboardKey.arrowRight): () => _go(1),
      },
      child: FocusScope(
        autofocus: true,
        child: Semantics(
          scopesRoute: true,
          explicitChildNodes: true,
          namesRoute: true,
          label: widget.label,
          child: Material(
            // Dark backdrop covering the whole screen.
            color: UiTokens.colorText.withValues(alpha: 0.94),
            child: SafeArea(
              child: Stack(children: [
                // Swipe down to close; swipe sideways (when not zoomed) to switch images.
                GestureDetector(
                  onVerticalDragEnd: (d) { if (!_zoomed && (d.primaryVelocity ?? 0) > 600) widget.onClose?.call(); },
                  child: PageView.builder(
                    controller: _pages,
                    physics: _zoomed ? const NeverScrollableScrollPhysics() : null,
                    itemCount: widget.images.length,
                    onPageChanged: (i) { setState(() => _zoomed = false); widget.onChange?.call(i); },
                    itemBuilder: (context, i) => _ZoomableImage(
                      image: widget.images[i],
                      position: '${i + 1} of ${widget.images.length}',
                      onZoomChanged: (z) { if (z != _zoomed) setState(() => _zoomed = z); },
                    ),
                  ),
                ),
                // Always a visible close control.
                PositionedDirectional(
                  top: UiTokens.space(3),
                  end: UiTokens.space(3),
                  child: IconButton(icon: const Icon(Icons.close, color: UiTokens.colorSurface), tooltip: 'Close', onPressed: widget.onClose),
                ),
                if (many) ...[
                  Positioned(
                    top: UiTokens.space(4),
                    left: 0,
                    right: 0,
                    child: Center(child: Text('${_clamped + 1} / ${widget.images.length}', style: const TextStyle(color: UiTokens.colorSurface, fontWeight: FontWeight.w600))),
                  ),
                  PositionedDirectional(start: UiTokens.space(2), top: 0, bottom: 0, child: Center(child: IconButton(icon: const Icon(Icons.chevron_left, color: UiTokens.colorSurface, size: 32), tooltip: 'Previous image', onPressed: _clamped > 0 ? () => _go(-1) : null))),
                  PositionedDirectional(end: UiTokens.space(2), top: 0, bottom: 0, child: Center(child: IconButton(icon: const Icon(Icons.chevron_right, color: UiTokens.colorSurface, size: 32), tooltip: 'Next image', onPressed: _clamped < widget.images.length - 1 ? () => _go(1) : null))),
                ],
              ]),
            ),
          ),
        ),
      ),
    );
  }
}

/// Pinch or double-tap zooms up to 4×; while zoomed, dragging pans instead of switching images.
class _ZoomableImage extends StatefulWidget {
  const _ZoomableImage({required this.image, required this.position, required this.onZoomChanged});
  final UiImageViewerImage image;
  final String position;
  final ValueChanged<bool> onZoomChanged;

  @override
  State<_ZoomableImage> createState() => _ZoomableImageState();
}

class _ZoomableImageState extends State<_ZoomableImage> {
  final TransformationController _t = TransformationController();

  @override
  void initState() {
    super.initState();
    _t.addListener(() => widget.onZoomChanged(_t.value.getMaxScaleOnAxis() > 1.01));
  }

  @override
  void dispose() {
    _t.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onDoubleTap: () => _t.value = _t.value.getMaxScaleOnAxis() > 1.01 ? Matrix4.identity() : (Matrix4.identity()..scaleByDouble(2.0, 2.0, 1.0, 1.0)),
      child: InteractiveViewer(
        transformationController: _t,
        minScale: 1,
        maxScale: 4,
        child: Center(
          child: Semantics(
            image: true,
            label: '${widget.image.alt}, ${widget.position}',
            child: Image.network(
              widget.image.src,
              fit: BoxFit.contain,
              errorBuilder: (context, error, stack) => const Icon(Icons.broken_image_outlined, color: UiTokens.colorSurface, size: 48),
            ),
          ),
        ),
      ),
    );
  }
}
