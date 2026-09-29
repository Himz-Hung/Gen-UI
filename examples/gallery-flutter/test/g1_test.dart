import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';

import 'package:gallery_flutter/ui/ui.dart';

void main() {
  testWidgets('Stack lays out children top to bottom with a gap', (tester) async {
    await tester.pumpWidget(MaterialApp(
      home: Scaffold(
        body: SingleChildScrollView(
          child: UiStack(gap: UiStackGap.v4, children: const [Text('First'), Text('Second')]),
        ),
      ),
    ));

    expect(find.text('First'), findsOneWidget);
    expect(find.text('Second'), findsOneWidget);
    final firstTop = tester.getTopLeft(find.text('First')).dy;
    final secondTop = tester.getTopLeft(find.text('Second')).dy;
    expect(secondTop, greaterThan(firstTop));
  });

  testWidgets('Inline lays out children left to right and wraps', (tester) async {
    await tester.pumpWidget(MaterialApp(
      home: Scaffold(
        body: UiInline(gap: UiInlineGap.v2, children: const [Text('Left'), Text('Right')]),
      ),
    ));

    final leftLeft = tester.getTopLeft(find.text('Left')).dx;
    final rightLeft = tester.getTopLeft(find.text('Right')).dx;
    expect(rightLeft, greaterThan(leftLeft));
  });

  testWidgets('Grid renders every child and honours minItemWidth columns', (tester) async {
    await tester.pumpWidget(MaterialApp(
      home: Scaffold(
        body: SingleChildScrollView(
          child: SizedBox(
            width: 500,
            child: UiGrid(
              minItemWidth: 100,
              gap: UiGridGap.v4,
              children: [for (var i = 0; i < 6; i++) SizedBox(height: 40, child: Text('Item$i'))],
            ),
          ),
        ),
      ),
    ));

    for (var i = 0; i < 6; i++) {
      expect(find.text('Item$i'), findsOneWidget);
    }
    // 500px width, minItemWidth 100, gap 16 -> floor((500+16)/(100+16)) = 4 columns,
    // so Item0..Item3 share a row and Item4 starts a new row (lower on screen).
    final item0Top = tester.getTopLeft(find.text('Item0')).dy;
    final item3Top = tester.getTopLeft(find.text('Item3')).dy;
    final item4Top = tester.getTopLeft(find.text('Item4')).dy;
    expect(item3Top, item0Top);
    expect(item4Top, greaterThan(item0Top));
  });

  testWidgets('Container constrains content to the sm maxWidth', (tester) async {
    await tester.pumpWidget(MaterialApp(
      home: Scaffold(
        body: UiContainer(maxWidth: UiContainerMaxWidth.sm, children: const [Text('Contained')]),
      ),
    ));

    final constrainedBox = tester.widget<ConstrainedBox>(
      find.descendant(of: find.byType(UiContainer), matching: find.byType(ConstrainedBox)).first,
    );
    expect(constrainedBox.constraints.maxWidth, 640);
  });

  testWidgets('Spacer with grow pushes the trailing sibling to the far end', (tester) async {
    const leftKey = Key('left');
    const rightKey = Key('right');
    await tester.pumpWidget(const MaterialApp(
      home: Scaffold(
        body: Row(children: [Text('L', key: leftKey), UiSpacer(grow: true), Text('R', key: rightKey)]),
      ),
    ));

    final screenWidth = tester.getSize(find.byType(Scaffold)).width;
    final rightEdge = tester.getTopRight(find.byKey(rightKey)).dx;
    expect(rightEdge, closeTo(screenWidth, 1));
  });

  testWidgets('Divider renders a thin decorative line excluded from semantics', (tester) async {
    await tester.pumpWidget(const MaterialApp(
      home: Scaffold(body: UiDivider()),
    ));

    expect(find.descendant(of: find.byType(UiDivider), matching: find.byType(ExcludeSemantics)), findsOneWidget);
    final divider = tester.widget<Divider>(find.byType(Divider));
    expect(divider.thickness, 1);
    expect(divider.height, 1);
  });

  testWidgets('SectionHeader shows title/description and fires action', (tester) async {
    var actionPressed = false;
    await tester.pumpWidget(MaterialApp(
      home: Scaffold(
        body: UiSectionHeader(
          title: 'New arrivals',
          description: 'Fresh off the boat',
          actionLabel: 'See all',
          onAction: () => actionPressed = true,
        ),
      ),
    ));

    expect(find.text('New arrivals'), findsOneWidget);
    expect(find.text('Fresh off the boat'), findsOneWidget);
    await tester.tap(find.text('See all'));
    await tester.pump();
    expect(actionPressed, isTrue);
  });

  testWidgets('PullToRefresh fires refresh on pull and stays silent while refreshing', (tester) async {
    var refreshCount = 0;
    Widget buildApp({required bool refreshing}) => MaterialApp(
          home: Scaffold(
            body: UiPullToRefresh(
              label: 'Refresh cards',
              refreshing: refreshing,
              onRefresh: () => refreshCount++,
              children: [for (var i = 0; i < 20; i++) ListTile(title: Text('Card $i'))],
            ),
          ),
        );

    // While refreshing is already true, pulling never emits refresh again.
    await tester.pumpWidget(buildApp(refreshing: true));
    await tester.fling(find.byType(UiPullToRefresh), const Offset(0, 300), 1000);
    await tester.pumpAndSettle();
    expect(refreshCount, 0);

    // Pulling past the threshold while idle emits refresh.
    await tester.pumpWidget(buildApp(refreshing: false));
    await tester.fling(find.byType(UiPullToRefresh), const Offset(0, 300), 1000);
    await tester.pumpAndSettle();
    expect(refreshCount, 1);
  });

  testWidgets('InfiniteScroll load-more button fires loadMore and hides once hasMore is false', (tester) async {
    var loadMoreCalled = false;
    await tester.pumpWidget(MaterialApp(
      home: Scaffold(
        body: SingleChildScrollView(
          child: UiInfiniteScroll(
            loading: false,
            hasMore: true,
            loadMoreLabel: 'Load more cards',
            onLoadMore: () => loadMoreCalled = true,
            children: [for (var i = 0; i < 5; i++) Text('Card $i')],
          ),
        ),
      ),
    ));

    expect(find.text('Load more cards'), findsOneWidget);
    await tester.tap(find.text('Load more cards'));
    await tester.pump();
    expect(loadMoreCalled, isTrue);

    await tester.pumpWidget(MaterialApp(
      home: Scaffold(
        body: SingleChildScrollView(
          child: UiInfiniteScroll(
            loading: false,
            hasMore: false,
            loadMoreLabel: 'Load more cards',
            endText: 'You have seen everything',
            children: [for (var i = 0; i < 5; i++) Text('Card $i')],
          ),
        ),
      ),
    ));
    expect(find.text('Load more cards'), findsNothing);
    expect(find.text('You have seen everything'), findsOneWidget);
  });

  testWidgets('Text shows its value and truncates to a single line', (tester) async {
    await tester.pumpWidget(const MaterialApp(
      home: Scaffold(
        body: UiText(value: 'Charizard · Holo Rare', color: UiTextColor.danger, truncate: true),
      ),
    ));

    expect(find.text('Charizard · Holo Rare'), findsOneWidget);
    final textWidget = tester.widget<Text>(find.text('Charizard · Holo Rare'));
    expect(textWidget.maxLines, 1);
    expect(textWidget.overflow, TextOverflow.ellipsis);
  });

  testWidgets('Heading is exposed as a semantic header of the given level', (tester) async {
    final handle = tester.ensureSemantics();
    await tester.pumpWidget(const MaterialApp(
      home: Scaffold(
        body: UiHeading(value: 'Charizard', level: UiHeadingLevel.v1),
      ),
    ));

    expect(find.text('Charizard'), findsOneWidget);
    final semantics = tester.getSemantics(find.byType(UiHeading));
    expect(semantics.flagsCollection.isHeader, isTrue);
    handle.dispose();
  });

  testWidgets('IconButton fires press when enabled and never when disabled', (tester) async {
    var pressCount = 0;
    await tester.pumpWidget(MaterialApp(
      home: Scaffold(
        body: UiIconButton(icon: 'cart', label: 'Add to cart', onPress: () => pressCount++),
      ),
    ));
    await tester.tap(find.byType(UiIconButton));
    await tester.pump();
    expect(pressCount, 1);

    await tester.pumpWidget(MaterialApp(
      home: Scaffold(
        body: UiIconButton(icon: 'cart', label: 'Add to cart', disabled: true, onPress: () => pressCount++),
      ),
    ));
    await tester.tap(find.byType(UiIconButton));
    await tester.pump();
    expect(pressCount, 1);
  });

  testWidgets('Link fires press and is exposed with the link role', (tester) async {
    var pressCount = 0;
    final handle = tester.ensureSemantics();
    await tester.pumpWidget(MaterialApp(
      home: Scaffold(
        body: UiLink(label: 'See all new arrivals', variant: UiLinkVariant.standalone, onPress: () => pressCount++),
      ),
    ));

    final semantics = tester.getSemantics(find.byType(UiLink));
    expect(semantics.flagsCollection.isLink, isTrue);
    await tester.tap(find.byType(UiLink));
    await tester.pump();
    expect(pressCount, 1);
    handle.dispose();
  });
}
