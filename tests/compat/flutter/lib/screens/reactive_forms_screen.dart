// expect: pass
import 'package:flutter/widgets.dart' show StatelessWidget, Widget, BuildContext;
import 'package:compat_flutter/ui/ui.dart';
import 'package:reactive_forms/reactive_forms.dart';

final form = FormGroup({'email': FormControl<String>(validators: [Validators.email])});

class ReactiveFormsScreen extends StatelessWidget {
  const ReactiveFormsScreen({super.key});
  @override
  Widget build(BuildContext context) => ReactiveForm(
        formGroup: form,
        child: ReactiveValueListenableBuilder<String>(
          formControlName: 'email',
          builder: (context, control, _) => UiInput(label: 'Email', value: control.value ?? '', onChange: (v) => control.value = v),
        ),
      );
}
