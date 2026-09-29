import 'package:flutter_test/flutter_test.dart';
import 'package:gallery_flutter/main.dart';

void main() {
  testWidgets('the gallery home renders and its demo button works', (tester) async {
    await tester.pumpWidget(const GalleryApp());
    expect(find.text('Component gallery'), findsOneWidget);
    expect(find.text('Pressed 0 times'), findsOneWidget);
    await tester.tap(find.text('Primary'));
    await tester.pump();
    expect(find.text('Pressed 1 times'), findsOneWidget);
    await tester.ensureVisible(find.text('Details'));
    await tester.pumpAndSettle();
    await tester.tap(find.text('Details'));
    await tester.pump();
    expect(find.text('Details content'), findsOneWidget);
  });
}
