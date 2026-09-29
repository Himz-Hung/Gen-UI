// App shell (hand-written): the one place that uses Material directly. Screens compose from lib/ui only.
import 'package:flutter/material.dart';
import 'package:gallery_flutter/screens/home_screen.dart';
import 'package:gallery_flutter/ui/ui.dart';

void main() => runApp(const GalleryApp());

class GalleryApp extends StatelessWidget {
  const GalleryApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'Component gallery',
      theme: ThemeData(colorSchemeSeed: UiTokens.colorPrimary, useMaterial3: true),
      home: const Scaffold(body: SafeArea(child: SingleChildScrollView(child: HomeScreen()))),
    );
  }
}
