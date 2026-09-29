// expect: pass
import 'package:flutter/widgets.dart' show StatelessWidget, Widget, BuildContext;
import 'package:compat_flutter/ui/ui.dart';
import 'package:go_router/go_router.dart';

class GoRouterScreen extends StatelessWidget {
  const GoRouterScreen({super.key});
  @override
  Widget build(BuildContext context) => UiStack(children: [
        UiButton(label: 'Cart', onPress: () => context.go('/cart')),
        UiButton(label: 'Push', onPress: () => context.push('/detail')),
        UiButton(label: 'Router', onPress: () => GoRouter.of(context).go('/home')),
      ]);
}
