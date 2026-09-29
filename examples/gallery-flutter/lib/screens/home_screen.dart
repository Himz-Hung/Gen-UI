import 'package:flutter/widgets.dart' show StatefulWidget, State, Widget, BuildContext;
import 'package:gallery_flutter/ui/ui.dart';

/// Composed from lib/ui only (fw check lib/screens enforces it). Layout follows screens/home.ui.json.
class HomeScreen extends StatefulWidget {
  const HomeScreen({super.key});
  @override
  State<HomeScreen> createState() => _HomeScreenState();
}

class _HomeScreenState extends State<HomeScreen> {
  String name = '';
  bool notify = true;
  String tab = 'a';
  int presses = 0;

  void press() => setState(() => presses++);

  @override
  Widget build(BuildContext context) {
    return UiContainer(maxWidth: UiContainerMaxWidth.md, children: [
      const UiTopBar(title: 'Component gallery'),
      UiStack(gap: UiStackGap.v5, children: [
        const UiSectionHeader(title: 'Actions'),
        UiInline(gap: UiInlineGap.v3, wrap: true, children: [
          UiButton(label: 'Primary', onPress: press),
          UiButton(label: 'Delete', variant: UiButtonVariant.danger, onPress: press),
          UiText(value: 'Pressed $presses times'),
        ]),
        const UiSectionHeader(title: 'Inputs'),
        UiInput(label: 'Name', value: name, hint: 'Your full name', onChange: (v) => setState(() => name = v)),
        UiSwitch(label: 'Email me updates', checked: notify, onChange: (v) => setState(() => notify = v)),
        const UiSectionHeader(title: 'Data'),
        const UiInline(gap: UiInlineGap.v3, children: [
          UiAvatar(name: 'Ash Ketchum'),
          UiBadge(label: 'New', tone: UiBadgeTone.primary),
          UiStat(label: 'Orders', value: '128'),
        ]),
        const UiSectionHeader(title: 'Feedback'),
        const UiAlert(tone: UiAlertTone.success, title: 'Saved', description: 'Your changes are live.'),
        const UiSectionHeader(title: 'Navigation'),
        UiTabs(
          tabs: const [UiTabsTab(value: 'a', label: 'Overview'), UiTabsTab(value: 'b', label: 'Details')],
          value: tab,
          onChange: (v) => setState(() => tab = v),
          children: [UiText(value: tab == 'a' ? 'Overview content' : 'Details content')],
        ),
      ]),
    ]);
  }
}
