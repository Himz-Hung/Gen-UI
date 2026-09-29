// expect: with "show"
import 'package:flutter/material.dart';
import 'package:compat_flutter/ui/ui.dart';

class MaterialImportScreen extends StatelessWidget {
  const MaterialImportScreen({super.key});
  @override
  Widget build(BuildContext context) => const UiText(value: 'x');
}
