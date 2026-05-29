import 'package:flutter/material.dart';
import 'package:fl_chart/fl_chart.dart';
import 'dart:math';
import 'package:blockcode/services/auth_service.dart';
import 'package:blockcode/services/usuario_service.dart';
import 'package:blockcode/services/usuario_proyecto_service.dart';

class DashboardPage extends StatefulWidget {
  const DashboardPage({Key? key}) : super(key: key);

  @override
  State<DashboardPage> createState() => _DashboardPageState();
}

class _DashboardPageState extends State<DashboardPage> {
  bool _isLoading = true;
  int _totalUsuarios = 0;
  List<MapEntry<String, int>> _proyectosPorEmpleado = [];

  @override
  void initState() {
    super.initState();
    _cargarDatosReales();
  }

  Future<void> _cargarDatosReales() async {
    try {
      final usuarioService = UsuarioService();
      final asignacionService = UsuarioProyectoService();

      final List<dynamic> usuarios = await usuarioService.getUsuarios();
      final List<dynamic> asignaciones = await asignacionService.getAssignments();

      final totalUsuarios = usuarios.length;

      Map<String, int> conteoProyectos = {};
      
      for (var asignacion in asignaciones) {
        String nombreCompleto = asignacion['usuario']?.toString() ?? 
                                asignacion['nombre_usuario']?.toString() ?? 
                                'Usuario ${asignacion['id_usuario'] ?? 'Desconocido'}';
        
        String primerNombre = nombreCompleto.split(' ').first;
        
        conteoProyectos[primerNombre] = (conteoProyectos[primerNombre] ?? 0) + 1;
      }

      if (mounted) {
        setState(() {
          _totalUsuarios = totalUsuarios;
          _proyectosPorEmpleado = conteoProyectos.entries.toList();
          _isLoading = false;
        });
      }
    } catch (e) {
      debugPrint('Error cargando el dashboard: $e');
      if (mounted) {
        setState(() => _isLoading = false);
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    double maxGrafica = 5; 
    if (_proyectosPorEmpleado.isNotEmpty) {
      final maxProyectos = _proyectosPorEmpleado.map((e) => e.value).reduce(max);
      maxGrafica = maxProyectos + 2.0; 
    }

    return Scaffold(
      appBar: AppBar(
        title: const Text('Dashboard'),
        actions: [
          IconButton(
            icon: const Icon(Icons.logout),
            tooltip: 'Cerrar sesión',
            onPressed: () async {
              await AuthService().logout();
              if (context.mounted) {
                Navigator.of(context).pushNamedAndRemoveUntil('/', (route) => false);
              }
            },
          ),
        ],
      ),
      body: _isLoading
          ? const Center(child: CircularProgressIndicator())
          : Padding(
              padding: const EdgeInsets.all(16.0),
              child: SingleChildScrollView(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    const Text(
                      'Bienvenido al Dashboard',
                      style: TextStyle(fontSize: 24, fontWeight: FontWeight.bold),
                    ),
                    const SizedBox(height: 20),
                    
                    Card(
                      elevation: 4,
                      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                      child: ListTile(
                        leading: const CircleAvatar(
                          backgroundColor: Color(0xFF122646),
                          child: Icon(Icons.people, color: Colors.white),
                        ),
                        title: const Text('Usuarios registrados', style: TextStyle(fontWeight: FontWeight.w600)),
                        trailing: Text(
                          '$_totalUsuarios',
                          style: const TextStyle(fontSize: 24, fontWeight: FontWeight.bold, color: Color(0xFF23633C)),
                        ),
                      ),
                    ),
                    const SizedBox(height: 32),
                    
                    const Text(
                      'Proyectos asignados por empleado',
                      style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold),
                    ),
                    const SizedBox(height: 24),
                    
                    if (_proyectosPorEmpleado.isEmpty)
                      const Center(
                        child: Padding(
                          padding: EdgeInsets.all(20.0),
                          child: Text('No hay asignaciones registradas todavía.'),
                        ),
                      )
                    else
                      SizedBox(
                        height: 250, 
                        child: BarChart(
                          BarChartData(
                            alignment: BarChartAlignment.spaceAround,
                            maxY: maxGrafica,
                            barTouchData: BarTouchData(
                              enabled: true,
                              touchTooltipData: BarTouchTooltipData(
                                getTooltipItem: (group, groupIndex, rod, rodIndex) {
                                  return BarTooltipItem(
                                    '${_proyectosPorEmpleado[groupIndex].key}\n',
                                    const TextStyle(color: Colors.white, fontWeight: FontWeight.bold),
                                    children: [
                                      TextSpan(text: '${rod.toY.toInt()} proyectos'),
                                    ],
                                  );
                                },
                              ),
                            ),
                            titlesData: FlTitlesData(
                              leftTitles: AxisTitles(
                                sideTitles: SideTitles(
                                  showTitles: true,
                                  reservedSize: 30,
                                  getTitlesWidget: (value, meta) {
                                    if (value % 1 == 0) {
                                      return Text(value.toInt().toString(), style: const TextStyle(fontSize: 12));
                                    }
                                    return const SizedBox.shrink();
                                  },
                                ),
                              ),
                              bottomTitles: AxisTitles(
                                sideTitles: SideTitles(
                                  showTitles: true,
                                  reservedSize: 40,
                                  getTitlesWidget: (double value, TitleMeta meta) {
                                    int index = value.toInt();
                                    if (index >= 0 && index < _proyectosPorEmpleado.length) {
                                      String nombre = _proyectosPorEmpleado[index].key;
                                      String label = nombre.length > 7 ? '${nombre.substring(0, 6)}.' : nombre;
                                      return Padding(
                                        padding: const EdgeInsets.only(top: 8.0),
                                        child: Text(label, style: const TextStyle(fontSize: 11, fontWeight: FontWeight.w600)),
                                      );
                                    }
                                    return const SizedBox.shrink();
                                  },
                                ),
                              ),
                              rightTitles: const AxisTitles(sideTitles: SideTitles(showTitles: false)),
                              topTitles: const AxisTitles(sideTitles: SideTitles(showTitles: false)),
                            ),
                            borderData: FlBorderData(show: false),
                            
                            barGroups: List.generate(_proyectosPorEmpleado.length, (index) {
                              return BarChartGroupData(
                                x: index,
                                barRods: [
                                  BarChartRodData(
                                    toY: _proyectosPorEmpleado[index].value.toDouble(),
                                    color: const Color(0xFF122646), 
                                    width: 18,
                                    borderRadius: const BorderRadius.vertical(top: Radius.circular(6)),
                                  ),
                                ],
                              );
                            }),
                          ),
                        ),
                      ),
                      
                    const SizedBox(height: 24),
                  ],
                ),
              ),
            ),
    );
  }
}