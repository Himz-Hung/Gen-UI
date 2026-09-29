import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:gallery_flutter/ui/ui.dart';

Widget _host(Widget child) => MaterialApp(home: Scaffold(body: SingleChildScrollView(child: child)));

Future<void> _size(WidgetTester tester, double width) async {
  tester.view.physicalSize = Size(width, 1200);
  tester.view.devicePixelRatio = 1;
  addTearDown(tester.view.reset);
}

void main() {
  group('DateRangePicker', () {
    const picker = UiDateRangePicker(label: 'Stay', start: '2026-10-12', end: '2026-10-15', summary: '3 nights', disabledDates: ['2026-10-20'], minNights: 2, maxNights: 7);

    test('ranges may not cross disabled dates or break min / max nights', () {
      DateTime d(int day) => DateTime(2026, 10, day);
      expect(picker.isAllowed(d(12), d(15)), isTrue);
      expect(picker.isAllowed(d(18), d(22)), isFalse, reason: 'crosses the 20th');
      expect(picker.isAllowed(d(12), d(13)), isFalse, reason: 'shorter than minNights');
      expect(picker.isAllowed(d(1), d(10)), isFalse, reason: 'longer than maxNights');
      expect(picker.isAllowed(d(12), d(12)), isFalse, reason: 'zero nights');
    });

    testWidgets('shows the label, the formatted range and the summary', (tester) async {
      await tester.pumpWidget(_host(picker));
      expect(find.text('Stay'), findsOneWidget);
      expect(find.text('3 nights'), findsOneWidget);
      expect(find.textContaining('Oct 12'), findsOneWidget);
      expect(find.textContaining('Oct 15'), findsOneWidget);
    });
  });

  group('AvailabilityCalendar', () {
    testWidgets('available days emit dayPress, booked never do, months change, legend shows', (tester) async {
      String? pressed, month;
      await tester.pumpWidget(_host(UiAvailabilityCalendar(
        month: '2026-10',
        days: const [
          UiAvailabilityCalendarDay(date: '2026-10-12', status: UiAvailabilityCalendarStatus.available, priceLabel: r'$120'),
          UiAvailabilityCalendarDay(date: '2026-10-13', status: UiAvailabilityCalendarStatus.booked),
        ],
        legend: const UiAvailabilityCalendarLegend(available: 'Available', limited: 'Few left', booked: 'Booked', closed: 'Closed'),
        max: '2026-11',
        onDayPress: (d) => pressed = d,
        onMonthChange: (m) => month = m,
      )));
      expect(find.text(r'$120'), findsOneWidget);
      await tester.tap(find.text('12'));
      expect(pressed, '2026-10-12');
      pressed = null;
      await tester.tap(find.text('13'), warnIfMissed: false);
      expect(pressed, isNull, reason: 'booked day');
      await tester.tap(find.byIcon(Icons.chevron_right));
      expect(month, '2026-11');
      expect(find.text('Few left'), findsOneWidget);
      // October 2026 starts on a Thursday: with weekStart monday, the 1st is the 4th cell of the first row.
      expect(tester.getTopLeft(find.text('1')).dx, greaterThan(tester.getTopLeft(find.text('5')).dx));
    });
  });

  group('SiteHeader', () {
    const links = [UiSiteHeaderLink(value: 'rooms', label: 'Rooms', active: true), UiSiteHeaderLink(value: 'offers', label: 'Offers')];
    const actions = [UiSiteHeaderAction(value: 'book', label: 'Book now', variant: UiSiteHeaderVariant.primary)];

    testWidgets('wide: links and actions on one row', (tester) async {
      await _size(tester, 1200);
      String? nav, action;
      await tester.pumpWidget(_host(UiSiteHeader(brand: 'Seaside Stays', menuLabel: 'Menu', links: links, actions: actions, onNavigate: (v) => nav = v, onAction: (v) => action = v)));
      expect(find.byTooltip('Menu'), findsNothing);
      await tester.tap(find.text('Offers'));
      expect(nav, 'offers');
      await tester.tap(find.text('Book now'));
      expect(action, 'book');
    });

    testWidgets('narrow: a menu button opens a drawer; choosing a link closes it', (tester) async {
      await _size(tester, 390);
      String? nav;
      await tester.pumpWidget(_host(UiSiteHeader(brand: 'Seaside Stays', menuLabel: 'Menu', links: links, actions: actions, onNavigate: (v) => nav = v)));
      expect(find.text('Offers'), findsNothing);
      await tester.tap(find.byTooltip('Menu'));
      await tester.pumpAndSettle();
      expect(find.text('Offers'), findsOneWidget);
      await tester.tap(find.text('Offers'));
      await tester.pumpAndSettle();
      expect(nav, 'offers');
      expect(find.text('Offers'), findsNothing);
    });
  });

  group('SiteFooter', () {
    const columns = [
      UiSiteFooterColumn(title: 'Company', links: [UiSiteFooterLink(value: 'about', label: 'About')]),
      UiSiteFooterColumn(title: 'Help', links: [UiSiteFooterLink(value: 'faq', label: 'FAQ')]),
      UiSiteFooterColumn(title: 'Legal', links: [UiSiteFooterLink(value: 'terms', label: 'Terms')]),
    ];

    testWidgets('wide: columns side by side and links navigate', (tester) async {
      await _size(tester, 1200);
      String? nav;
      await tester.pumpWidget(_host(UiSiteFooter(brand: 'Seaside Stays', columns: columns, legal: '© 2026 Seaside Stays', onNavigate: (v) => nav = v)));
      expect(tester.getTopLeft(find.text('Company')).dy, tester.getTopLeft(find.text('Help')).dy);
      await tester.tap(find.text('FAQ'));
      expect(nav, 'faq');
      expect(find.text('© 2026 Seaside Stays'), findsOneWidget);
    });

    testWidgets('narrow with more than two columns: columns collapse under their titles', (tester) async {
      await _size(tester, 390);
      await tester.pumpWidget(_host(const UiSiteFooter(columns: columns)));
      expect(find.text('FAQ'), findsNothing);
      await tester.tap(find.text('Help'));
      await tester.pumpAndSettle();
      expect(find.text('FAQ'), findsOneWidget);
    });
  });
}
