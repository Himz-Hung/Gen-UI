// expect: pass
import 'package:flutter/widgets.dart' show StatelessWidget, Widget, BuildContext;
import 'package:compat_flutter_l10n/ui/ui.dart';
import 'package:compat_flutter_l10n/l10n/app_localizations.dart';

class ArbScreen extends StatelessWidget {
  const ArbScreen({super.key});
  @override
  Widget build(BuildContext context) {
    final t = AppLocalizations.of(context)!;
    return UiStack(children: [UiText(value: t.cartTitle), UiText(value: t.cartItems(3))]);
  }
}
