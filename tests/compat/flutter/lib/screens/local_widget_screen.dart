// expect: locally defined widget
import 'package:flutter/widgets.dart' show StatelessWidget, Widget, BuildContext;
import 'package:compat_flutter/ui/ui.dart';

class LocalWidgetScreen extends StatelessWidget {
  const LocalWidgetScreen({super.key});
  @override
  Widget build(BuildContext context) => const UiText(value: 'x');
}

class Badge extends StatelessWidget {
  const Badge({super.key});
  @override
  Widget build(BuildContext context) => const UiText(value: 'b');
}
