import 'package:flutter/material.dart';
import 'icons.dart';
import 'theme.g.dart';

class UiSwipeActionsAction {
  const UiSwipeActionsAction({required this.value, required this.label, this.icon, this.tone});
  final String value;
  final String label;
  final String? icon;
  final UiSwipeActionsTone? tone;
}

enum UiSwipeActionsTone { neutral, primary, danger }

class UiSwipeActions extends StatefulWidget {
  const UiSwipeActions({super.key, required this.actions, this.fullSwipe = false, this.onAction, this.children = const []});

  final List<UiSwipeActionsAction> actions;
  final bool fullSwipe;
  final ValueChanged<String>? onAction;
  final List<Widget> children;

  @override
  State<UiSwipeActions> createState() => _UiSwipeActionsState();
}

class _UiSwipeActionsState extends State<UiSwipeActions> {
  double _offset = 0;
  static const double _actionWidth = 72;

  Color _toneColor(UiSwipeActionsTone? tone) => switch (tone) {
        null || UiSwipeActionsTone.neutral => context.ui.color.secondary,
        UiSwipeActionsTone.primary => context.ui.color.primary,
        UiSwipeActionsTone.danger => context.ui.color.danger,
      };

  Color _onToneColor(UiSwipeActionsTone? tone) => switch (tone) {
        null || UiSwipeActionsTone.neutral => context.ui.color.onSecondary,
        UiSwipeActionsTone.primary => context.ui.color.onPrimary,
        UiSwipeActionsTone.danger => context.ui.color.onDanger,
      };

  double get _maxOffset => _actionWidth * widget.actions.length;

  void _open() => setState(() => _offset = -_maxOffset);
  void _close() => setState(() => _offset = 0);

  void _onDragUpdate(DragUpdateDetails details) {
    setState(() {
      _offset = (_offset + details.delta.dx).clamp(-_maxOffset * (widget.fullSwipe ? 2.2 : 1), 0.0);
    });
  }

  void _onDragEnd(DragEndDetails details) {
    // Swiping all the way runs the first action when fullSwipe is set.
    if (widget.fullSwipe && widget.actions.isNotEmpty && -_offset > _maxOffset * 1.4) {
      widget.onAction?.call(widget.actions.first.value);
      _close();
      return;
    }
    if (-_offset > _maxOffset / 2) {
      _open();
    } else {
      _close();
    }
  }

  @override
  Widget build(BuildContext context) {
    if (widget.children.isEmpty) return const SizedBox.shrink();
    final row = Row(
      children: [
        for (final action in widget.actions)
          Expanded(
            child: Semantics(
              button: true,
              label: action.label,
              child: GestureDetector(
                onTap: () {
                  widget.onAction?.call(action.value);
                  _close();
                },
                child: Container(
                  color: _toneColor(action.tone),
                  alignment: Alignment.center,
                  child: Column(mainAxisSize: MainAxisSize.min, children: [
                    if (action.icon != null) Icon(uiIconData(action.icon!), color: _onToneColor(action.tone), size: 18),
                    Text(action.label, style: TextStyle(color: _onToneColor(action.tone), fontSize: 12)),
                  ]),
                ),
              ),
            ),
          ),
      ],
    );

    // The same actions are reachable without swiping via a long press, which reveals the same
    // labelled action buttons to assistive tech (Semantics.button on each), not only via a swipe gesture.
    // opaque: the whole row is swipeable, not just wherever the child happens to paint content
    // (e.g. a short title leaves empty space that would otherwise miss the gesture).
    return GestureDetector(
      behavior: HitTestBehavior.opaque,
      onLongPress: _offset == 0 ? _open : _close,
      onHorizontalDragUpdate: _onDragUpdate,
      onHorizontalDragEnd: _onDragEnd,
      child: Stack(
        children: [
          Positioned.fill(
            child: IgnorePointer(ignoring: _offset == 0, child: Align(alignment: Alignment.centerRight, child: SizedBox(width: _maxOffset, child: row))),
          ),
          TapRegion(
            onTapOutside: (_) {
              if (_offset != 0) _close();
            },
            child: Transform.translate(
              offset: Offset(_offset, 0),
              // An opaque backing so the actions underneath are hidden until swiped into view.
              child: ColoredBox(color: context.ui.color.surface, child: widget.children.first),
            ),
          ),
        ],
      ),
    );
  }
}
