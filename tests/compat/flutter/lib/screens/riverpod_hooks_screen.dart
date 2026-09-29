// expect: pass
import 'package:flutter/widgets.dart' show Widget, BuildContext;
import 'package:compat_flutter/ui/ui.dart';
import 'package:hooks_riverpod/hooks_riverpod.dart';
import 'package:flutter_hooks/flutter_hooks.dart';
import 'package:compat_flutter/state/cart.dart';

class RiverpodHooksScreen extends HookConsumerWidget {
  const RiverpodHooksScreen({super.key});
  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final taps = useState(0);
    final count = ref.watch(countProvider);
    return UiStack(children: [
      UiButton(label: '$count ${taps.value}', onPress: () => taps.value++),
      Consumer(builder: (context, ref, _) => UiText(value: '${ref.watch(countProvider)}')),
    ]);
  }
}
