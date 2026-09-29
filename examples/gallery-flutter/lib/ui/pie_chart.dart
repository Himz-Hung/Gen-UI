import 'dart:math' as math;
import 'package:flutter/material.dart';
import 'tokens.g.dart';

class UiPieChartSlice {
  const UiPieChartSlice({required this.label, required this.value});
  final String label;
  final double value;
}

class UiPieChart extends StatelessWidget {
  const UiPieChart({super.key, required this.summary, required this.slices, this.donut = true, this.centerLabel, this.height = 200.0, this.onSlicePress});

  final String summary;
  final List<UiPieChartSlice> slices;
  final bool donut;
  final String? centerLabel;
  final double height;
  final ValueChanged<int>? onSlicePress;

  // Slices colored from the tokens in a fixed order.
  static const List<Color> _palette = [
    UiTokens.colorPrimary,
    UiTokens.colorSecondary,
    UiTokens.colorSuccess,
    UiTokens.colorWarning,
    UiTokens.colorDanger,
  ];

  double get _total => slices.fold<double>(0, (m, s) => m + s.value);
  bool get _isEmpty => slices.isEmpty || _total <= 0;

  @override
  Widget build(BuildContext context) {
    return Semantics(
      // Image named by summary, plus a data table alternative.
      image: true,
      label: summary,
      child: Column(mainAxisSize: MainAxisSize.min, crossAxisAlignment: CrossAxisAlignment.stretch, children: [
        if (_isEmpty)
          // empty (all values 0) shows the summary text.
          SizedBox(height: height, child: Center(child: Text(summary, style: const TextStyle(color: UiTokens.colorMuted), textAlign: TextAlign.center)))
        else ...[
          Center(
            child: SizedBox(
              width: height,
              height: height,
              child: GestureDetector(
                onTapUp: (details) => _handleTap(details.localPosition, Size(height, height)),
                child: CustomPaint(
                  size: Size(height, height),
                  painter: _PieChartPainter(slices: slices, total: _total, donut: donut, palette: _palette),
                  child: donut && centerLabel != null
                      ? Center(
                          child: Text(centerLabel!, style: const TextStyle(color: UiTokens.colorText, fontWeight: FontWeight.w700), textAlign: TextAlign.center),
                        )
                      : null,
                ),
              ),
            ),
          ),
          SizedBox(height: UiTokens.space(3)),
          // A legend lists every slice with its label and percentage.
          Wrap(spacing: UiTokens.space(3), runSpacing: UiTokens.space(1), children: [
            for (var i = 0; i < slices.length; i++)
              Row(mainAxisSize: MainAxisSize.min, children: [
                Container(width: 10, height: 10, decoration: BoxDecoration(color: _palette[i % _palette.length], shape: BoxShape.circle)),
                SizedBox(width: UiTokens.space(1)),
                Text('${slices[i].label} (${_pct(slices[i].value)}%)', style: const TextStyle(color: UiTokens.colorText, fontSize: 12)),
              ]),
          ]),
        ],
      ]),
    );
  }

  String _pct(double value) => _total <= 0 ? '0' : (value / _total * 100).round().toString();

  void _handleTap(Offset local, Size size) {
    if (onSlicePress == null || _isEmpty) return;
    final center = Offset(size.width / 2, size.height / 2);
    final radius = math.min(size.width, size.height) / 2;
    final offset = local - center;
    final dist = offset.distance;
    if (dist > radius) return;
    if (donut && dist < radius * 0.55) return;
    // Angle measured clockwise from the top.
    var angle = math.atan2(offset.dx, -offset.dy);
    if (angle < 0) angle += 2 * math.pi;
    var acc = 0.0;
    for (var i = 0; i < slices.length; i++) {
      final sweep = slices[i].value / _total * 2 * math.pi;
      if (angle >= acc && angle < acc + sweep) {
        onSlicePress!(i);
        return;
      }
      acc += sweep;
    }
  }
}

class _PieChartPainter extends CustomPainter {
  _PieChartPainter({required this.slices, required this.total, required this.donut, required this.palette});

  final List<UiPieChartSlice> slices;
  final double total;
  final bool donut;
  final List<Color> palette;

  @override
  void paint(Canvas canvas, Size size) {
    final center = Offset(size.width / 2, size.height / 2);
    final radius = math.min(size.width, size.height) / 2;
    final rect = Rect.fromCircle(center: center, radius: radius);
    // Slices in the given order, clockwise from the top.
    var startAngle = -math.pi / 2;
    for (var i = 0; i < slices.length; i++) {
      final sweep = slices[i].value / total * 2 * math.pi;
      final paint = Paint()
        ..color = palette[i % palette.length]
        ..style = PaintingStyle.fill;
      canvas.drawArc(rect, startAngle, sweep, true, paint);
      startAngle += sweep;
    }
    if (donut) {
      final holePaint = Paint()..color = UiTokens.colorSurface;
      canvas.drawCircle(center, radius * 0.55, holePaint);
    }
  }

  @override
  bool shouldRepaint(covariant _PieChartPainter oldDelegate) => oldDelegate.slices != slices || oldDelegate.donut != donut;
}
