// The generated theme (lib/ui/theme.g.dart): context.ui follows light / dark, and components read it.
import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:gallery_flutter/ui/theme.g.dart';

Widget _app(ThemeMode mode) => MaterialApp(
      theme: uiTheme(),
      darkTheme: uiTheme(colorScheme: UiColorScheme.dark),
      themeMode: mode,
      home: Builder(builder: (context) => Text('x', key: const Key('probe'), style: TextStyle(color: context.ui.color.text))),
    );

void main() {
  testWidgets('context.ui follows the theme mode', (tester) async {
    await tester.pumpWidget(_app(ThemeMode.light));
    var ctx = tester.element(find.byKey(const Key('probe')));
    expect(ctx.ui.color.surface, const Color(0xFFFFFFFF));
    expect(ctx.ui.color.primary, const Color(0xFF2563EB));
    await tester.pumpWidget(_app(ThemeMode.dark));
    await tester.pumpAndSettle();
    ctx = tester.element(find.byKey(const Key('probe')));
    expect(ctx.ui.color.surface, const Color(0xFF0F172A));
    expect(ctx.ui.color.primary, const Color(0xFF60A5FA));
    expect(ctx.ui.color.onPrimary, const Color(0xFF0F172A));
    expect(Theme.of(ctx).brightness, Brightness.dark);
  });

  test('switching animates through lerp', () {
    final mid = uiThemeFor().lerp(uiThemeFor(colorScheme: UiColorScheme.dark), 0.5);
    expect(mid.color.surface, Color.lerp(const Color(0xFFFFFFFF), const Color(0xFF0F172A), 0.5));
  });
}
