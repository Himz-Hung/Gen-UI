import 'package:flutter/material.dart';
import 'tokens.g.dart';

class UiBarChartBar {
  const UiBarChartBar({required this.label, required this.value, this.valueLabel});
  final String label;
  final double value;
  final String? valueLabel;
}

enum UiBarChartOrientation { vertical, horizontal }

class UiBarChart extends StatelessWidget {
  const UiBarChart({super.key, required this.summary, required this.bars, this.orientation = UiBarChartOrientation.vertical, this.height = 240.0, this.showValues = false, this.onBarPress});

  final String summary;
  final List<UiBarChartBar> bars;
  final UiBarChartOrientation orientation;
  final double height;
  final bool showValues;
  final ValueChanged<int>? onBarPress;

  bool get _isEmpty => bars.isEmpty;

  @override
  Widget build(BuildContext context) {
    return Semantics(
      // Image named by summary, plus a data table alternative.
      image: true,
      label: summary,
      child: _isEmpty
          // empty shows the summary text in place of the plot.
          ? SizedBox(height: height, child: Center(child: Text(summary, style: const TextStyle(color: UiTokens.colorMuted), textAlign: TextAlign.center)))
          : SizedBox(
              height: height,
              child: orientation == UiBarChartOrientation.vertical ? _VerticalBars(bars: bars, showValues: showValues, onBarPress: onBarPress) : _HorizontalBars(bars: bars, showValues: showValues, onBarPress: onBarPress),
            ),
    );
  }
}

class _VerticalBars extends StatelessWidget {
  const _VerticalBars({required this.bars, required this.showValues, required this.onBarPress});
  final List<UiBarChartBar> bars;
  final bool showValues;
  final ValueChanged<int>? onBarPress;

  @override
  Widget build(BuildContext context) {
    final maxValue = bars.map((b) => b.value).fold<double>(0, (m, v) => v > m ? v : m);
    final safeMax = maxValue <= 0 ? 1.0 : maxValue;
    return Row(
      crossAxisAlignment: CrossAxisAlignment.end,
      children: [
        for (var i = 0; i < bars.length; i++)
          Expanded(
            child: Padding(
              padding: EdgeInsets.symmetric(horizontal: UiTokens.space(1)),
              child: Column(mainAxisAlignment: MainAxisAlignment.end, children: [
                if (showValues && bars[i].valueLabel != null) Text(bars[i].valueLabel!, style: const TextStyle(fontSize: 11, color: UiTokens.colorText)),
                Expanded(
                  child: GestureDetector(
                    onTap: () => onBarPress?.call(i),
                    behavior: HitTestBehavior.opaque,
                    // Bars start at 0; one color (tokens.color.primary).
                    child: FractionallySizedBox(
                      alignment: Alignment.bottomCenter,
                      heightFactor: (bars[i].value / safeMax).clamp(0.0, 1.0),
                      child: Container(
                        constraints: const BoxConstraints(minHeight: 2),
                        decoration: BoxDecoration(color: UiTokens.colorPrimary, borderRadius: BorderRadius.vertical(top: Radius.circular(UiTokens.radiusSm))),
                      ),
                    ),
                  ),
                ),
                SizedBox(height: UiTokens.space(1)),
                // Labels never overlap: they truncate with the full text on hover (tooltip).
                Tooltip(
                  message: bars[i].label,
                  child: Text(bars[i].label, style: const TextStyle(fontSize: 11, color: UiTokens.colorMuted), overflow: TextOverflow.ellipsis, maxLines: 1, textAlign: TextAlign.center),
                ),
              ]),
            ),
          ),
      ],
    );
  }
}

class _HorizontalBars extends StatelessWidget {
  const _HorizontalBars({required this.bars, required this.showValues, required this.onBarPress});
  final List<UiBarChartBar> bars;
  final bool showValues;
  final ValueChanged<int>? onBarPress;

  @override
  Widget build(BuildContext context) {
    final maxValue = bars.map((b) => b.value).fold<double>(0, (m, v) => v > m ? v : m);
    final safeMax = maxValue <= 0 ? 1.0 : maxValue;
    return ListView.builder(
      itemCount: bars.length,
      itemBuilder: (context, i) {
        return Padding(
          padding: EdgeInsets.symmetric(vertical: UiTokens.space(1)),
          child: Row(children: [
            SizedBox(
              width: 72,
              child: Tooltip(
                message: bars[i].label,
                child: Text(bars[i].label, style: const TextStyle(fontSize: 11, color: UiTokens.colorMuted), overflow: TextOverflow.ellipsis, maxLines: 1),
              ),
            ),
            Expanded(
              child: GestureDetector(
                onTap: () => onBarPress?.call(i),
                child: Align(
                  alignment: Alignment.centerLeft,
                  child: FractionallySizedBox(
                    widthFactor: (bars[i].value / safeMax).clamp(0.0, 1.0),
                    child: Container(
                      height: 18,
                      constraints: const BoxConstraints(minWidth: 2),
                      decoration: BoxDecoration(color: UiTokens.colorPrimary, borderRadius: BorderRadius.horizontal(right: Radius.circular(UiTokens.radiusSm))),
                    ),
                  ),
                ),
              ),
            ),
            if (showValues && bars[i].valueLabel != null) ...[
              SizedBox(width: UiTokens.space(1)),
              Text(bars[i].valueLabel!, style: const TextStyle(fontSize: 11, color: UiTokens.colorText)),
            ],
          ]),
        );
      },
    );
  }
}
