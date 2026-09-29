// expect: pass
import 'package:flutter/widgets.dart' show StatelessWidget, Widget, BuildContext;
import 'package:compat_flutter/ui/ui.dart';
import 'package:flutter_form_builder/flutter_form_builder.dart';

class FormBuilderScreen extends StatelessWidget {
  const FormBuilderScreen({super.key});
  @override
  Widget build(BuildContext context) => FormBuilder(
        child: FormBuilderField<String>(
          name: 'email',
          builder: (field) => UiInput(label: 'Email', value: field.value ?? '', error: field.errorText, onChange: field.didChange),
        ),
      );
}
