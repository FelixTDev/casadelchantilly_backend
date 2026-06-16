package com.integrador.chantilly.reporte.controller;

import com.integrador.chantilly.reporte.dto.AlertaStockDTO;
import com.integrador.chantilly.reporte.dto.DashboardDTO;
import com.integrador.chantilly.reporte.dto.ProductoVentaDTO;
import com.integrador.chantilly.reporte.dto.VentasReporteDTO;
import com.integrador.chantilly.reporte.service.ReporteService;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/reportes")
public class ReporteController {

    private final ReporteService reporteService;

    public ReporteController(ReporteService reporteService) {
        this.reporteService = reporteService;
    }

    @GetMapping("/ventas")
    public ResponseEntity<VentasReporteDTO> getReporteVentas(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate desde,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate hasta) {
        return ResponseEntity.ok(reporteService.getReporteVentas(desde, hasta));
    }

    @GetMapping("/productos-vendidos")
    public ResponseEntity<List<ProductoVentaDTO>> getProductosMasVendidos() {
        return ResponseEntity.ok(reporteService.getProductosMasVendidos());
    }

    @GetMapping("/pedidos-por-estado")
    public ResponseEntity<Map<String, Long>> getPedidosPorEstado() {
        return ResponseEntity.ok(reporteService.getPedidosPorEstado());
    }

    @GetMapping("/ingresos-por-pago")
    public ResponseEntity<Map<String, BigDecimal>> getIngresosPorMetodoPago() {
        return ResponseEntity.ok(reporteService.getIngresosPorMetodoPago());
    }

    @GetMapping("/alertas-stock")
    public ResponseEntity<List<AlertaStockDTO>> getAlertasStock() {
        return ResponseEntity.ok(reporteService.getAlertasStockActivas());
    }

    @PutMapping("/alertas-stock/{id}")
    public ResponseEntity<Void> marcarAlertaAtendida(@PathVariable Integer id) {
        reporteService.marcarAlertaAtendida(id);
        return ResponseEntity.ok().build();
    }

    @GetMapping("/dashboard")
    public ResponseEntity<DashboardDTO> getDashboard() {
        return ResponseEntity.ok(reporteService.getDashboard());
    }
}
