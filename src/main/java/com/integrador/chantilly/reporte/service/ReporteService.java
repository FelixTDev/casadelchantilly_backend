package com.integrador.chantilly.reporte.service;

import com.integrador.chantilly.reporte.dto.AlertaStockDTO;
import com.integrador.chantilly.reporte.dto.DashboardDTO;
import com.integrador.chantilly.reporte.dto.ProductoVentaDTO;
import com.integrador.chantilly.reporte.dto.VentasDiaDTO;
import com.integrador.chantilly.reporte.dto.VentasReporteDTO;
import com.integrador.chantilly.producto.entity.AlertaStock;
import com.integrador.chantilly.producto.repository.AlertaStockRepository;
import jakarta.persistence.EntityManager;
import jakarta.persistence.Query;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

@Service
public class ReporteService {

    private final EntityManager entityManager;
    private final AlertaStockRepository alertaStockRepository;

    public ReporteService(EntityManager entityManager, AlertaStockRepository alertaStockRepository) {
        this.entityManager = entityManager;
        this.alertaStockRepository = alertaStockRepository;
    }

    public VentasReporteDTO getReporteVentas(LocalDate desde, LocalDate hasta) {
        VentasReporteDTO dto = new VentasReporteDTO();

        Query qTotal = entityManager.createNativeQuery(
                "SELECT COUNT(*), COALESCE(SUM(total),0) FROM pedidos WHERE DATE(creado_en) BETWEEN :desde AND :hasta");
        qTotal.setParameter("desde", desde);
        qTotal.setParameter("hasta", hasta);
        Object[] total = (Object[]) qTotal.getSingleResult();
        long totalPedidos = ((Number) total[0]).longValue();
        BigDecimal ingresos = new BigDecimal(total[1].toString());

        dto.setTotalPedidos(totalPedidos);
        dto.setIngresosTotal(ingresos);
        dto.setTicketPromedio(totalPedidos > 0
                ? ingresos.divide(BigDecimal.valueOf(totalPedidos), 2, RoundingMode.HALF_UP)
                : BigDecimal.ZERO);

        Query qEntregados = entityManager.createNativeQuery(
                "SELECT COUNT(*) FROM pedidos WHERE estado = 'ENTREGADO' AND DATE(creado_en) BETWEEN :desde AND :hasta");
        qEntregados.setParameter("desde", desde);
        qEntregados.setParameter("hasta", hasta);
        dto.setPedidosEntregados(((Number) qEntregados.getSingleResult()).longValue());

        Query qCancelados = entityManager.createNativeQuery(
                "SELECT COUNT(*) FROM pedidos WHERE estado = 'CANCELADO' AND DATE(creado_en) BETWEEN :desde AND :hasta");
        qCancelados.setParameter("desde", desde);
        qCancelados.setParameter("hasta", hasta);
        dto.setPedidosCancelados(((Number) qCancelados.getSingleResult()).longValue());

        Query qDia = entityManager.createNativeQuery(
                "SELECT DATE(creado_en) as fecha, COUNT(*), COALESCE(SUM(total),0) FROM pedidos " +
                "WHERE DATE(creado_en) BETWEEN :desde AND :hasta GROUP BY DATE(creado_en) ORDER BY fecha ASC");
        qDia.setParameter("desde", desde);
        qDia.setParameter("hasta", hasta);
        @SuppressWarnings("unchecked")
        List<Object[]> rows = qDia.getResultList();
        List<VentasDiaDTO> detalle = new ArrayList<>();
        for (Object[] row : rows) {
            detalle.add(new VentasDiaDTO(row[0].toString(), ((Number) row[1]).longValue(), new BigDecimal(row[2].toString())));
        }
        dto.setDetallePorFecha(detalle);

        return dto;
    }

    @SuppressWarnings("unchecked")
    public List<ProductoVentaDTO> getProductosMasVendidos() {
        Query q = entityManager.createNativeQuery(
                "SELECT p.id, p.nombre, COALESCE(c.nombre, 'Sin categoría') as categoria, " +
                "SUM(pi.cantidad) as total_vendido, SUM(pi.subtotal) as ingresos " +
                "FROM pedido_items pi " +
                "JOIN productos p ON pi.id_producto = p.id " +
                "LEFT JOIN categorias c ON p.id_categoria = c.id " +
                "JOIN pedidos pe ON pi.id_pedido = pe.id " +
                "WHERE pe.estado != 'CANCELADO' " +
                "GROUP BY p.id, p.nombre, c.nombre " +
                "ORDER BY total_vendido DESC LIMIT 10");
        List<Object[]> rows = q.getResultList();
        List<ProductoVentaDTO> result = new ArrayList<>();
        for (Object[] row : rows) {
            ProductoVentaDTO dto = new ProductoVentaDTO();
            dto.setId(((Number) row[0]).intValue());
            dto.setNombre((String) row[1]);
            dto.setCategoria((String) row[2]);
            dto.setTotalVendido(((Number) row[3]).longValue());
            dto.setIngresosGenerados(new BigDecimal(row[4].toString()));
            result.add(dto);
        }
        return result;
    }

    @SuppressWarnings("unchecked")
    public Map<String, Long> getPedidosPorEstado() {
        Query q = entityManager.createNativeQuery(
                "SELECT estado, COUNT(*) FROM pedidos GROUP BY estado ORDER BY COUNT(*) DESC");
        List<Object[]> rows = q.getResultList();
        Map<String, Long> result = new LinkedHashMap<>();
        for (Object[] row : rows) {
            result.put((String) row[0], ((Number) row[1]).longValue());
        }
        return result;
    }

    @SuppressWarnings("unchecked")
    public Map<String, BigDecimal> getIngresosPorMetodoPago() {
        Query q = entityManager.createNativeQuery(
                "SELECT p.metodo_pago, COALESCE(SUM(p.monto),0) FROM pagos p " +
                "WHERE p.estado_pago = 'CONFIRMADO' GROUP BY p.metodo_pago ORDER BY SUM(p.monto) DESC");
        List<Object[]> rows = q.getResultList();
        Map<String, BigDecimal> result = new LinkedHashMap<>();
        for (Object[] row : rows) {
            result.put((String) row[0], new BigDecimal(row[1].toString()));
        }
        return result;
    }

    public List<AlertaStockDTO> getAlertasStockActivas() {
        List<AlertaStock> alertas = alertaStockRepository.findByAtendidoFalseOrderByIdDesc();
        List<AlertaStockDTO> result = new ArrayList<>();
        for (AlertaStock a : alertas) {
            AlertaStockDTO dto = new AlertaStockDTO();
            dto.setId(a.getId());
            dto.setProductoId(a.getProducto().getId());
            dto.setNombreProducto(a.getProducto().getNombre());
            dto.setStockActual(a.getStockActual());
            dto.setStockMinimo(a.getStockMinimo());
            dto.setCreadoEn(a.getCreadoEn());
            result.add(dto);
        }
        return result;
    }

    @Transactional
    public void marcarAlertaAtendida(Integer alertaId) {
        AlertaStock alerta = alertaStockRepository.findById(alertaId)
                .orElseThrow(() -> new RuntimeException("Alerta no encontrada"));
        alerta.setAtendido(true);
        alertaStockRepository.save(alerta);
    }

    public DashboardDTO getDashboard() {
        DashboardDTO dto = new DashboardDTO();

        LocalDate hoy = LocalDate.now();

        Query qHoy = entityManager.createNativeQuery(
                "SELECT COUNT(*), COALESCE(SUM(total),0) FROM pedidos WHERE DATE(creado_en) = :hoy AND estado != 'CANCELADO'");
        qHoy.setParameter("hoy", hoy);
        Object[] hoyRow = (Object[]) qHoy.getSingleResult();
        dto.setVentasHoyCantidad(((Number) hoyRow[0]).longValue());
        dto.setVentasHoyTotal(new BigDecimal(hoyRow[1].toString()));

        Query qPend = entityManager.createNativeQuery(
                "SELECT COUNT(*) FROM pedidos WHERE estado = 'PENDIENTE'");
        dto.setPedidosPendientes(((Number) qPend.getSingleResult()).longValue());

        dto.setAlertasStockActivas(alertaStockRepository.countByAtendidoFalse());

        Query qClientes = entityManager.createNativeQuery(
                "SELECT COUNT(*) FROM usuarios u JOIN roles r ON u.id_rol = r.id WHERE r.nombre = 'CLIENTE'");
        dto.setTotalClientes(((Number) qClientes.getSingleResult()).longValue());

        Query qConversion = entityManager.createNativeQuery(
                "SELECT " +
                        "COUNT(DISTINCT p.id) AS total_pedidos, " +
                        "COUNT(DISTINCT CASE WHEN pa.estado_pago = 'CONFIRMADO' THEN p.id END) AS pedidos_confirmados " +
                "FROM pedidos p " +
                "LEFT JOIN pagos pa ON pa.id_pedido = p.id " +
                "WHERE p.estado != 'CANCELADO'");
        Object[] conversion = (Object[]) qConversion.getSingleResult();
        long totalPedidos = ((Number) conversion[0]).longValue();
        long pedidosConfirmados = ((Number) conversion[1]).longValue();
        dto.setTasaConversion(totalPedidos > 0
                ? BigDecimal.valueOf(pedidosConfirmados * 100.0 / totalPedidos).setScale(2, RoundingMode.HALF_UP)
                : BigDecimal.ZERO);

        Query qCanal = entityManager.createNativeQuery(
                "SELECT modalidad_entrega, COALESCE(AVG(total), 0) " +
                "FROM pedidos WHERE estado != 'CANCELADO' GROUP BY modalidad_entrega");
        @SuppressWarnings("unchecked")
        List<Object[]> canales = qCanal.getResultList();
        dto.setTicketDelivery(BigDecimal.ZERO);
        dto.setTicketRecojoTienda(BigDecimal.ZERO);
        for (Object[] row : canales) {
            String canal = row[0] == null ? "" : row[0].toString();
            BigDecimal ticket = new BigDecimal(row[1].toString()).setScale(2, RoundingMode.HALF_UP);
            if ("DELIVERY".equalsIgnoreCase(canal)) {
                dto.setTicketDelivery(ticket);
            } else if ("RECOJO_TIENDA".equalsIgnoreCase(canal)) {
                dto.setTicketRecojoTienda(ticket);
            }
        }

        Query qEntrega = entityManager.createNativeQuery(
                "SELECT COALESCE(AVG(TIMESTAMPDIFF(MINUTE, p.creado_en, h.creado_en)) / 60, 0) " +
                "FROM pedidos p " +
                "JOIN historial_estados h ON h.id_pedido = p.id AND h.estado = 'ENTREGADO'");
        Number avgEntregaHoras = (Number) qEntrega.getSingleResult();
        dto.setTiempoEntregaPromedioHoras(
                BigDecimal.valueOf(avgEntregaHoras.doubleValue()).setScale(2, RoundingMode.HALF_UP)
        );

        LocalDate hace7 = hoy.minusDays(6);
        Query qSemana = entityManager.createNativeQuery(
                "SELECT DATE(creado_en), COUNT(*), COALESCE(SUM(total),0) FROM pedidos " +
                "WHERE DATE(creado_en) BETWEEN :desde AND :hasta AND estado != 'CANCELADO' " +
                "GROUP BY DATE(creado_en) ORDER BY DATE(creado_en) ASC");
        qSemana.setParameter("desde", hace7);
        qSemana.setParameter("hasta", hoy);
        @SuppressWarnings("unchecked")
        List<Object[]> rows = qSemana.getResultList();
        List<VentasDiaDTO> semana = new ArrayList<>();
        for (Object[] row : rows) {
            semana.add(new VentasDiaDTO(row[0].toString(), ((Number) row[1]).longValue(), new BigDecimal(row[2].toString())));
        }
        dto.setVentasSemana(semana);

        return dto;
    }
}
