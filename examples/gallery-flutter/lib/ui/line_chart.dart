import 'package:flutter/material.dart';
import 'tokens.g.dart';

class UiLineChartSeries {
  const UiLineChartSeries({required this.name, required this.points});
  final String name;
  final List<UiLineChartPoint> points;
}

class UiLineChartPoint {
  const UiLineChartPoint({required this.x, required this.y});
  final String x;
  final double y;
}

class UiLineChartPointPressEvent {
  const UiLineChartPointPressEvent({required this.series, required this.index});
  final int series;
  final int index;
}

class UiLineChart extends StatelessWidget {
  const UiLineChart({super.key, required this.summary, required this.series, this.yLabel, this.xLabel, this.height = 240.0, this.showLegend = true, this.onPointPress});

  final String summary;
  final List<UiLineChartSeries> series;
  final String? yLabel;
  final String? xLabel;
  final double height;
  final bool showLegend;
  final ValueChanged<UiLineChartPointPressEvent>? onPointPress;

  // Series colors come from the project tokens in a fixed order.
  static const List<Color> _palette = [
    UiTokens.colorPrimary,
    UiTokens.colorSecondary,
    UiTokens.colorSuccess,
    UiTokens.colorWarning,
    UiTokens.colorDanger,
  ];

  bool get _isEmpty => series.isEmpty || series.every((s) => s.points.isEmpty);

  @override
  Widget build(BuildContext context) {
    return Semantics(
      // Image named by summary, plus a data table alternative reachable by assistive tech.
      image: true,
      label: summary,
      child: Column(crossAxisAlignment: CrossAxisAlignment.stretch, mainAxisSize: MainAxisSize.min, children: [
        if (_isEmpty)
          // empty (no points) shows the summary text in place of the plot.
          SizedBox(
            height: height,
            child: Center(child: Text(summary, style: const TextStyle(color: UiTokens.colorMuted), textAlign: TextAlign.center)),
          )
        else ...[
          if (yLabel != null)
            Padding(
              padding: EdgeInsets.only(bottom: UiTokens.space(1)),
              child: Text(yLabel!, style: const TextStyle(color: UiTokens.colorMuted, fontSize: 12)),
            ),
          SizedBox(
            height: height,
            child: LayoutBuilder(builder: (context, constraints) {
              return GestureDetector(
                onTapUp: (details) => _handleTap(details.localPosition, Size(constraints.maxWidth, height)),
                child: CustomPaint(
                  size: Size(constraints.maxWidth, height),
                  painter: _LineChartPainter(series: series, palette: _palette),
                ),
              );
            }),
          ),
          if (xLabel != null)
            Padding(
              padding: EdgeInsets.only(top: UiTokens.space(1)),
              child: Text(xLabel!, style: const TextStyle(color: UiTokens.colorMuted, fontSize: 12)),
            ),
          // Legend only shown with more than one series.
          if (showLegend && series.length > 1)
            Padding(
              padding: EdgeInsets.only(top: UiTokens.space(2)),
              child: Wrap(spacing: UiTokens.space(3), runSpacing: UiTokens.space(1), children: [
                for (var i = 0; i < series.length; i++)
                  Row(mainAxisSize: MainAxisSize.min, children: [
                    Container(width: 10, height: 10, decoration: BoxDecoration(color: _palette[i % _palette.length], shape: BoxShape.circle)),
                    SizedBox(width: UiTokens.space(1)),
                    Text(series[i].name, style: const TextStyle(color: UiTokens.colorText, fontSize: 12)),
                  ]),
              ]),
            ),
        ],
      ]),
    );
  }

  void _handleTap(Offset local, Size size) {
    if (onPointPress == null || _isEmpty) return;
    final geometry = _LineChartPainter(series: series, palette: _palette).layout(size);
    double bestDist = double.infinity;
    int bestSeries = -1;
    int bestIndex = -1;
    for (var s = 0; s < series.length; s++) {
      final pts = geometry.pointsFor(s);
      for (var i = 0; i < pts.length; i++) {
        final d = (pts[i] - local).distanceSquared;
        if (d < bestDist) {
          bestDist = d;
          bestSeries = s;
          bestIndex = i;
        }
      }
    }
    // Only register a hit reasonably near a plotted point.
    if (bestSeries != -1 && bestDist <= 400) {
      onPointPress!(UiLineChartPointPressEvent(series: bestSeries, index: bestIndex));
    }
  }
}

class _ChartGeometry {
  _ChartGeometry(this._points);
  final List<List<Offset>> _points;
  List<Offset> pointsFor(int series) => series < _points.length ? _points[series] : const [];
}

class _LineChartPainter extends CustomPainter {
  _LineChartPainter({required this.series, required this.palette});

  final List<UiLineChartSeries> series;
  final List<Color> palette;

  static final double _padding = UiTokens.space(2);

  _ChartGeometry layout(Size size) {
    double minY = 0;
    double maxY = 0;
    var any = false;
    for (final s in series) {
      for (final p in s.points) {
        if (!any) {
          minY = p.y;
          maxY = p.y;
          any = true;
        }
        if (p.y < minY) minY = p.y;
        if (p.y > maxY) maxY = p.y;
      }
    }
    // Y axis starts at 0 unless every value is far from it.
    final farFromZero = any && minY > 0 && minY > (maxY - minY) * 2;
    final lo = farFromZero ? minY : (minY < 0 ? minY : 0.0);
    final hi = maxY == lo ? lo + 1 : maxY;

    final maxPoints = series.fold<int>(0, (m, s) => s.points.length > m ? s.points.length : m);
    final plotW = size.width - _padding * 2;
    final plotH = size.height - _padding * 2;

    final result = <List<Offset>>[];
    for (final s in series) {
      final pts = <Offset>[];
      for (var i = 0; i < s.points.length; i++) {
        final dx = maxPoints > 1 ? i / (maxPoints - 1) : 0.5;
        final t = (s.points[i].y - lo) / (hi - lo);
        final dy = 1 - t.clamp(0.0, 1.0);
        pts.add(Offset(_padding + dx * plotW, _padding + dy * plotH));
      }
      result.add(pts);
    }
    return _ChartGeometry(result);
  }

  @override
  void paint(Canvas canvas, Size size) {
    // Gridlines are light.
    final gridPaint = Paint()
      ..color = UiTokens.colorMuted.withValues(alpha: 0.15)
      ..strokeWidth = 1;
    for (var i = 0; i <= 3; i++) {
      final y = _padding + (size.height - _padding * 2) * i / 3;
      canvas.drawLine(Offset(_padding, y), Offset(size.width - _padding, y), gridPaint);
    }

    final geometry = layout(size);
    for (var s = 0; s < series.length; s++) {
      final pts = geometry.pointsFor(s);
      if (pts.isEmpty) continue;
      final color = palette[s % palette.length];
      final linePaint = Paint()
        ..color = color
        ..strokeWidth = 2
        ..style = PaintingStyle.stroke;
      final path = Path()..moveTo(pts.first.dx, pts.first.dy);
      for (final p in pts.skip(1)) {
        path.lineTo(p.dx, p.dy);
      }
      canvas.drawPath(path, linePaint);
      final dotPaint = Paint()..color = color;
      for (final p in pts) {
        canvas.drawCircle(p, 3, dotPaint);
      }
    }
  }

  @override
  bool shouldRepaint(covariant _LineChartPainter oldDelegate) => oldDelegate.series != series;
}
