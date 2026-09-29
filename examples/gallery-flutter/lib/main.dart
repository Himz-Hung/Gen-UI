// App shell (hand-written): the one place that uses Material directly. Screens compose from lib/ui only.
import 'package:flutter/material.dart';
import 'package:gallery_flutter/ui/theme.g.dart';
import 'package:gallery_flutter/screens/home_screen.dart';

void main() => runApp(const GalleryApp());

class GalleryApp extends StatelessWidget {
  const GalleryApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'Component gallery',
      theme: uiTheme(), // generated from ui-spec/project.ts tokens (lib/ui/theme.g.dart)
      home: const Scaffold(body: SafeArea(child: SingleChildScrollView(child: HomeScreen()))),
    );
  }
}
