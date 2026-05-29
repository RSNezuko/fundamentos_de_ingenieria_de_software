import 'dart:convert';
import 'package:http/http.dart' as http;
import 'package:shared_preferences/shared_preferences.dart';

class ReportService {
  static const String baseUrl = 'https://app.blockcode.site/api/v1/reports';

  Future<Map<String, String>> _getHeaders() async {
    final prefs = await SharedPreferences.getInstance();
    final token = prefs.getString('auth_token') ?? '';
    
    return {
      'Content-Type': 'application/json',
      'Authorization': 'Bearer $token',
    };
  }

  /// Obtiene el reporte financiero de un proyecto
  Future<Map<String, dynamic>> getFinancialReport({
    required int idProyecto,
    String? fechaInicio,
    String? fechaFin,
  }) async {
    try {
      final headers = await _getHeaders();
      String url = '$baseUrl/financial_report.php?id_proyecto=$idProyecto';
      
      if (fechaInicio != null) {
        url += '&fecha_inicio=$fechaInicio';
      }
      if (fechaFin != null) {
        url += '&fecha_fin=$fechaFin';
      }

      final resp = await http.get(Uri.parse(url), headers: headers)
        .timeout(const Duration(seconds: 10));
      
      if (resp.statusCode == 200) {
        final data = json.decode(resp.body);
        if (data['success'] == true) {
          return data;
        }
        throw Exception(data['message'] ?? 'Error al obtener reporte');
      }
      throw Exception('HTTP ${resp.statusCode} al obtener reporte: ${resp.body}');
    } catch (e) {
      throw Exception('Error al cargar reporte financiero: $e');
    }
  }

  /// Descarga el reporte en PDF de un proyecto
  Future<String> downloadFinancialReportPDF({
    required int idProyecto,
  }) async {
    try {
      final headers = await _getHeaders();
      final url = '$baseUrl/financial_report_pdf.php?id_proyecto=$idProyecto';

      final resp = await http.get(Uri.parse(url), headers: headers)
        .timeout(const Duration(seconds: 15));
      
      if (resp.statusCode == 200) {
        // Retorna la URL para descargar o abrir el PDF
        return url;
      }
      throw Exception('HTTP ${resp.statusCode} al descargar PDF: ${resp.body}');
    } catch (e) {
      throw Exception('Error al descargar reporte PDF: $e');
    }
  }
}
