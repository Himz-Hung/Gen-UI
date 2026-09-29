// expect: pass
import 'package:flutter/widgets.dart' show StatelessWidget, Widget, BuildContext, Navigator, MediaQuery;
import 'package:flutter/material.dart' show Theme, ScaffoldMessenger;
import 'package:compat_flutter/ui/ui.dart';

class NavigatorScreen extends StatelessWidget {
  const NavigatorScreen({super.key});
  @override
  Widget build(BuildContext context) {
    final wide = MediaQuery.sizeOf(context).width > 600;
    final dark = Theme.of(context).brightness.name == 'dark';
    return UiStack(children: [
      UiButton(label: wide && dark ? 'Wide' : 'Narrow', onPress: () => Navigator.of(context).pushNamed('/cart')),
      UiButton(label: 'Back', onPress: () => Navigator.pop(context)),
      UiButton(label: 'Clear', onPress: () => ScaffoldMessenger.of(context).clearSnackBars()),
    ]);
  }
}
