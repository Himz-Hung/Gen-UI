// expect: pass
import 'package:flutter/widgets.dart' show StatelessWidget, Widget, BuildContext;
import 'package:compat_flutter/ui/ui.dart';
import 'package:get/get.dart';
import 'package:compat_flutter/state/cart.dart';

class GetxScreen extends StatelessWidget {
  const GetxScreen({super.key});
  @override
  Widget build(BuildContext context) {
    final c = Get.find<CartController>();
    return Obx(() => UiButton(label: '${c.count.value}', onPress: () => Get.toNamed('/cart')));
  }
}
