import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:gallery_flutter/ui/ui.dart';

Widget _host(Widget child) => MaterialApp(home: Scaffold(body: SingleChildScrollView(child: child)));

void main() {
  testWidgets('FloatingActionButton: floats, presses, and never presses while disabled', (tester) async {
    var pressed = 0;
    await tester.pumpWidget(_host(UiFloatingActionButton(label: 'New order', icon: 'plus', onPress: () => pressed++)));
    await tester.pump();
    expect(find.byType(FloatingActionButton), findsOneWidget);
    await tester.tap(find.byType(FloatingActionButton));
    expect(pressed, 1);

    await tester.pumpWidget(_host(UiFloatingActionButton(label: 'New order', icon: 'plus', extended: true, disabled: true, onPress: () => pressed++)));
    await tester.pump();
    expect(find.text('New order'), findsOneWidget);
    await tester.tap(find.text('New order'), warnIfMissed: false);
    expect(pressed, 1);
  });

  testWidgets('HorizontalScroll: one row that scrolls sideways', (tester) async {
    await tester.pumpWidget(_host(UiHorizontalScroll(
      label: 'New arrivals',
      itemWidth: 180,
      showArrows: false,
      children: [for (var i = 0; i < 10; i++) Text('Item $i')],
    )));
    expect(find.text('Item 0'), findsOneWidget);
    // Items stay on one row: the tenth is laid out to the right of the first, off screen.
    expect(tester.getTopLeft(find.text('Item 9')).dy, tester.getTopLeft(find.text('Item 0')).dy);
    expect(tester.getTopLeft(find.text('Item 9')).dx, greaterThan(800));
    await tester.drag(find.byType(SingleChildScrollView).last, const Offset(-600, 0));
    await tester.pumpAndSettle();
    expect(tester.getTopLeft(find.text('Item 0')).dx, lessThan(0));
  });

  testWidgets('ImageViewer: closed shows nothing; open shows counter, moves and closes', (tester) async {
    const images = [UiImageViewerImage(src: 'https://example.com/a.jpg', alt: 'Front'), UiImageViewerImage(src: 'https://example.com/b.jpg', alt: 'Back')];
    int? changed;
    var closed = false;
    await tester.pumpWidget(_host(const UiImageViewer(open: false, label: 'Card photos', images: images)));
    await tester.pump();
    expect(find.text('1 / 2'), findsNothing);

    await tester.pumpWidget(_host(UiImageViewer(open: true, label: 'Card photos', images: images, onChange: (i) => changed = i, onClose: () => closed = true)));
    await tester.pump();
    await tester.pump();
    expect(find.text('1 / 2'), findsOneWidget);
    await tester.tap(find.byTooltip('Next image'));
    expect(changed, 1);
    await tester.tap(find.byTooltip('Close'));
    expect(closed, isTrue);
  });

  testWidgets('RichText: formats the subset, lists, headings and emits link', (tester) async {
    String? link;
    await tester.pumpWidget(_host(UiRichText(
      markdown: '## Details\n\n**Near mint.** Shipped in a toploader.\n\n- Base Set, 1999\n- [Grading guide](https://example.com/g)\n\n<b>raw</b>',
      onLink: (u) => link = u,
    )));
    expect(find.text('Details'), findsOneWidget);
    expect(find.text('•'), findsNWidgets(2));
    expect(find.textContaining('<b>raw</b>'), findsOneWidget); // HTML stays plain text
    final para = find.byWidgetPredicate((w) => w is RichText && w.text.toPlainText().contains('Grading guide'));
    expect(para, findsOneWidget);
    final span = (tester.widget<RichText>(para).text as TextSpan);
    TextSpan? linkSpan;
    span.visitChildren((s) { if (s is TextSpan && s.text == 'Grading guide') linkSpan = s; return true; });
    (linkSpan!.recognizer as dynamic).onTap();
    expect(link, 'https://example.com/g');
  });

  testWidgets('IconButton: badge shows the count, 99+ above 99, and joins the name', (tester) async {
    await tester.pumpWidget(_host(const Row(children: [
      UiIconButton(icon: 'cart', label: 'Cart', badge: '3'),
      UiIconButton(icon: 'cart', label: 'Big cart', badge: '120'),
      UiIconButton(icon: 'cart', label: 'Plain'),
    ])));
    expect(find.text('3'), findsOneWidget);
    expect(find.text('99+'), findsOneWidget);
    expect(find.bySemanticsLabel('Cart, 3'), findsOneWidget);
    expect(find.bySemanticsLabel('Plain'), findsOneWidget);
  });
}
