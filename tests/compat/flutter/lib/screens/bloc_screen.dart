// expect: pass
import 'package:flutter/widgets.dart' show StatelessWidget, Widget, BuildContext;
import 'package:compat_flutter/ui/ui.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:compat_flutter/state/cart.dart';

class BlocScreen extends StatelessWidget {
  const BlocScreen({super.key});
  @override
  Widget build(BuildContext context) => BlocProvider(
        create: (_) => CartCubit(),
        child: BlocBuilder<CartCubit, int>(
          builder: (context, n) => UiButton(label: '$n', onPress: () => context.read<CartCubit>().clear()),
        ),
      );
}
