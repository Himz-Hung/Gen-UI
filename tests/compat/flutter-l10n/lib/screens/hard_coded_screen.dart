// expect: hard-coded text "Your cart" in a project with languages en, vi: use AppLocalizations.of(context)!
import 'package:flutter/widgets.dart' show StatelessWidget, Widget, BuildContext;
import 'package:compat_flutter_l10n/ui/ui.dart';

class HardCodedScreen extends StatelessWidget {
  const HardCodedScreen({super.key});
  @override
  Widget build(BuildContext context) => const UiText(value: 'Your cart');
}
