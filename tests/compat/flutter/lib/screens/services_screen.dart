// expect: pass
import 'package:flutter/widgets.dart' show StatelessWidget, Widget, BuildContext;
import 'package:compat_flutter/ui/ui.dart';
import 'package:easy_localization/easy_localization.dart';
import 'package:get_it/get_it.dart';
import 'package:auto_route/auto_route.dart';
import 'package:compat_flutter/state/cart.dart';
import 'package:compat_flutter/router/routes.dart';

class ServicesScreen extends StatelessWidget {
  const ServicesScreen({super.key});
  @override
  Widget build(BuildContext context) => UiStack(children: [
        UiButton(label: 'checkout'.tr(), onPress: () => GetIt.I<CartRepo>().clear()),
        UiButton(label: 'Cart', onPress: () => context.router.push(const CartRoute())),
      ]);
}
