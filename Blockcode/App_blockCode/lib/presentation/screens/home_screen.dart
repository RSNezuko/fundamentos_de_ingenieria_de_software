import 'package:flutter/material.dart';
import 'package:blockcode/features/auth/screens/login_screen.dart';
import 'package:blockcode/services/auth_service.dart';

import 'admin_panel_screen.dart';
import 'proyectos_screen.dart';
import 'usuarios_screen.dart';
import 'inventario_screen.dart';
import 'proveedores_screen.dart';

class HomeScreen extends StatefulWidget {
  const HomeScreen({super.key});

  @override
  State<HomeScreen> createState() => _HomeScreenState();
}

class _HomeScreenState extends State<HomeScreen> {
  final AuthService _authService = AuthService();

  bool _isAdmin(Map<String, dynamic>? user) {
    final rol = user?['rol']?.toString().toLowerCase() ?? '';
    final idRol = int.tryParse(user?['id_rol']?.toString() ?? '');
    return rol.contains('admin') || idRol == 1;
  }

  void _logout(BuildContext context) async {
    await _authService.logout();
    if (!context.mounted) return;
    Navigator.of(context).pushReplacement(
      MaterialPageRoute<void>(
        builder: (context) => const LoginScreen(),
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    return FutureBuilder<Map<String, dynamic>?>(
      future: _authService.getUser(),
      builder: (context, snapshot) {
        if (snapshot.connectionState == ConnectionState.waiting) {
          return const Scaffold(
            body: Center(child: CircularProgressIndicator()),
          );
        }

        final user = snapshot.data;
        final isAdmin = _isAdmin(user);

        return Scaffold(
          appBar: AppBar(
            title: const Text('Panel Principal'),
          ),
          body: Center(
            child: Padding(
              padding: const EdgeInsets.all(24.0),
              child: SingleChildScrollView(
                child: Column(
                  mainAxisAlignment: MainAxisAlignment.center,
                  crossAxisAlignment: CrossAxisAlignment.stretch,
                  children: [
                  const Text(
                    '¿Qué deseas gestionar?',
                    style: TextStyle(fontSize: 24, fontWeight: FontWeight.bold),
                    textAlign: TextAlign.center,
                  ),
                  const SizedBox(height: 48),
                  
                  // PROYECTOS (Visible para todos: Admins, Operadores, Trabajadores)
                  ElevatedButton.icon(
                    icon: const Icon(Icons.apartment),
                    label: const Text('PROYECTOS', style: TextStyle(fontSize: 16)),
                    style: ElevatedButton.styleFrom(padding: const EdgeInsets.symmetric(vertical: 16)),
                    onPressed: () {
                      Navigator.push(
                        context,
                        MaterialPageRoute(builder: (context) => const ProyectosScreen()),
                      );
                    },
                  ),
                  const SizedBox(height: 24),
                  
                  // TODOS LOS DEMÁS BOTONES (Solo visibles para Admin)
                  if (isAdmin) ...[
                    ElevatedButton.icon(
                      icon: const Icon(Icons.admin_panel_settings),
                      label: const Text('PANEL ADMIN', style: TextStyle(fontSize: 16)),
                      style: ElevatedButton.styleFrom(padding: const EdgeInsets.symmetric(vertical: 16)),
                      onPressed: () {
                        Navigator.push(
                          context,
                          MaterialPageRoute(builder: (context) => const AdminPanelScreen()),
                        );
                      },
                    ),
                    const SizedBox(height: 24),
                    
                    ElevatedButton.icon(
                      icon: const Icon(Icons.people),
                      label: const Text('USUARIOS', style: TextStyle(fontSize: 16)),
                      style: ElevatedButton.styleFrom(padding: const EdgeInsets.symmetric(vertical: 16)),
                      onPressed: () {
                        Navigator.push(
                          context,
                          MaterialPageRoute(builder: (context) => const UsuariosScreen()),
                        );
                      },
                    ),
                    const SizedBox(height: 24),
                    
                    // INVENTARIO ahora está dentro del bloque del Admin
                    ElevatedButton.icon(
                      icon: const Icon(Icons.inventory_2),
                      label: const Text('INVENTARIO', style: TextStyle(fontSize: 16)),
                      style: ElevatedButton.styleFrom(padding: const EdgeInsets.symmetric(vertical: 16)),
                      onPressed: () {
                        Navigator.push(
                          context,
                          MaterialPageRoute(builder: (context) => const InventarioScreen()),
                        );
                      },
                    ),
                    const SizedBox(height: 24),
                    
                    ElevatedButton.icon(
                      icon: const Icon(Icons.local_shipping),
                      label: const Text('PROVEEDORES', style: TextStyle(fontSize: 16)),
                      style: ElevatedButton.styleFrom(padding: const EdgeInsets.symmetric(vertical: 16)),
                      onPressed: () {
                        Navigator.push(
                          context,
                          MaterialPageRoute(builder: (context) => const ProveedoresScreen()),
                        );
                      },
                    ),
                  ],
                ],
                ), // Column
              ), // SingleChildScrollView
            ),
          ),
        );
      },
    );
  }
}