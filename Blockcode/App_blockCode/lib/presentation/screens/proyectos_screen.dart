import 'package:flutter/material.dart';
import 'package:blockcode/services/proyecto_service.dart';
import 'package:blockcode/services/usuario_proyecto_service.dart';
import 'package:blockcode/services/auth_service.dart';
import 'package:blockcode/services/report_service.dart';
import 'package:blockcode/presentation/screens/transacciones_screen.dart';

class ProyectosScreen extends StatefulWidget {
  const ProyectosScreen({super.key});

  @override
  State<ProyectosScreen> createState() => _ProyectosScreenState();
}

class _ProyectosScreenState extends State<ProyectosScreen> {
  final ProyectoService _service = ProyectoService();
  final UsuarioProyectoService _assignmentService = UsuarioProyectoService();
  final AuthService _authService = AuthService();
  final ReportService _reportService = ReportService();
  List<dynamic> _assignments = [];
  Map<String, dynamic>? _currentUser;
  Set<String> _userProjectIds = {};

  bool _isAdmin(Map<String, dynamic>? user) {
    final rol = user?['rol']?.toString().toLowerCase() ?? '';
    final idRol = int.tryParse(user?['id_rol']?.toString() ?? '');
    return rol.contains('admin') || idRol == 1;
  }

  Future<List<dynamic>> _loadProjectsForUser() async {
    // Load all projects and current user and assignments, then filter if needed.
    final projects = await _service.getProyectos();
    final user = await _authService.getUser();

  // Load and cache assignments for showing counts/details
  final assignments = await _assignmentService.getAssignments();
  _assignments = assignments;
  _currentUser = user;

    if (_isAdmin(user)) {
      return projects;
    }

    // Non-admin: filter projects by assigned project id
    final userId = user?['id_usuario']?.toString();
    if (userId == null) return [];

  final assignedProjectIds = assignments
        .where((a) => a['id_usuario']?.toString() == userId)
        .map((a) => a['id_proyecto']?.toString())
        .whereType<String>()
        .toSet();

  _userProjectIds = assignedProjectIds;

    return projects.where((p) => assignedProjectIds.contains(p['id_proyecto']?.toString())).toList();
  }

  void _mostrarFormulario({Map<String, dynamic>? proyecto}) {
    final nombreCtrl = TextEditingController(text: proyecto?['nombre']);
    final respCtrl = TextEditingController(text: proyecto?['responsable']);
    final presuCtrl =
        TextEditingController(text: proyecto?['presupuesto']?.toString());

    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        title: Text(proyecto == null ? 'Nuevo Proyecto' : 'Editar Proyecto'),
        content: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            TextField(
                controller: nombreCtrl,
                decoration: const InputDecoration(labelText: 'Nombre')),
            TextField(
                controller: respCtrl,
                decoration: const InputDecoration(labelText: 'Responsable')),
            TextField(
                controller: presuCtrl,
                decoration: const InputDecoration(labelText: 'Presupuesto'),
              keyboardType:
                const TextInputType.numberWithOptions(decimal: true)),
          ],
        ),
        actions: [
          TextButton(
              onPressed: () => Navigator.pop(context),
              child: const Text('Cancelar')),
          ElevatedButton(
            onPressed: () async {
              try {
                final presupuestoTexto = presuCtrl.text.trim().replaceAll(',', '.');
                final presupuesto = double.tryParse(presupuestoTexto);

                if (presupuesto == null) {
                  if (!context.mounted) return;
                  ScaffoldMessenger.of(context).showSnackBar(
                    const SnackBar(content: Text('Ingresa un presupuesto valido.')),
                  );
                  return;
                }

                final data = {
                  "nombre": nombreCtrl.text,
                  "responsable": respCtrl.text,
                  "fecha_inicio": "2024-01-01",
                  "fecha_fin": "2024-12-31",
                  "presupuesto": presupuesto,
                };
                if (proyecto != null) {
                  data["id_proyecto"] = proyecto["id_proyecto"];
                }

                final ok = proyecto == null
                    ? await _service.saveProyecto(data)
                    : await _service.updateProyecto(data);

                if (ok) {
                  setState(() {});
                  if (!context.mounted) return;
                  Navigator.pop(context);
                }
              } catch (e) {
                if (!context.mounted) return;
                ScaffoldMessenger.of(context).showSnackBar(
                  SnackBar(content: Text('Error al guardar proyecto: $e')),
                );
              }
            },
            child: const Text('Guardar'),
          )
        ],
      ),
    );
  }

  void _generarReporte(Map<String, dynamic> proyecto) async {
    try {
      final idProyecto = int.tryParse(proyecto['id_proyecto'].toString());
      if (idProyecto == null) {
        return;
      }

      // Realizar la petición al endpoint
      await _reportService.getFinancialReport(
        idProyecto: idProyecto,
      );

      // Mostrar confirmación breve
      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          content: Text('Reporte enviado'),
          duration: Duration(seconds: 1),
        ),
      );
    } catch (e) {
      // No mostrar nada en caso de error
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Proyectos')),
      body: FutureBuilder<List<dynamic>>(
        future: _loadProjectsForUser(),
        builder: (context, snapshot) {
          if (snapshot.connectionState == ConnectionState.waiting) {
            return const Center(child: CircularProgressIndicator());
          }
          if (snapshot.hasError) {
            return Center(child: Text('Error: ${snapshot.error}'));
          }
          final data = snapshot.data ?? [];
          if (data.isEmpty) {
            return const Center(child: Text('No hay proyectos.'));
          }
          return ListView.builder(
            itemCount: data.length,
            itemBuilder: (context, i) {
              final p = data[i];
              return Card(
                margin: const EdgeInsets.symmetric(vertical: 8.0),
                child: Padding(
                  padding: const EdgeInsets.all(12.0),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      // Título del proyecto
                      Text(
                        p['nombre'],
                        style: const TextStyle(fontSize: 16, fontWeight: FontWeight.bold),
                      ),
                      const SizedBox(height: 8),
                      
                      // Detalles
                      Text("Responsable: ${p['responsable']}"),
                      const SizedBox(height: 4),
                      Builder(builder: (context) {
                        final projectId = p['id_proyecto']?.toString();
                        final count = _assignments.where((a) => a['id_proyecto']?.toString() == projectId).length;
                        return Text('Asignados: $count');
                      }),
                      const SizedBox(height: 12),
                      
                      // Botones debajo
                      Row(
                        mainAxisAlignment: MainAxisAlignment.spaceBetween,
                        children: [
                          IconButton(
                            icon: const Icon(Icons.group, color: Colors.orange),
                            tooltip: 'Ver asignados',
                            onPressed: () {
                              final projectId = p['id_proyecto']?.toString();
                              final assigned = _assignments.where((a) => a['id_proyecto']?.toString() == projectId).toList();
                              showDialog(
                                context: context,
                                builder: (context) => AlertDialog(
                                  title: Text('Asignados - ${p['nombre']}'),
                                  content: SizedBox(
                                    width: double.maxFinite,
                                    child: assigned.isEmpty
                                        ? const Text('No hay usuarios asignados.')
                                        : ListView.builder(
                                            shrinkWrap: true,
                                            itemCount: assigned.length,
                                            itemBuilder: (context, idx) {
                                              final a = assigned[idx];
                                              return ListTile(
                                                title: Text(a['usuario']?.toString() ?? a['nombre_usuario']?.toString() ?? 'Usuario'),
                                                subtitle: Text('ID: ${a['id_usuario'] ?? ''}'),
                                              );
                                            },
                                          ),
                                  ),
                                  actions: [
                                    TextButton(onPressed: () => Navigator.pop(context), child: const Text('Cerrar')),
                                  ],
                                ),
                              );
                            },
                          ),
                          
                          IconButton(
                            icon: const Icon(Icons.list_alt, color: Colors.green),
                            tooltip: 'Administrar Transacciones',
                            onPressed: () {
                              Navigator.push(
                                context,
                                MaterialPageRoute(
                                  builder: (context) => TransaccionesScreen(proyecto: p),
                                ),
                              );
                            },
                          ),
                          
                          IconButton(
                            icon: const Icon(Icons.assessment, color: Colors.purple),
                            tooltip: 'Ver Reporte Financiero',
                            onPressed: () => _generarReporte(p),
                          ),
                          
                          // Role based: admin (id_rol==1) can edit/delete; operator (id_rol==2) can edit/delete for assigned projects; worker (id_rol==3) cannot.
                          Builder(builder: (context) {
                            final user = _currentUser;
                            final idRol = int.tryParse(user?['id_rol']?.toString() ?? '0') ?? 0;
                            final isAdmin = idRol == 1;
                            final isOperator = idRol == 2;
                            
                            final projectId = p['id_proyecto']?.toString();
                            final operatorCanModify = isOperator && _userProjectIds.contains(projectId);

                            if (isAdmin || operatorCanModify) {
                              return Row(
                                mainAxisSize: MainAxisSize.min,
                                children: [
                                  IconButton(
                                    icon: const Icon(Icons.edit, color: Colors.blue),
                                    onPressed: () => _mostrarFormulario(proyecto: p),
                                  ),
                                  IconButton(
                                    icon: const Icon(Icons.delete, color: Colors.red),
                                    onPressed: () async {
                                      await _service.deleteProyecto(int.parse(p['id_proyecto'].toString()));
                                      setState(() {});
                                    },
                                  ),
                                ],
                              );
                            }

                            // Workers: no edit/delete buttons
                            return const SizedBox.shrink();
                          }),
                        ],
                      ),
                    ],
                  ),
                ),
              );
            },
          );
        },
      ),
      floatingActionButton: Builder(builder: (context) {
        final user = _currentUser;
        final idRol = int.tryParse(user?['id_rol']?.toString() ?? '0') ?? 0;
        final isAdmin = idRol == 1;
        // Operators should NOT create new projects globally (per your rules)
        if (!isAdmin) return const SizedBox.shrink();
        return FloatingActionButton(
          onPressed: () => _mostrarFormulario(),
          child: const Icon(Icons.add),
        );
      }),
    );
  }
}