// App shell (hand-written): the one place that uses Material directly. Screens compose from lib/ui only.
import 'package:flutter/material.dart';
import 'package:gallery_flutter/ui/theme.g.dart';
import 'package:gallery_flutter/screens/home_screen.dart';

void main() => runApp(const GalleryApp());

class GalleryApp extends StatefulWidget {
  const GalleryApp({super.key});

  @override
  State<GalleryApp> createState() => _GalleryAppState();
}

class _GalleryAppState extends State<GalleryApp> {
  // light / dark / system: the themes are generated from ui-spec/project.ts tokens (lib/ui/theme.g.dart)
  ThemeMode _mode = ThemeMode.system;

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'Component gallery',
      theme: uiTheme(),
      darkTheme: uiTheme(colorScheme: UiColorScheme.dark),
      themeMode: _mode,
      home: Scaffold(
        appBar: AppBar(
          // only the mode switch: the Home screen carries the title
          actions: [
            SegmentedButton<ThemeMode>(
              segments: const [
                ButtonSegment(value: ThemeMode.light, icon: Icon(Icons.light_mode), tooltip: 'Light'),
                ButtonSegment(value: ThemeMode.system, icon: Icon(Icons.brightness_auto), tooltip: 'System'),
                ButtonSegment(value: ThemeMode.dark, icon: Icon(Icons.dark_mode), tooltip: 'Dark'),
              ],
              selected: {_mode},
              showSelectedIcon: false,
              onSelectionChanged: (s) => setState(() => _mode = s.first),
            ),
            const SizedBox(width: 12),
          ],
        ),
        body: const SafeArea(child: SingleChildScrollView(child: HomeScreen())),
      ),
    );
  }
}
