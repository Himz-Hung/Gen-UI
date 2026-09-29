// expect: Navigator is not a lib/ui component
import 'package:flutter/widgets.dart' show StatelessWidget, Widget, BuildContext, Navigator;

class ConstructsNavigatorScreen extends StatelessWidget {
  const ConstructsNavigatorScreen({super.key});
  @override
  Widget build(BuildContext context) => Navigator(pages: const []);
}
