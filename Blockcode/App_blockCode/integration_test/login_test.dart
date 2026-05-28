import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:integration_test/integration_test.dart';
import 'package:blockcode/main.dart' as app; 

void main() {
  IntegrationTestWidgetsFlutterBinding.ensureInitialized();

  group('Prueba Automatizada Android - Flujo de Iniciar Sesión', () {
    
    // --- ESCENARIO 1: CREDENCIALES INVÁLIDAS ---
    testWidgets('Escenario 1: Datos invalidos muestran mensaje de error', (WidgetTester tester) async {
      // 1. Abrir la aplicación
      app.main();
      await tester.pumpAndSettle();

      // 2. Llenar los campos con datos falsos (Aserción de que existen los campos)
      expect(find.byType(TextFormField), findsNWidgets(2));
      
      await tester.enterText(find.byType(TextFormField).first, 'usuario@falso.com');
      await tester.enterText(find.byType(TextFormField).last, 'clave_incorrecta');

      //Tocar el botón ENTRAR
      await tester.tap(find.text('ENTRAR'));
      
      // Esperar a que el backend responda y aparezca el Snackbar
      await tester.pumpAndSettle();

      //Aserción: Validar que el sistema muestre el mensaje de error
      // (Buscamos el texto que LoginScreen arroja cuando falla)
      expect(find.text('Usuario no encontrado'), findsOneWidget);
    });

    // --- ESCENARIO 2: CREDENCIALES VÁLIDAS ---
    testWidgets('Escenario 2: Datos validos permiten el acceso al sistema', (WidgetTester tester) async {
      // Abrir la aplicación desde cero otra vez
      app.main();
      await tester.pumpAndSettle();

      // Llenar los campos con los datos de Admin local
      await tester.enterText(find.byType(TextFormField).first, 'admin@admin.com');
      await tester.enterText(find.byType(TextFormField).last, '1234@abc');

      // Tocar el botón ENTRAR
      await tester.tap(find.text('ENTRAR'));
      
      // Esperar la animación de carga y el cambio de pantalla
      await tester.pumpAndSettle();

      // Aserción: Validar que cambiamos de pantalla buscando el texto del AppBar
      expect(find.text('Panel Principal'), findsOneWidget);
    });

  });
}