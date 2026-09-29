// expect: ReactiveTextField is not a lib/ui component
import 'package:flutter/widgets.dart' show StatelessWidget, Widget, BuildContext;
import 'package:compat_flutter/ui/ui.dart';
import 'package:reactive_forms/reactive_forms.dart';

class PackageWidgetScreen extends StatelessWidget {
  const PackageWidgetScreen({super.key});
  @override
  Widget build(BuildContext context) => ReactiveTextField<String>(formControlName: 'email');
}
