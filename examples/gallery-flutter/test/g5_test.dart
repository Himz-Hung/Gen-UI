import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:gallery_flutter/ui/ui.dart';

void main() {
  group('UiModal', () {
    testWidgets('open=false renders no title', (tester) async {
      await tester.pumpWidget(const MaterialApp(home: Scaffold(body: UiModal(open: false, title: 'Order details'))));
      expect(find.text('Order details'), findsNothing);
    });

    testWidgets('open=true shows title and barrier tap calls onClose', (tester) async {
      var closed = false;
      await tester.pumpWidget(MaterialApp(
        home: Scaffold(
          body: UiModal(
            open: true,
            title: 'Order details',
            onClose: () => closed = true,
            children: const [Text('Body content')],
          ),
        ),
      ));
      await tester.pumpAndSettle();

      expect(find.text('Order details'), findsOneWidget);
      expect(find.text('Body content'), findsOneWidget);

      // Tap the corner of the screen, outside the centered panel, to hit the backdrop.
      await tester.tapAt(const Offset(4, 4));
      await tester.pumpAndSettle();
      expect(closed, isTrue);
    });

    testWidgets('renders inside an unbounded Column without crashing', (tester) async {
      // Regression: a naive Stack/Positioned.fill overlay sizes to its
      // immediate parent's constraints, which are unbounded inside a plain
      // Column. UiModal must render through the app's Overlay instead.
      await tester.pumpWidget(const MaterialApp(
        home: Scaffold(
          body: Column(children: [Text('Above'), UiModal(open: true, title: 'In a column')]),
        ),
      ));
      await tester.pumpAndSettle();

      expect(tester.takeException(), isNull);
      expect(find.text('In a column'), findsOneWidget);
    });
  });

  group('UiDrawer', () {
    testWidgets('open=false renders no title', (tester) async {
      await tester.pumpWidget(const MaterialApp(home: Scaffold(body: UiDrawer(open: false, title: 'Filters'))));
      expect(find.text('Filters'), findsNothing);
    });

    testWidgets('open=true shows title and close control calls onClose', (tester) async {
      var closed = false;
      await tester.pumpWidget(MaterialApp(
        home: Scaffold(
          body: UiDrawer(
            open: true,
            title: 'Filters',
            side: UiDrawerSide.end,
            onClose: () => closed = true,
            children: const [Text('Filter body')],
          ),
        ),
      ));
      await tester.pumpAndSettle();

      expect(find.text('Filters'), findsOneWidget);
      expect(find.text('Filter body'), findsOneWidget);

      await tester.tap(find.byIcon(Icons.close));
      await tester.pumpAndSettle();
      expect(closed, isTrue);
    });
  });

  group('UiConfirmDialog', () {
    testWidgets('confirm calls onConfirm', (tester) async {
      var confirmed = false;
      await tester.pumpWidget(MaterialApp(
        home: Scaffold(
          body: UiConfirmDialog(
            open: true,
            title: 'Delete this order?',
            message: 'This cannot be undone.',
            confirmLabel: 'Delete order',
            cancelLabel: 'Keep it',
            tone: UiConfirmDialogTone.danger,
            onConfirm: () => confirmed = true,
            onCancel: () {},
          ),
        ),
      ));
      await tester.pumpAndSettle();

      expect(find.text('Delete this order?'), findsOneWidget);
      await tester.tap(find.text('Delete order'));
      await tester.pumpAndSettle();
      expect(confirmed, isTrue);
    });

    testWidgets('loading=true disables cancel', (tester) async {
      var cancelled = false;
      await tester.pumpWidget(MaterialApp(
        home: Scaffold(
          body: UiConfirmDialog(
            open: true,
            title: 'Delete this order?',
            message: 'This cannot be undone.',
            confirmLabel: 'Delete order',
            cancelLabel: 'Keep it',
            loading: true,
            onConfirm: () {},
            onCancel: () => cancelled = true,
          ),
        ),
      ));
      // Don't pumpAndSettle: the loading confirm button's spinner animates
      // indefinitely, so settle would never return.
      await tester.pump();

      await tester.tap(find.text('Keep it'), warnIfMissed: false);
      await tester.pump();
      expect(cancelled, isFalse);
    });
  });

  group('UiMenu', () {
    testWidgets('opens on trigger tap and calls onSelect', (tester) async {
      String? selected;
      await tester.pumpWidget(MaterialApp(
        home: Scaffold(
          body: UiMenu(
            label: 'Card actions',
            items: const [
              UiMenuItem(value: 'share', label: 'Share', icon: 'share'),
              UiMenuItem(value: 'delete', label: 'Delete', icon: 'trash', danger: true),
            ],
            onSelect: (v) => selected = v,
            children: const [UiButton(label: 'Actions')],
          ),
        ),
      ));
      await tester.pumpAndSettle();

      expect(find.text('Share'), findsNothing);

      // The trigger's own hit testing is deliberately ignored (UiMenu wraps
      // it in IgnorePointer and opens via its own GestureDetector instead),
      // so the tap lands on that wrapper rather than the Text/Button itself.
      await tester.tap(find.text('Actions'), warnIfMissed: false);
      await tester.pumpAndSettle();

      expect(find.text('Share'), findsOneWidget);
      expect(find.text('Delete'), findsOneWidget);

      await tester.tap(find.text('Delete'));
      await tester.pumpAndSettle();

      expect(selected, 'delete');
    });
  });

  group('UiLineChart', () {
    testWidgets('renders summary text when empty', (tester) async {
      await tester.pumpWidget(const MaterialApp(
        home: Scaffold(body: UiLineChart(summary: 'No sales recorded this week', series: [])),
      ));
      expect(find.text('No sales recorded this week'), findsOneWidget);
    });
  });

  group('UiBarChart', () {
    testWidgets('renders summary text when empty', (tester) async {
      await tester.pumpWidget(const MaterialApp(
        home: Scaffold(body: UiBarChart(summary: 'No orders yet', bars: [])),
      ));
      expect(find.text('No orders yet'), findsOneWidget);
    });

    testWidgets('tapping a bar calls onBarPress with its index', (tester) async {
      int? pressedIndex;
      await tester.pumpWidget(MaterialApp(
        home: Scaffold(
          body: UiBarChart(
            summary: 'Base Set sells the most',
            bars: const [
              UiBarChartBar(label: 'Base Set', value: 42),
              UiBarChartBar(label: 'Jungle', value: 18),
            ],
            onBarPress: (i) => pressedIndex = i,
          ),
        ),
      ));
      await tester.pumpAndSettle();

      final gestures = find.descendant(of: find.byType(UiBarChart), matching: find.byType(GestureDetector));
      expect(gestures, findsNWidgets(2));
      await tester.tap(gestures.first);
      await tester.pumpAndSettle();

      expect(pressedIndex, 0);
    });
  });

  group('UiPieChart', () {
    testWidgets('renders summary text when empty', (tester) async {
      await tester.pumpWidget(const MaterialApp(
        home: Scaffold(body: UiPieChart(summary: 'No data available', slices: [])),
      ));
      expect(find.text('No data available'), findsOneWidget);
    });

    testWidgets('tapping a slice calls onSlicePress', (tester) async {
      int? pressedIndex;
      await tester.pumpWidget(MaterialApp(
        home: Scaffold(
          body: UiPieChart(
            summary: 'Most orders are near-mint cards',
            slices: const [
              UiPieChartSlice(label: 'Near mint', value: 60),
              UiPieChartSlice(label: 'Played', value: 40),
            ],
            donut: false,
            onSlicePress: (i) => pressedIndex = i,
          ),
        ),
      ));
      await tester.pumpAndSettle();

      // Near-mint is the first slice, drawn clockwise from the top, so a point
      // just above the pie's own center (near the 12 o'clock mark) hits it.
      // Target the CustomPaint (the plot itself), not the whole column, since
      // the legend below shifts the widget's overall center down.
      final pieCenter = tester.getCenter(find.descendant(of: find.byType(UiPieChart), matching: find.byType(GestureDetector)).first);
      await tester.tapAt(pieCenter - const Offset(0, 50));
      await tester.pumpAndSettle();

      expect(pressedIndex, 0);
    });
  });
}
