// The hand-written templates, mirroring examples/gallery-react/test/g0.test.tsx and g0b.test.tsx.
import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:gallery_flutter/ui/ui.dart';

Widget _host(Widget child) => MaterialApp(home: Scaffold(body: SingleChildScrollView(child: child)));

void main() {
  testWidgets('Button: presses, and never presses while disabled or loading', (tester) async {
    var pressed = 0;
    await tester.pumpWidget(_host(UiButton(label: 'Checkout', onPress: () => pressed++)));
    await tester.tap(find.text('Checkout'));
    expect(pressed, 1);
    await tester.pumpWidget(_host(UiButton(label: 'Checkout', disabled: true, onPress: () => pressed++)));
    await tester.tap(find.text('Checkout'), warnIfMissed: false);
    expect(pressed, 1);
    await tester.pumpWidget(_host(UiButton(label: 'Checkout', loading: true, onPress: () => pressed++)));
    await tester.tap(find.byType(UiButton), warnIfMissed: false);
    expect(pressed, 1);
  });

  testWidgets('Select: label is visible and change emits the value', (tester) async {
    String? changed;
    await tester.pumpWidget(_host(UiSelect(
      label: 'Set',
      value: '',
      options: const [UiSelectOption(value: '', label: 'All'), UiSelectOption(value: 'base', label: 'Base Set')],
      onChange: (v) => changed = v,
    )));
    expect(find.text('Set'), findsOneWidget);
    await tester.tap(find.text('All'));
    await tester.pumpAndSettle();
    await tester.tap(find.text('Base Set').last);
    await tester.pumpAndSettle();
    expect(changed, 'base');
  });

  testWidgets('Card: pressable emits press; not pressable never does', (tester) async {
    var pressed = 0;
    await tester.pumpWidget(_host(UiCard(pressable: true, onPress: () => pressed++, children: const [Text('Pikachu')])));
    await tester.tap(find.text('Pikachu'));
    expect(pressed, 1);
    await tester.pumpWidget(_host(UiCard(onPress: () => pressed++, children: const [Text('Pikachu')])));
    await tester.tap(find.text('Pikachu'));
    expect(pressed, 1);
  });

  testWidgets('Image: alt is the accessible name; the ratio box renders before load', (tester) async {
    final handle = tester.ensureSemantics();
    await tester.pumpWidget(_host(const SizedBox(width: 200, child: UiImage(src: 'https://example.com/a.jpg', alt: 'Charizard'))));
    expect(find.bySemanticsLabel('Charizard'), findsOneWidget);
    expect(find.byType(AspectRatio), findsOneWidget);
    handle.dispose();
  });
}
