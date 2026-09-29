import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';

import 'package:gallery_flutter/ui/ui.dart';

Widget _host(Widget child) {
  return MaterialApp(home: Scaffold(body: SingleChildScrollView(child: child)));
}

void main() {
  testWidgets('Input: label visible, typing calls onChange, disabled blocks it', (tester) async {
    String? changed;
    await tester.pumpWidget(_host(UiInput(
      label: 'Email',
      value: '',
      type: UiInputType.email,
      onChange: (v) => changed = v,
    )));
    expect(find.text('Email'), findsOneWidget);

    await tester.enterText(find.byType(TextField), 'a@b.com');
    expect(changed, 'a@b.com');

    changed = null;
    await tester.pumpWidget(_host(const UiInput(label: 'Email', value: '', disabled: true)));
    expect(tester.widget<TextField>(find.byType(TextField)).enabled, isFalse);
  });

  testWidgets('Textarea: typing calls onChange and counter reflects maxLength', (tester) async {
    String? changed;
    await tester.pumpWidget(_host(UiTextarea(
      label: 'Note to seller',
      value: '',
      maxLength: 10,
      onChange: (v) => changed = v,
    )));
    expect(find.text('Note to seller'), findsOneWidget);

    await tester.enterText(find.byType(TextField), 'hello');
    await tester.pump();
    expect(changed, 'hello');
    expect(find.text('5 / 10'), findsOneWidget);
  });

  testWidgets('SearchBox: change/search/clear events fire correctly', (tester) async {
    String? changedValue;
    String? searched;
    var cleared = false;
    await tester.pumpWidget(_host(UiSearchBox(
      value: '',
      onChange: (v) => changedValue = v,
      onSearch: (v) => searched = v,
      onClear: () => cleared = true,
    )));

    await tester.enterText(find.byType(TextField), 'pikachu');
    await tester.pump();
    expect(changedValue, 'pikachu');

    await tester.testTextInput.receiveAction(TextInputAction.search);
    expect(searched, 'pikachu');

    await tester.tap(find.byIcon(Icons.close));
    await tester.pump();
    expect(cleared, isTrue);
    expect(tester.widget<TextField>(find.byType(TextField)).controller!.text, '');
  });

  testWidgets('Checkbox: tapping toggles, disabled does not call onChange', (tester) async {
    bool? changed;
    await tester.pumpWidget(_host(UiCheckbox(
      label: 'Accept terms',
      checked: false,
      onChange: (v) => changed = v,
    )));
    expect(find.text('Accept terms'), findsOneWidget);
    await tester.tap(find.text('Accept terms'));
    expect(changed, isTrue);

    changed = null;
    await tester.pumpWidget(_host(UiCheckbox(
      label: 'Accept terms',
      checked: false,
      disabled: true,
      onChange: (v) => changed = v,
    )));
    await tester.tap(find.text('Accept terms'));
    expect(changed, isNull);
  });

  testWidgets('RadioGroup: pressing an option label selects it; disabled blocks it', (tester) async {
    String? changed;
    const options = [
      UiRadioGroupOption(value: 'standard', label: 'Standard'),
      UiRadioGroupOption(value: 'express', label: 'Express'),
    ];
    await tester.pumpWidget(_host(UiRadioGroup(
      label: 'Shipping',
      value: 'standard',
      options: options,
      onChange: (v) => changed = v,
    )));
    await tester.tap(find.text('Express'));
    expect(changed, 'express');

    changed = null;
    await tester.pumpWidget(_host(UiRadioGroup(
      label: 'Shipping',
      value: 'standard',
      options: options,
      disabled: true,
      onChange: (v) => changed = v,
    )));
    await tester.tap(find.text('Express'));
    expect(changed, isNull);
  });

  testWidgets('Switch: tapping toggles, disabled does not call onChange', (tester) async {
    bool? changed;
    await tester.pumpWidget(_host(UiSwitch(
      label: 'Notifications',
      checked: true,
      onChange: (v) => changed = v,
    )));
    await tester.tap(find.text('Notifications'));
    expect(changed, isFalse);

    changed = null;
    await tester.pumpWidget(_host(UiSwitch(
      label: 'Notifications',
      checked: true,
      disabled: true,
      onChange: (v) => changed = v,
    )));
    await tester.tap(find.text('Notifications'));
    expect(changed, isNull);
  });

  testWidgets('Slider: value is clamped to [min, max]', (tester) async {
    double? changed;
    await tester.pumpWidget(_host(UiSlider(
      label: 'Max price',
      value: 500,
      min: 0,
      max: 200,
      step: 5,
      onChange: (v) => changed = v,
    )));
    expect(tester.widget<Slider>(find.byType(Slider)).value, 200);

    await tester.drag(find.byType(Slider), const Offset(-100, 0));
    expect(changed, isNotNull);
  });

  testWidgets('NumberInput: clamps on blur and disables +/- at bounds', (tester) async {
    double? changed;
    await tester.pumpWidget(_host(UiNumberInput(
      label: 'Quantity',
      value: 5,
      min: 1,
      max: 10,
      onChange: (v) => changed = v,
    )));
    await tester.enterText(find.byType(TextField), '25');
    FocusManager.instance.primaryFocus?.unfocus();
    await tester.pump();
    expect(changed, 10);
    expect(find.text('10'), findsOneWidget);

    await tester.pumpWidget(_host(const UiNumberInput(label: 'Quantity', value: 1, min: 1, max: 10)));
    final decrease = tester.widget<IconButton>(find.widgetWithIcon(IconButton, Icons.remove));
    expect(decrease.onPressed, isNull);

    await tester.pumpWidget(_host(const UiNumberInput(label: 'Quantity', value: 10, min: 1, max: 10)));
    final increase = tester.widget<IconButton>(find.widgetWithIcon(IconButton, Icons.add));
    expect(increase.onPressed, isNull);
  });

  testWidgets('DatePicker: opens a date dialog, disabled does not open it', (tester) async {
    await tester.pumpWidget(_host(UiDatePicker(
      label: 'Delivery date',
      value: '',
      min: '2026-10-01',
      max: '2026-12-31',
    )));
    await tester.tap(find.byType(InkWell));
    await tester.pumpAndSettle();
    expect(find.byType(DatePickerDialog), findsOneWidget);
    await tester.tap(find.text('Cancel'));
    await tester.pumpAndSettle();

    await tester.pumpWidget(_host(const UiDatePicker(label: 'Delivery date', value: '', disabled: true)));
    await tester.tap(find.byType(InkWell));
    await tester.pumpAndSettle();
    expect(find.byType(DatePickerDialog), findsNothing);
  });

  testWidgets('FileUpload: renders files, remove and choose fire their events', (tester) async {
    var removed = '';
    var selected = false;
    await tester.pumpWidget(_host(UiFileUpload(
      label: 'Card photos',
      buttonLabel: 'Choose photos',
      files: const [UiFileUploadFile(name: 'front.jpg', sizeLabel: '1.2 MB')],
      onRemove: (name) => removed = name,
      onSelect: () => selected = true,
    )));
    expect(find.text('front.jpg'), findsOneWidget);
    expect(find.text('1.2 MB'), findsOneWidget);

    await tester.tap(find.byIcon(Icons.close));
    expect(removed, 'front.jpg');

    await tester.tap(find.text('Choose photos'));
    expect(selected, isTrue);
  });

  testWidgets('Rating: tapping a star selects it; readOnly never emits change', (tester) async {
    int? changed;
    await tester.pumpWidget(_host(UiRating(
      label: 'Your rating',
      value: 2,
      onChange: (v) => changed = v,
    )));
    await tester.tap(find.byType(IconButton).at(3)); // 4th star
    expect(changed, 4);

    await tester.pumpWidget(_host(const UiRating(label: 'Average rating', value: 4.5, readOnly: true)));
    expect(find.byType(IconButton), findsNothing);
    expect(find.byIcon(Icons.star_half), findsOneWidget);
    expect(find.byIcon(Icons.star), findsNWidgets(4));
  });

  testWidgets('Combobox: search fires onSearch, picking an option fires onChange', (tester) async {
    String? searched;
    String? changedValue;
    await tester.pumpWidget(_host(UiCombobox(
      label: 'Country',
      value: '',
      query: '',
      options: const [UiComboboxOption(value: 'VN', label: 'Vietnam')],
      onSearch: (v) => searched = v,
      onChange: (v) => changedValue = v,
    )));
    await tester.enterText(find.byType(TextField), 'vi');
    expect(searched, 'vi');

    await tester.pump();
    await tester.tap(find.text('Vietnam'));
    expect(changedValue, 'VN');
    expect(tester.widget<TextField>(find.byType(TextField)).controller!.text, 'Vietnam');
  });

  testWidgets('ChipGroup: multiple adds to selection, single toggles it off', (tester) async {
    List<String>? changed;
    const options = [
      UiChipGroupOption(value: 'holo', label: 'Holo'),
      UiChipGroupOption(value: 'rare', label: 'Rare'),
    ];
    await tester.pumpWidget(_host(UiChipGroup(
      label: 'Rarity',
      options: options,
      value: const ['holo'],
      onChange: (v) => changed = v,
    )));
    await tester.tap(find.text('Rare'));
    expect(changed, ['holo', 'rare']);

    changed = null;
    await tester.pumpWidget(_host(UiChipGroup(
      label: 'Rarity',
      options: options,
      value: const ['holo'],
      multiple: false,
      onChange: (v) => changed = v,
    )));
    await tester.tap(find.text('Holo'));
    expect(changed, <String>[]);
  });

  testWidgets('PinInput: typing the full code calls onChange and onComplete', (tester) async {
    String? changed;
    String? completed;
    await tester.pumpWidget(_host(UiPinInput(
      label: 'Verification code',
      value: '',
      length: 6,
      onChange: (v) => changed = v,
      onComplete: (v) => completed = v,
    )));
    await tester.enterText(find.byType(TextField), '123456');
    await tester.pump();
    expect(changed, '123456');
    expect(completed, '123456');
    expect(find.text('1'), findsOneWidget);
    expect(find.text('6'), findsOneWidget);
  });

  testWidgets('FormField: shows label, required marker, error and children', (tester) async {
    await tester.pumpWidget(_host(const UiFormField(
      label: 'Shipping address',
      required: true,
      error: 'Street is required',
      children: [Text('Street'), Text('City')],
    )));
    expect(find.textContaining('Shipping address'), findsOneWidget);
    expect(find.text('Street is required'), findsOneWidget);
    expect(find.text('Street'), findsOneWidget);
    expect(find.text('City'), findsOneWidget);
  });

  testWidgets('Input: password has a show / hide toggle that reveals the text', (tester) async {
    await tester.pumpWidget(_host(const UiInput(label: 'Password', value: 'secret', type: UiInputType.password, revealLabel: 'Show password')));
    bool obscured() => tester.widget<EditableText>(find.byType(EditableText)).obscureText;
    expect(obscured(), isTrue);
    expect(find.byTooltip('Show password'), findsOneWidget);
    await tester.tap(find.byTooltip('Show password'));
    await tester.pump();
    expect(obscured(), isFalse);
    await tester.pumpWidget(_host(const UiInput(label: 'Email', value: '', type: UiInputType.email)));
    expect(find.byTooltip('Email'), findsNothing, reason: 'only password fields get the toggle');
  });
}
