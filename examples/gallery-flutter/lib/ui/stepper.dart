import 'package:flutter/material.dart';
import 'theme.g.dart';
import 'tokens.g.dart';

class UiStepperStep {
  const UiStepperStep({required this.label, this.description});
  final String label;
  final String? description;
}

enum UiStepperOrientation { horizontal, vertical }

class UiStepper extends StatelessWidget {
  const UiStepper({super.key, required this.steps, required this.current, this.orientation = UiStepperOrientation.horizontal, this.allowBack = true, this.onPress});

  final List<UiStepperStep> steps;
  final int current;
  final UiStepperOrientation orientation;
  final bool allowBack;
  final ValueChanged<int>? onPress;

  @override
  Widget build(BuildContext context) {
    final currentIndex = current.clamp(0, steps.isEmpty ? 0 : steps.length - 1);
    return Semantics(
      // An ordered list.
      container: true,
      explicitChildNodes: true,
      child: orientation == UiStepperOrientation.vertical
          ? _vertical(context, currentIndex)
          : LayoutBuilder(
              builder: (context, constraints) {
                // Narrow screens show "Step n of m" with only the current label.
                if (constraints.maxWidth < 480) return _compact(context, currentIndex);
                return _horizontal(context, currentIndex);
              },
            ),
    );
  }

  Widget _compact(BuildContext context, int currentIndex) {
    final step = steps[currentIndex];
    return Padding(
      padding: EdgeInsets.symmetric(vertical: UiTokens.space(2)),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        mainAxisSize: MainAxisSize.min,
        children: [
          Text('Step ${currentIndex + 1} of ${steps.length}', style: TextStyle(color: context.ui.color.muted, fontSize: 12)),
          SizedBox(height: UiTokens.space(1)),
          Text(step.label, style: TextStyle(color: context.ui.color.primary, fontWeight: FontWeight.w700)),
        ],
      ),
    );
  }

  Widget _horizontal(BuildContext context, int currentIndex) {
    return Row(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        for (var i = 0; i < steps.length; i++) ...[
          if (i > 0)
            Expanded(
              child: Padding(
                padding: const EdgeInsets.only(top: 13),
                child: Container(height: 2, color: i <= currentIndex ? context.ui.color.primary : context.ui.color.muted.withValues(alpha: 0.3)),
              ),
            ),
          Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              _marker(context, i, currentIndex),
              SizedBox(height: UiTokens.space(1)),
              ConstrainedBox(
                constraints: const BoxConstraints(maxWidth: 96),
                child: Text(
                  steps[i].label,
                  textAlign: TextAlign.center,
                  overflow: TextOverflow.ellipsis,
                  style: TextStyle(
                    color: i == currentIndex ? context.ui.color.primary : context.ui.color.text,
                    fontWeight: i == currentIndex ? FontWeight.w700 : FontWeight.w400,
                  ),
                ),
              ),
            ],
          ),
        ],
      ],
    );
  }

  Widget _vertical(BuildContext context, int currentIndex) {
    return Column(
      mainAxisSize: MainAxisSize.min,
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        for (var i = 0; i < steps.length; i++)
          IntrinsicHeight(
            child: Row(
              crossAxisAlignment: CrossAxisAlignment.stretch,
              children: [
                Column(
                  children: [
                    _marker(context, i, currentIndex),
                    // Fixed-height connector; no Expanded (unbounded height when this sits in a scroll view).
                    if (i < steps.length - 1) Container(width: 2, height: 24, color: i < currentIndex ? context.ui.color.primary : context.ui.color.muted.withValues(alpha: 0.3)),
                  ],
                ),
                SizedBox(width: UiTokens.space(3)),
                Expanded(
                  child: Padding(
                    padding: EdgeInsets.only(bottom: UiTokens.space(4)),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      mainAxisSize: MainAxisSize.min,
                      children: [
                        Text(steps[i].label, style: TextStyle(color: i == currentIndex ? context.ui.color.primary : context.ui.color.text, fontWeight: i == currentIndex ? FontWeight.w700 : FontWeight.w400)),
                        if (steps[i].description != null) Text(steps[i].description!, style: TextStyle(color: context.ui.color.muted, fontSize: 12)),
                      ],
                    ),
                  ),
                ),
              ],
            ),
          ),
      ],
    );
  }

  Widget _marker(BuildContext context, int i, int currentIndex) {
    final completed = i < currentIndex;
    final isCurrent = i == currentIndex;
    // Completed steps show a check mark, current is highlighted, later ones are muted.
    final color = completed || isCurrent ? context.ui.color.primary : context.ui.color.muted.withValues(alpha: 0.4);
    // Completed steps are pressable when allowBack; current and future steps never emit.
    final pressable = completed && allowBack;
    final circle = Container(
      width: 28,
      height: 28,
      alignment: Alignment.center,
      decoration: BoxDecoration(
        shape: BoxShape.circle,
        color: isCurrent ? context.ui.color.primary : Colors.transparent,
        border: Border.all(color: color, width: 2),
      ),
      child: completed
          ? Icon(Icons.check, size: 16, color: context.ui.color.primary)
          : Text('${i + 1}', style: TextStyle(color: isCurrent ? context.ui.color.surface : context.ui.color.muted, fontWeight: FontWeight.w600, fontSize: 12)),
    );
    return Semantics(
      label: completed ? '${steps[i].label}, completed' : (isCurrent ? '${steps[i].label}, current step' : steps[i].label),
      button: pressable,
      child: pressable ? InkWell(customBorder: const CircleBorder(), onTap: () => onPress?.call(i), child: circle) : circle,
    );
  }
}
