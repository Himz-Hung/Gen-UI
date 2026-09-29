import 'package:flutter/gestures.dart';
import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';

import 'package:gallery_flutter/ui/ui.dart';

Widget _host(Widget child) => MaterialApp(home: Scaffold(body: SingleChildScrollView(child: child)));

void main() {
  testWidgets('EmptyState shows title/description and emits action', (tester) async {
    var pressed = false;
    await tester.pumpWidget(_host(UiEmptyState(
      title: 'No cards yet',
      description: 'Add your first card to get started',
      actionLabel: 'Add card',
      onAction: () => pressed = true,
    )));

    expect(find.text('No cards yet'), findsOneWidget);
    expect(find.text('Add your first card to get started'), findsOneWidget);

    await tester.tap(find.text('Add card'));
    await tester.pump();
    expect(pressed, isTrue);
  });

  testWidgets('Skeleton renders the requested number of text lines without settling animation', (tester) async {
    await tester.pumpWidget(_host(const Padding(
      padding: EdgeInsets.all(16),
      child: UiSkeleton(shape: UiSkeletonShape.text, lines: 3),
    )));
    // Shimmer repeats forever: pump a frame, never pumpAndSettle.
    await tester.pump(const Duration(milliseconds: 50));

    expect(find.byType(UiSkeleton), findsOneWidget);
    expect(
      find.descendant(of: find.byType(UiSkeleton), matching: find.byType(Container)),
      findsNWidgets(3),
    );
  });

  testWidgets('Alert shows tone content and emits dismiss', (tester) async {
    var dismissed = false;
    await tester.pumpWidget(_host(UiAlert(
      tone: UiAlertTone.danger,
      title: 'Payment failed',
      description: 'Please check your card details',
      dismissible: true,
      onDismiss: () => dismissed = true,
    )));

    expect(find.text('Payment failed'), findsOneWidget);
    expect(find.text('Please check your card details'), findsOneWidget);

    await tester.tap(find.byTooltip('Dismiss'));
    await tester.pump();
    expect(dismissed, isTrue);
  });

  testWidgets('Toast shows the message and auto-closes after duration', (tester) async {
    var closed = false;
    await tester.pumpWidget(_host(UiToast(
      open: true,
      message: 'Added to cart',
      tone: UiToastTone.success,
      duration: 300,
      onClose: () => closed = true,
    )));

    expect(find.text('Added to cart'), findsOneWidget);
    expect(closed, isFalse);

    await tester.pump(const Duration(milliseconds: 300));
    expect(closed, isTrue);
  });

  testWidgets('Spinner shows its accessible label when showLabel is true', (tester) async {
    await tester.pumpWidget(_host(const UiSpinner(label: 'Loading cards', showLabel: true)));
    await tester.pump(const Duration(milliseconds: 50));

    expect(find.text('Loading cards'), findsOneWidget);
    expect(find.byType(CircularProgressIndicator), findsOneWidget);
  });

  testWidgets('ProgressBar shows the pre-formatted valueLabel instead of a percentage', (tester) async {
    await tester.pumpWidget(_host(const UiProgressBar(
      label: 'Uploading photos',
      value: 60,
      valueLabel: '3 of 5 files',
    )));

    expect(find.text('Uploading photos'), findsOneWidget);
    expect(find.text('3 of 5 files'), findsOneWidget);
    expect(find.text('60%'), findsNothing);

    final bar = tester.widget<LinearProgressIndicator>(find.byType(LinearProgressIndicator));
    expect(bar.value, closeTo(0.6, 0.001));
  });

  testWidgets('Tooltip carries its text and wraps exactly one trigger child', (tester) async {
    await tester.pumpWidget(_host(UiTooltip(
      text: 'Share this card',
      children: [IconButton(icon: const Icon(Icons.share), onPressed: () {})],
    )));

    final tooltip = tester.widget<Tooltip>(find.byType(Tooltip));
    expect(tooltip.message, 'Share this card');
    expect(find.byIcon(Icons.share), findsOneWidget);
  });

  testWidgets('Pagination disables Previous on page 1 and emits the tapped page', (tester) async {
    int? changed;
    await tester.pumpWidget(_host(UiPagination(
      page: 1,
      pageCount: 10,
      onChange: (v) => changed = v,
    )));

    final prev = tester.widget<IconButton>(find.widgetWithIcon(IconButton, Icons.chevron_left));
    expect(prev.onPressed, isNull);

    await tester.tap(find.text('3'));
    await tester.pump();
    expect(changed, 3);
  });

  testWidgets('Tabs shows the active tab content and emits the tapped tab value', (tester) async {
    String? changed;
    await tester.pumpWidget(_host(UiTabs(
      tabs: const [UiTabsTab(value: 'grid', label: 'Grid'), UiTabsTab(value: 'list', label: 'List')],
      value: 'grid',
      onChange: (v) => changed = v,
      children: const [Text('Grid content')],
    )));

    expect(find.text('Grid content'), findsOneWidget);

    await tester.tap(find.text('List'));
    await tester.pump();
    expect(changed, 'list');
  });

  testWidgets('TopBar shows the title and emits back / actionPress', (tester) async {
    var backPressed = false;
    String? action;
    await tester.pumpWidget(_host(UiTopBar(
      title: 'Base Set',
      showBack: true,
      actions: const [UiTopBarAction(icon: 'share', label: 'Share', action: 'share')],
      onBack: () => backPressed = true,
      onActionPress: (a) => action = a,
    )));

    expect(find.text('Base Set'), findsOneWidget);

    await tester.tap(find.byTooltip('Back'));
    await tester.pump();
    expect(backPressed, isTrue);

    await tester.tap(find.byTooltip('Share'));
    await tester.pump();
    expect(action, 'share');
  });

  testWidgets('BottomNav shows items and emits change for the tapped destination', (tester) async {
    String? changed;
    await tester.pumpWidget(MaterialApp(
      home: Scaffold(
        body: const SizedBox.shrink(),
        bottomNavigationBar: UiBottomNav(
          value: 'home',
          items: const [
            UiBottomNavItem(value: 'home', label: 'Home', icon: 'home'),
            UiBottomNavItem(value: 'cart', label: 'Cart', icon: 'cart', badge: '3'),
            UiBottomNavItem(value: 'me', label: 'Account', icon: 'user'),
          ],
          onChange: (v) => changed = v,
        ),
      ),
    ));

    expect(find.text('Home'), findsOneWidget);
    expect(find.text('Cart'), findsOneWidget);

    await tester.tap(find.text('Cart'));
    await tester.pump();
    expect(changed, 'cart');
  });

  testWidgets('SegmentedControl shows options and emits the tapped option', (tester) async {
    String? changed;
    await tester.pumpWidget(_host(UiSegmentedControl(
      label: 'View',
      value: 'grid',
      options: const [
        UiSegmentedControlOption(value: 'grid', label: 'Grid'),
        UiSegmentedControlOption(value: 'list', label: 'List'),
      ],
      onChange: (v) => changed = v,
    )));

    expect(find.text('Grid'), findsOneWidget);
    expect(find.text('List'), findsOneWidget);

    await tester.tap(find.text('List'));
    await tester.pump();
    expect(changed, 'list');
  });

  testWidgets('Sidebar groups items by section and emits change / toggle', (tester) async {
    String? changed;
    var toggled = false;
    await tester.pumpWidget(_host(UiSidebar(
      title: 'Admin',
      value: 'orders',
      items: const [
        UiSidebarItem(value: 'orders', label: 'Orders', icon: 'box', badge: '12'),
        UiSidebarItem(value: 'cards', label: 'Cards', icon: 'grid', section: 'Catalog'),
      ],
      onChange: (v) => changed = v,
      onToggle: () => toggled = true,
    )));

    expect(find.text('Admin'), findsOneWidget);
    expect(find.text('Catalog'), findsOneWidget);
    expect(find.text('Orders'), findsOneWidget);

    await tester.tap(find.text('Cards'));
    await tester.pump();
    expect(changed, 'cards');

    await tester.tap(find.byTooltip('Collapse'));
    await tester.pump();
    expect(toggled, isTrue);
  });

  testWidgets('Breadcrumbs marks the last item as plain text and emits press for ancestors', (tester) async {
    String? pressed;
    await tester.pumpWidget(_host(UiBreadcrumbs(
      items: const [
        UiBreadcrumbsItem(value: 'home', label: 'Home'),
        UiBreadcrumbsItem(value: 'sets', label: 'Sets'),
        UiBreadcrumbsItem(value: 'base', label: 'Base Set'),
      ],
      onPress: (v) => pressed = v,
    )));

    expect(find.text('Base Set'), findsOneWidget);
    expect(find.widgetWithText(TextButton, 'Base Set'), findsNothing);

    await tester.tap(find.text('Home'));
    await tester.pump();
    expect(pressed, 'home');
  });

  testWidgets('Stepper marks completed steps pressable and emits press with the step index', (tester) async {
    int? pressed;
    await tester.pumpWidget(_host(UiStepper(
      current: 1,
      allowBack: true,
      steps: const [
        UiStepperStep(label: 'Cart'),
        UiStepperStep(label: 'Shipping'),
        UiStepperStep(label: 'Payment'),
      ],
      onPress: (v) => pressed = v,
    )));

    expect(find.text('Cart'), findsOneWidget);
    expect(find.text('Shipping'), findsOneWidget);
    expect(find.text('Payment'), findsOneWidget);
    expect(find.byIcon(Icons.check), findsOneWidget);

    // The completed step's marker (its check icon) is the pressable target — the label text beside it is not.
    await tester.tap(find.byIcon(Icons.check));
    await tester.pump();
    expect(pressed, 0);
  });

  testWidgets('Toast: the close timer pauses while hovered', (tester) async {
    var closed = 0;
    await tester.pumpWidget(MaterialApp(home: Scaffold(body: UiToast(open: true, message: 'Added to cart', duration: 1000, onClose: () => closed++))));
    final mouse = await tester.createGesture(kind: PointerDeviceKind.mouse);
    await mouse.addPointer(location: Offset.zero);
    addTearDown(mouse.removePointer);
    await mouse.moveTo(tester.getCenter(find.text('Added to cart')));
    await tester.pump(const Duration(milliseconds: 1500));
    expect(closed, 0, reason: 'paused while hovered');
    await mouse.moveTo(Offset.zero);
    await tester.pump(const Duration(milliseconds: 1100));
    expect(closed, 1);
  });
}
