import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';

import 'package:gallery_flutter/ui/ui.dart';

Future<void> pumpUi(WidgetTester tester, Widget child) {
  return tester.pumpWidget(MaterialApp(
    home: Scaffold(body: SingleChildScrollView(child: child)),
  ));
}

void main() {
  testWidgets('Badge shows its label', (tester) async {
    await pumpUi(tester, const UiBadge(label: 'Holo', tone: UiBadgeTone.success));
    expect(find.text('Holo'), findsOneWidget);
  });

  testWidgets('Tag remove control calls onRemove', (tester) async {
    var removed = false;
    await pumpUi(
      tester,
      UiTag(label: 'In stock', onRemove: () => removed = true),
    );
    expect(find.text('In stock'), findsOneWidget);
    await tester.tap(find.byTooltip('Remove In stock'));
    await tester.pump();
    expect(removed, isTrue);
  });

  testWidgets('Stat shows label and value', (tester) async {
    await pumpUi(
      tester,
      const UiStat(label: 'Total', value: '\$124.00', trend: UiStatTrend.up, hint: 'vs last week'),
    );
    expect(find.text('Total'), findsOneWidget);
    expect(find.text('\$124.00'), findsOneWidget);
    expect(find.text('vs last week'), findsOneWidget);
  });

  testWidgets('List separates rows with dividers, none after the last', (tester) async {
    await pumpUi(
      tester,
      const UiList(children: [
        UiListItem(title: 'Charizard', subtitle: 'Base Set', trailing: '\$300'),
        UiListItem(title: 'Pikachu', subtitle: 'Jungle', trailing: '\$20'),
        UiListItem(title: 'Blastoise', subtitle: 'Base Set', trailing: '\$150'),
      ]),
    );
    expect(find.text('Charizard'), findsOneWidget);
    expect(find.text('Pikachu'), findsOneWidget);
    expect(find.text('Blastoise'), findsOneWidget);
    // 3 rows => 2 dividers, none after the last row.
    expect(find.byType(Divider), findsNWidgets(2));
  });

  testWidgets('ListItem is pressable and reports press', (tester) async {
    var pressed = false;
    await pumpUi(
      tester,
      UiListItem(title: 'Pikachu', pressable: true, onPress: () => pressed = true),
    );
    await tester.tap(find.text('Pikachu'));
    await tester.pump();
    expect(pressed, isTrue);
  });

  testWidgets('Table sorts and reports row press', (tester) async {
    String? sortedKey;
    String? pressedRowId;
    await pumpUi(
      tester,
      UiTable(
        columns: const [
          UiTableColumn(key: 'id', label: 'Order'),
          UiTableColumn(key: 'total', label: 'Total', align: UiTableAlign.end, sortable: true),
        ],
        rows: const [
          UiTableRow(id: 'A-1001', cells: ['A-1001', '\$42.00']),
          UiTableRow(id: 'A-1002', cells: ['A-1002', '\$18.00']),
        ],
        sortKey: 'total',
        pressableRows: true,
        onSort: (key) => sortedKey = key,
        onRowPress: (id) => pressedRowId = id,
      ),
    );
    expect(find.text('A-1001'), findsOneWidget);
    await tester.tap(find.text('Total'));
    await tester.pump();
    expect(sortedKey, 'total');

    await tester.tap(find.text('A-1002'));
    await tester.pump();
    expect(pressedRowId, 'A-1002');
  });

  testWidgets('Table shows emptyText when there are no rows', (tester) async {
    await pumpUi(
      tester,
      const UiTable(
        columns: [UiTableColumn(key: 'id', label: 'Order')],
        rows: [],
        emptyText: 'No orders yet',
      ),
    );
    expect(find.text('No orders yet'), findsOneWidget);
  });

  testWidgets('Avatar without src shows initials', (tester) async {
    await pumpUi(
      tester,
      const UiAvatar(name: 'Ash Ketchum', size: UiAvatarSize.lg, status: UiAvatarStatus.online),
    );
    expect(find.text('AK'), findsOneWidget);
  });

  testWidgets('Accordion toggles open sections via onChange', (tester) async {
    List<String>? newOpen;
    await pumpUi(
      tester,
      UiAccordion(
        items: const [
          UiAccordionItem(value: 'ship', title: 'How long does shipping take?'),
          UiAccordionItem(value: 'return', title: 'Can I return a card?'),
        ],
        open: const ['ship'],
        onChange: (v) => newOpen = v,
        children: const [
          Text('It ships in 3-5 days.'),
          Text('Yes, within 30 days.'),
        ],
      ),
    );
    // Open section's content is in the layout; the closed one is not.
    expect(find.text('It ships in 3-5 days.'), findsOneWidget);
    expect(find.text('Yes, within 30 days.'), findsNothing);

    await tester.tap(find.text('Can I return a card?'));
    await tester.pump();
    expect(newOpen, ['return']);
  });

  testWidgets('DescriptionList shows label-value pairs', (tester) async {
    await pumpUi(
      tester,
      const UiDescriptionList(items: [
        UiDescriptionListItem(label: 'Set', value: 'Base Set'),
        UiDescriptionListItem(label: 'Condition', value: 'Near mint'),
      ]),
    );
    expect(find.text('Set'), findsOneWidget);
    expect(find.text('Base Set'), findsOneWidget);
    expect(find.text('Condition'), findsOneWidget);
    expect(find.text('Near mint'), findsOneWidget);
  });

  testWidgets('Timeline lists events in order with time shown', (tester) async {
    await pumpUi(
      tester,
      const UiTimeline(items: [
        UiTimelineItem(title: 'Order placed', time: 'Sep 28, 10:02'),
        UiTimelineItem(title: 'Shipped', time: 'Sep 29', tone: UiTimelineTone.success),
      ]),
    );
    expect(find.text('Order placed'), findsOneWidget);
    expect(find.text('Shipped'), findsOneWidget);
    expect(find.text('Sep 29'), findsOneWidget);
  });

  testWidgets('SwipeActions reveals an action on swipe and reports it', (tester) async {
    String? actioned;
    await pumpUi(
      tester,
      UiSwipeActions(
        actions: const [UiSwipeActionsAction(value: 'delete', label: 'Delete', icon: 'trash', tone: UiSwipeActionsTone.danger)],
        onAction: (v) => actioned = v,
        children: const [UiListItem(title: 'Pikachu', subtitle: 'Jungle')],
      ),
    );
    expect(find.text('Pikachu'), findsOneWidget);
    // UiSwipeActions is HitTestBehavior.opaque so the whole row is swipeable even where the
    // finder's own geometry (a shrink-wrapped title column) doesn't literally cover this point.
    await tester.drag(find.byType(UiListItem), const Offset(-200, 0), warnIfMissed: false);
    await tester.pump();
    expect(find.text('Delete'), findsOneWidget);

    await tester.tap(find.text('Delete'));
    await tester.pump();
    expect(actioned, 'delete');
  });

  testWidgets('Icon renders the mapped icon with an accessible label', (tester) async {
    await pumpUi(tester, const UiIcon(name: 'star', color: UiIconColor.warning, label: 'Favourite'));
    expect(find.byIcon(uiIconData('star')), findsOneWidget);
    final semantics = tester.getSemantics(find.byType(UiIcon));
    expect(semantics.label, 'Favourite');
  });

  testWidgets('Carousel advances to the next slide via the next control', (tester) async {
    int? changedTo;
    await pumpUi(
      tester,
      UiCarousel(
        label: 'Card photos',
        onChange: (i) => changedTo = i,
        children: const [
          ColoredBox(color: Colors.red, child: SizedBox(width: 200, height: 120)),
          ColoredBox(color: Colors.blue, child: SizedBox(width: 200, height: 120)),
        ],
      ),
    );
    await tester.tap(find.byTooltip('Next slide'));
    await tester.pumpAndSettle();
    expect(changedTo, 1);
  });

  testWidgets('Video shows a play control that toggles', (tester) async {
    await pumpUi(
      tester,
      const UiVideo(src: 'https://example.com/unboxing.mp4', label: 'Unboxing video', poster: 'https://example.com/poster.jpg'),
    );
    expect(find.byTooltip('Play'), findsOneWidget);
    await tester.tap(find.byTooltip('Play'));
    await tester.pump();
    expect(find.byTooltip('Pause'), findsOneWidget);
  });

  testWidgets('Table: loading keeps the header and hides rows and emptyText', (tester) async {
    await tester.pumpWidget(MaterialApp(home: Scaffold(body: UiTable(
      columns: const [UiTableColumn(key: 'id', label: 'Order')],
      rows: const [UiTableRow(id: 'A-1', cells: ['A-1'])],
      emptyText: 'No orders',
      loading: true,
    ))));
    expect(find.text('Order'), findsOneWidget);
    expect(find.text('A-1'), findsNothing);
    expect(find.text('No orders'), findsNothing);
  });
}
