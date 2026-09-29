// expect: Text is not a lib/ui component
// expect: Padding is not a lib/ui component
import 'package:flutter/widgets.dart' show StatelessWidget, Widget, BuildContext, Text, Padding, EdgeInsets;

class RawFlutterWidgetScreen extends StatelessWidget {
  const RawFlutterWidgetScreen({super.key});
  @override
  Widget build(BuildContext context) => Padding(padding: const EdgeInsets.all(8), child: Text('Hi'));
}
