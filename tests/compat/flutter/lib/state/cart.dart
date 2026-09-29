import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:get/get.dart';
import 'package:hooks_riverpod/hooks_riverpod.dart';

class CartCubit extends Cubit<int> {
  CartCubit() : super(0);
  void clear() => emit(0);
}

class CartController extends GetxController {
  final count = 0.obs;
}

class CartRepo {
  void clear() {}
}

final countProvider = StateProvider<int>((ref) => 0);
